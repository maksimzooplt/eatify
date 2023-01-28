const { Expo } = require('expo-server-sdk')
const { withFilter } = require('apollo-server-express')
const User = require('../../models/user')
const Rider = require('../../models/rider')
const Order = require('../../models/order')
const Item = require('../../models/item')
const Option = require('../../models/option')
const Review = require('../../models/review')
const Coupon = require('../../models/coupon')
const Configuration = require('../../models/configuration')
const Paypal = require('../../models/paypal')
const Stripe = require('../../models/stripe')
const {
  transformOrder,
  transformReviews,
  transformAllReview
} = require('./merge')
const { payment_status, order_status } = require('../../helpers/enum')
const sendEmail = require('../../helpers/email')
const {
  sendNotification,
  sendNotificationMobile,
  updateStockValue
} = require('../../helpers/utilities')
const {
  placeOrderTemplate,
  placeOrderText
} = require('../../helpers/templates')
const {
  pubsub,
  publishToUser,
  publishToAllRiders,
  publishToAssignedRider,
  publishToDashboard,
  PLACE_ORDER,
  ORDER_STATUS_CHANGED,
  ASSIGN_RIDER,
  UNASSIGNED_ORDER
} = require('../../helpers/pubsub')

var DELIVERY_CHARGES = 0.0

module.exports = {
  Subscription: {
    subscribePlaceOrder: {
      subscribe: () => pubsub.asyncIterator(PLACE_ORDER)
    },
    orderStatusChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ORDER_STATUS_CHANGED),
        (payload, args, context) => {
          const userId = payload.orderStatusChanged.userId.toString()
          return userId === args.userId
        }
      )
    },
    subscriptionAssignRider: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ASSIGN_RIDER),
        (payload, args) => {
          const riderId = payload.subscriptionAssignRider.userId.toString()
          return riderId === args.riderId
        }
      )
    },
    unassignedOrder: {
      subscribe: () => pubsub.asyncIterator(UNASSIGNED_ORDER)
    }
  },
  Query: {
    order: async(_, args, { req, res }) => {
      console.log('order')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        return transformOrder(order)
      } catch (err) {
        throw err
      }
    },
    orders: async(_, args, { req, res }) => {
      console.log('orders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(50)
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    undeliveredOrders: async(_, args, { req, res }) => {
      console.log('undeliveredOrders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({
          user: req.userId,
          $or: [
            { order_status: 'PENDING' },
            { order_status: 'PICKED' },
            { order_status: 'ACCEPTED' }
          ]
        }).sort({ createdAt: -1 })
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    deliveredOrders: async(_, args, { req, res }) => {
      console.log('deliveredOrders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({
          user: req.userId,
          $or: [{ order_status: 'DELIVERED' }, { order_status: 'COMPLETED' }]
        }).sort({ createdAt: -1 })
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    allOrders: async(_, args, { req, res }) => {
      try {
        if (args.search) {
          const search = new RegExp(
            // eslint-disable-next-line no-useless-escape
            args.search.replace(/[\\\[\]()+?.*]/g, c => '\\' + c),
            'i'
          )
          const orders = await Order.find({ order_id: search, is_active: true })
          return orders.map(order => {
            return transformOrder(order)
          })
        } else {
          const orders = await Order.find({ is_active: true })
            .sort({ createdAt: -1 })
            .skip((args.page || 0) * args.rows)
            .limit(args.rows)
          return orders.map(order => {
            return transformOrder(order)
          })
        }
      } catch (err) {
        throw err
      }
    },
    orderCount: async(_, args, context) => {
      try {
        const orderCount = await Order.find({
          is_active: true
        }).countDocuments()
        return orderCount
      } catch (err) {
        throw err
      }
    },
    reviews: async(_, args, { req, res }) => {
      console.log('reviews')
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const orders = await Order.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
          .populate('review')
        return transformReviews(orders)
      } catch (err) {
        throw err
      }
    },
    allReviews: async(_, args, { req, res }) => {
      console.log('allReviews')
      try {
        const reviews = await Review.find().sort({ createdAt: -1 })
        return reviews.map(async review => {
          return await transformAllReview(review)
        })
      } catch (err) {
        throw err
      }
    },
    getOrderStatuses: async(_, args, context) => {
      return order_status
    },
    getPaymentStatuses: async(_, args, context) => {
      return payment_status
    },
    unassignedOrders: async(_, args, { req, res }) => {
      console.log('unassignedOrders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({
          order_status: 'ACCEPTED',
          rider: null
        }).sort({ createdAt: -1 })
        return orders.map(transformOrder)
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    placeOrder: async(_, args, { req, res }) => {
      console.log('placeOrder')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const insertedItems = await Item.insertMany(args.orderInput)
        const items = insertedItems.map(({ id }) => id)
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('invalid request')
        }
        // get previous orderid from db
        let configuration = await Configuration.findOne()
        if (!configuration) {
          configuration = new Configuration()
          await configuration.save()
        }
        const orderid =
          configuration.order_id_prefix + (Number(configuration.order_id) + 1)
        configuration.order_id = Number(configuration.order_id) + 1
        await configuration.save()

        DELIVERY_CHARGES = Number(configuration.delivery_charges) || 0

        const itemsFood = await Item.find({ _id: { $in: items } }).populate(
          'food variation'
        )
        let itemsTitle = ''
        let price = 0.0
        let addonsTitle = ''
        let itemsT = []
        itemsT = itemsFood.map(async item => {
          let item_price = item.variation.price
          if (item.addons && item.addons.length > 0) {
            const addons = []
            let optionsAll = []
            item.addons.forEach(({ options }) => {
              optionsAll = optionsAll.concat(options)
            })
            const populatedOptions = await Option.find({
              _id: { $in: optionsAll }
            })
            optionsAll.forEach(id => {
              const option = populatedOptions.find(o => o.id === id)
              item_price = item_price + option.price
              addons.push(
                `${option.title} ${configuration.currency_symbol}${option.price}`
              )
            })
            addonsTitle = addons.join(',')
          }

          price += item_price * item.quantity
          return `${item.quantity} x ${item.food.title}(${item.variation.title}) ${configuration.currency_symbol}${item.variation.price}`
        })
        if (args.couponCode) {
          const coupon = await Coupon.findOne({ code: args.couponCode })
          if (coupon) {
            price = price - (coupon.discount / 100) * price
          }
        }
        const description = await Promise.all(itemsT)
        itemsTitle = description.join(',')

        const orderObj = {
          user: req.userId,
          items: items,
          delivery_address: args.address,
          order_id: orderid,
          paid_amount: 0,
          order_status: 'PENDING',
          delivery_charges: DELIVERY_CHARGES,
          order_amount: (price + DELIVERY_CHARGES).toFixed(2),
          payment_status: payment_status[0],
          coupon: args.couponCode,
          status_queue: {
            pending: new Date(),
            preparing: null,
            picked: null,
            delivered: null,
            cancelled: null
          }
        }

        let result = null
        if (args.paymentMethod === 'COD') {
          const order = new Order(orderObj)
          result = await order.save()
          user.orders.push(result._id)
          await user.save()

          const placeOrder_template = placeOrderTemplate([
            result.order_id,
            itemsTitle,
            result.delivery_address.delivery_address,
            `${configuration.currency_symbol} ${Number(price).toFixed(2)}`,
            `${configuration.currency_symbol} ${DELIVERY_CHARGES}`,
            `${configuration.currency_symbol} ${(
              Number(price) + DELIVERY_CHARGES
            ).toFixed(2)}`,
            addonsTitle
          ])
          const placeOrder_text = placeOrderText([
            result.order_id,
            itemsTitle,
            result.delivery_address.delivery_address,
            `${configuration.currency_symbol} ${Number(price).toFixed(2)}`,
            `${configuration.currency_symbol} ${DELIVERY_CHARGES}`,
            `${configuration.currency_symbol} ${(
              Number(price) + DELIVERY_CHARGES
            ).toFixed(2)}`,
            addonsTitle
          ])

          const transformedOrder = await transformOrder(result)
          publishToUser(req.userId.toString(), transformedOrder, 'new')
          publishToDashboard(transformedOrder, 'new')

          sendEmail(
            user.email,
            'Order Placed',
            placeOrder_text,
            placeOrder_template
          )
          sendNotification(result.order_id)
          updateStockValue(itemsFood)
        } else if (args.paymentMethod === 'PAYPAL') {
          // payment_method[1] = PAYPAL
          orderObj.payment_method = args.paymentMethod
          const paypal = new Paypal(orderObj)
          result = await paypal.save()
        } else if (args.paymentMethod === 'STRIPE') {
          // payment_method[2]=STRIPE
          orderObj.payment_method = args.paymentMethod
          const stripe = new Stripe(orderObj)
          result = await stripe.save()
        } else {
          throw new Error('Invalid Payment Method')
        }

        const orderResult = await transformOrder(result)
        return orderResult
      } catch (err) {
        throw err
      }
    },
    editOrder: async(_, args, { req, res }) => {
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const items = args.orderInput.map(async function(item) {
          const newItem = new Item({
            ...item
          })
          const result = await newItem.save()
          return result._id
        })
        const completed = await Promise.all(items)
        const order = await Order.findOne({ _id: args._id, user: req.userId })
        if (!order) {
          throw new Error('order does not exist')
        }
        order.items = completed
        const result = await order.save()
        return transformOrder(result)
      } catch (err) {
        throw err
      }
    },
    cancelOrder: async(_, args, { req, res }) => {
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args.orderId)
        // instead of deleting order, update order status as cancelled
        await Order.deleteOne({ _id: args.orderId })
        return transformOrder(order)
      } catch (err) {
        throw err
      }
    },
    updateOrderStatus: async(_, args, context) => {
      console.log('updateOrderStatus')
      try {
        const order = await Order.findById(args.id)
        if (args.status === 'DELIVERED') {
          order.payment_status = 'PAID'
        }
        order.order_status = args.status
        order.reason = args.reason
        order.status_queue[args.status.toLowerCase()] = new Date()
        order.markModified('status_queue')
        const result = await order.save()

        const transformedOrder = await transformOrder(result)

        publishToUser(result.user.toString(), transformedOrder, 'update')
        publishToAllRiders(
          transformedOrder,
          args.status === 'ACCEPTED' ? 'new' : 'remove'
        )

        if (result.rider) {
          publishToAssignedRider(
            result.rider.toString(),
            transformedOrder,
            'update'
          )
        }

        if (args.status === 'ACCEPTED') {
          const riders = await Rider.find({ available: true })
          const messages = []
          riders.forEach(async(rider, i) => {
            if (rider.notificationToken) {
              if (Expo.isExpoPushToken(rider.notificationToken)) {
                messages.push({
                  to: rider.notificationToken,
                  sound: 'default',
                  body:
                    'Order-ID ' + result.order_id + ' is ready to be picked',
                  channelId: 'default',
                  data: {
                    _id: result._id,
                    order: result.order_id,
                    status: result.order_status
                  }
                })
              }
            }
          })
          await sendNotificationMobile(messages)
        }

        // can be moved outside
        User.findById(result.user)
          .then(user => {
            if (user.notificationToken && user.is_order_notification) {
              const messages = []
              if (Expo.isExpoPushToken(user.notificationToken)) {
                console.log('valid token')
                messages.push({
                  to: user.notificationToken,
                  sound: 'default',
                  body:
                    'Order-ID ' + result.order_id + ' ' + result.order_status,
                  channelId: 'default',
                  data: {
                    _id: result._id,
                    order: result.order_id,
                    status: result.order_status
                  }
                })
                sendNotificationMobile(messages)
              }
            }
          })
          .catch(() => {
            console.log('an error occured while sending notifications')
          })
        return transformedOrder
      } catch (err) {
        throw err
      }
    },
    updateStatus: async(_, args, context) => {
      console.log('updateStatus', args.id, args.status, args.reason)

      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order not found')
        order.status = args.status
        order.reason = args.reason
        const result = await order.save()
        User.findById(result.user)
          .then(user => {
            if (user.notificationToken && user.is_order_notification) {
              const messages = []
              if (Expo.isExpoPushToken(user.notificationToken)) {
                const body = result.status
                  ? 'Order-ID ' + result.order_id + ' was accepted'
                  : 'Order-ID ' +
                    result.order_id +
                    ' was rejected. Reason: ' +
                    order.reason

                messages.push({
                  to: user.notificationToken,
                  sound: 'default',
                  body,
                  data: {
                    _id: result._id,
                    order: result.order_id,
                    status: result.status ? 'Accepted' : 'Rejected'
                  }
                })
                sendNotificationMobile(messages)
              }
            }
          })
          .catch(() => {
            console.log('an error occured while sending notifications')
          })
        return transformOrder(result)
      } catch (error) {
        throw error
      }
    },
    reviewOrder: async(_, args, { req, res }) => {
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const review = new Review({
          order: args.reviewInput.orderId,
          rating: args.reviewInput.rating,
          description: args.reviewInput.description
        })
        const result = await review.save()
        await Order.findOneAndUpdate(
          { _id: args.reviewInput.orderId },
          { review: result.id }
        )
        const order = await Order.findById(args.reviewInput.orderId)

        return transformOrder(order)
      } catch (err) {
        throw err
      }
    },

    assignRider: async(_, args, context) => {
      console.log('assignRider', args.id, args.riderId)
      try {
        const order = await Order.findById(args.id)
        const rider = await Rider.findById(args.riderId)
        if (!order) throw new Error('Order does not exist')
        if (!rider) throw new Error('Rider does not exist')

        order.rider = args.riderId
        const result = await order.save()
        const transformedOrder = await transformOrder(result)

        Rider.findById(args.riderId)
          .then(rider => {
            if (rider.notificationToken) {
              const messages = []
              if (Expo.isExpoPushToken(rider.notificationToken)) {
                console.log('valid token')
                messages.push({
                  to: rider.notificationToken,
                  sound: 'default',
                  body:
                    'Order-ID ' + result.order_id + ' has been assigned to you',
                  channelId: 'default',
                  data: {
                    _id: result._id,
                    order: result.order_id,
                    status: result.order_status
                  }
                })
                sendNotificationMobile(messages)
              }
            }
          })
          .catch(() => {
            console.log('an error occured while sending notifications')
          })

        publishToAssignedRider(args.riderId, transformedOrder, 'new')
        publishToAllRiders(transformedOrder, 'remove')
        publishToDashboard(transformedOrder, 'update')
        publishToUser(result.user.toString(), transformedOrder, 'update')

        return transformedOrder
      } catch (error) {
        throw error
      }
    },
    updatePaymentStatus: async(_, args, context) => {
      console.log('updatePaymentStatus', args.id, args.status)
      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        order.payment_status = args.status
        order.paid_amount = args.status === 'PAID' ? order.order_amount : 0.0
        const result = await order.save()
        return transformOrder(result)
      } catch (error) {
        throw error
      }
    }
  }
}
