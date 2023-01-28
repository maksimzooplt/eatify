const { Expo } = require('expo-server-sdk')
const jwt = require('jsonwebtoken')
const { withFilter } = require('apollo-server-express')
const Rider = require('../../models/rider')
const User = require('../../models/user')
const Order = require('../../models/order')
const { transformOrder } = require('../resolvers/merge')
const { sendNotificationMobile } = require('../../helpers/utilities')
const {
  pubsub,
  publishToUser,
  publishToDashboard,
  publishToAssignedRider,
  publishToAllRiders,
  publishRiderLocation,
  RIDER_LOCATION
} = require('../../helpers/pubsub')

module.exports = {
  Subscription: {
    subscriptionRiderLocation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(RIDER_LOCATION),
        (payload, args) => {
          // console.log(payload)
          const riderId = payload.subscriptionRiderLocation._id
          return riderId === args.riderId
        }
      )
    }
  },
  Query: {
    riders: async(_, args, context) => {
      console.log('riders')
      try {
        const riders = await Rider.find({ is_active: true })
        return riders.map(rider => ({
          ...rider._doc,
          _id: rider.id
        }))
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    rider: async(_, args, { req, res }) => {
      console.log('riders', args.id, req.userId, req.isAuth)
      try {
        const userId = args.id || req.userId
        if (!userId) {
          throw new Error('Unauthenticated!')
        }
        const rider = await Rider.findById(userId)
        return {
          ...rider._doc,
          _id: rider.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    availableRiders: async(_, args, context) => {
      console.log('riders')
      try {
        const riders = await Rider.find({ is_active: true, available: true })
        return riders.map(rider => ({
          ...rider._doc,
          _id: rider.id
        }))
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    assignedOrders: async(_, args, { req, res }) => {
      console.log('assignedOrders', args.id || req.userId)
      const userId = args.id || req.userId
      if (!userId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const riderOrders = await Order.find({
          rider: req.userId,
          $or: [
            { order_status: 'ACCEPTED' },
            { order_status: 'PICKED' },
            { order_status: 'DELIVERED' }
          ]
        }).sort({ createdAt: -1 })
        return riderOrders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createRider: async(_, args, context) => {
      console.log('createRider')
      try {
        // check username, if already exists throw error
        const checkUsername = await Rider.countDocuments({
          username: args.riderInput.username
        })
        if (checkUsername) {
          throw new Error(
            'Username already associated with another rider account'
          )
        }
        const checkPhone = await Rider.countDocuments({
          phone: args.riderInput.phone
        })
        if (checkPhone) {
          throw new Error('Phone already associated with another rider account')
        }
        // const image = await processUpload(args.riderInput.image)
        const rider = new Rider({
          name: args.riderInput.name,
          username: args.riderInput.username,
          password: args.riderInput.password,
          phone: args.riderInput.phone,
          available: args.riderInput.available,
          notificationToken: ''
        })

        const result = await rider.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editRider: async(_, args, context) => {
      console.log('editRider')
      try {
        const checkUsername = await Rider.find({
          username: args.riderInput.username
        })
        if (
          checkUsername.length > 1 ||
          (checkUsername.length === 1 &&
            checkUsername[0].id !== args.riderInput._id)
        ) {
          throw new Error('Username associated with another rider account')
        }
        const checkPhone = await Rider.find({ phone: args.riderInput.phone })
        if (
          checkPhone.length > 1 ||
          (checkPhone.length === 1 && checkPhone[0].id !== args.riderInput._id)
        ) {
          throw new Error('Phone associated with another rider account')
        }

        const rider = await Rider.findOne({ _id: args.riderInput._id })

        rider.name = args.riderInput.name
        rider.username = args.riderInput.username
        rider.phone = args.riderInput.phone
        rider.password = args.riderInput.password
        rider.available = args.riderInput.available

        const result = await rider.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteRider: async(_, { id }, context) => {
      console.log('deleteRider')
      try {
        const rider = await Rider.findById(id)
        rider.is_active = false
        const result = await rider.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        throw err
      }
    },
    riderLogin: async(_, args, context) => {
      console.log('riderLogin', args.username, args.password)
      const rider = await Rider.findOne({ username: args.username })
      if (!rider) throw new Error('Invalid credentials')

      if (rider.password !== args.password) {
        throw new Error('Invalid credentials')
      }
      rider.notificationToken = args.notificationToken
      await rider.save()
      const token = jwt.sign(
        { userId: rider.id, email: rider.username },
        'somesupersecretkey'
      )
      return {
        ...rider._doc,
        email: rider.username,
        password: '',
        userId: rider.id,
        token: token,
        tokenExpiration: 1
      }
    },
    toggleAvailablity: async(_, args, { req, res }) => {
      console.log('toggleAvailablity')
      const userId = args.id || req.userId // if rider: get id from req, args otherwise
      if (!userId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const rider = await Rider.findById(userId)
        rider.available = !rider.available
        const result = await rider.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        throw err
      }
    },
    updateOrderStatusRider: async(_, args, { req, res }) => {
      console.log('updateOrderStatusRider')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const order = await Order.findById(args.id)
        if (args.status === 'DELIVERED') {
          order.payment_status = 'PAID'
        }
        order.order_status = args.status
        order.status_queue[args.status.toLowerCase()] = new Date()
        order.markModified('status_queue')
        const result = await order.save()

        const transformedOrder = await transformOrder(result)

        publishToAssignedRider(req.userId, transformedOrder, 'remove')
        publishToDashboard(transformedOrder, 'update')
        publishToUser(result.user.toString(), transformedOrder, 'update')

        if (result.order_status === 'DELIVERED') {
          await Rider.updateMany(
            { assigned: { $in: [result.id] } },
            { $pull: { assigned: { $in: [result.id] } } }
          )
          await Rider.updateOne(
            { _id: req.userId },
            { $push: { delivered: result.id } }
          )
        }
        User.findById(result.user)
          .then(user => {
            if (!user.notifications) user.notifications = []
            user.notifications.unshift({
              _id: result.id,
              order: result.order_id,
              status: result.order_status
            })
            if (user.notifications.length > 10) {
              user.notifications = user.notifications.slice(0, 10)
            }
            user.markModified('notifications')
            user
              .save()
              .then(updatedUser => {
                console.log('user updated with notifications')
              })
              .catch(() => {
                console.log(
                  'An error occured while updating user notifications'
                )
              })

            if (user.notificationToken) {
              const messages = []
              if (Expo.isExpoPushToken(user.notificationToken)) {
                console.log('valid token')
                messages.push({
                  to: user.notificationToken,
                  sound: 'default',
                  body:
                    'Order-ID ' + result.order_id + ' ' + result.order_status,
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
          .catch(err => {
            console.log('an error occured while sending notifications', err)
          })
        return transformedOrder
      } catch (err) {
        throw err
      }
    },
    assignOrder: async(_, args, { req, res }) => {
      console.log('assignOrder', args.id, req.userId)
      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        if (order.rider) {
          throw new Error('Order was assigned to someone else.')
        }
        order.rider = req.userId
        const result = await order.save()
        const transformedOrder = await transformOrder(result)

        publishToAssignedRider(req.userId, transformedOrder, 'new')
        publishToAllRiders(transformedOrder, 'remove')
        publishToDashboard(transformedOrder, 'update')
        return transformedOrder
      } catch (error) {
        throw error
      }
    },
    updateRiderLocation: async(_, args, { req, res }) => {
      console.log('updateRiderLocation', req.userId)
      if (!req.userId) {
        throw new Error('Unauthenticated!')
      }

      const rider = await Rider.findById(req.userId)
      if (!rider) {
        throw new Error('Unauthenticated!')
      }

      rider.location = {
        latitude: args.latitude,
        longitude: args.longitude
      }
      const result = await rider.save()

      publishRiderLocation({ ...result._doc, _id: result.id })
      return {
        ...result._doc,
        _id: result.id
      }
    }
  }
}
