const Food = require('../../models/food')
const User = require('../../models/user')
const Rider = require('../../models/rider')
const Category = require('../../models/category')
const Item = require('../../models/item')
const Variation = require('../../models/variation')
const Review = require('../../models/review')
const Option = require('../../models/option')
const Order = require('../../models/order')
const Addon = require('../../models/addon')
const Address = require('../../models/address')
const { dateToString } = require('../../helpers/date')

const variations = async variationIds => {
  try {
    const result = await Variation.find({ _id: { $in: variationIds } })
    return result.map(doc => {
      return transformVariation(doc)
    })
  } catch (err) {
    throw err
  }
}
const transformVariation = variation => {
  return {
    ...variation._doc,
    _id: variation.id,
    addons: addons.bind(this, variation.addons)
  }
}

const foods = async foodIds => {
  try {
    const foods = await Food.find({ _id: { $in: foodIds } })
    foods.sort((a, b) => {
      return (
        foodIds.indexOf(a._id.toString()) - foodIds.indexOf(b._id.toString())
      )
    })
    return foods.map(food => {
      return transformFood(food)
    })
  } catch (err) {
    throw err
  }
}

const item = async itemId => {
  try {
    const item = await Item.findById(itemId)

    const food = await singleFood(item.food)

    return {
      _id: item.id,
      quantity: item.quantity,
      variation: await variation.bind(this, item.variation),
      addons: await item.addons.map(orderAddon),
      food
    }
  } catch (err) {
    throw err
  }
}

const variation = async variationId => {
  try {
    const variation = await Variation.findById(variationId.toString())
    return {
      ...variation._doc,
      _id: variation.id
    }
  } catch (err) {
    throw err
  }
}

const singleFood = async foodId => {
  try {
    const food = await Food.findById(foodId.toString())
    return {
      ...food._doc,
      _id: food.id,
      variations: variations.bind(this, food.variations),
      category: category.bind(this, food.category)
      // variations function here
    }
  } catch (err) {
    throw err
  }
}

const user = async userId => {
  try {
    const user = await User.findById(userId.toString())
    return {
      ...user._doc,
      _id: user.id
    }
  } catch (err) {
    throw err
  }
}
const rider = async riderId => {
  try {
    const rider = await Rider.findById(riderId.toString())
    return {
      ...rider._doc,
      _id: rider.id
    }
  } catch (err) {
    throw err
  }
}
const category = async category => {
  try {
    const result = await Category.findOne({ _id: category })
    return {
      ...result._doc,
      _id: result.id
    }
  } catch (err) {
    throw err
  }
}

const transformFood = food => {
  return {
    ...food._doc,
    _id: food.id,
    category: category.bind(this, food.category),
    variations: variations.bind(this, food.variations)
  }
}

const review = async reviewId => {
  const review = await Review.findById(reviewId)
  if (!review) {
    return {
      _id: '0',
      rating: 0,
      description: ''
    }
  }
  return {
    ...review._doc,
    _id: review.id,
    createdAt: dateToString(review._doc.createdAt),
    updatedAt: dateToString(review._doc.updatedAt)
  }
}

const transformFoods = async foodIds => {
  return await foods(foodIds)
}

const transformStatusQueue = status_queue => {
  Object.keys(status_queue).forEach(function(key) {
    status_queue[key] = status_queue[key]
      ? dateToString(status_queue[key])
      : null
  })
  return status_queue
}

const transformOrder = async order => {
  return {
    ...order._doc,
    _id: order.id,
    review: await review.bind(this, order.review),
    user: await user.bind(this, order._doc.user),
    items: await order._doc.items.map(item),
    rider: order._doc.rider ? await rider.bind(this, order._doc.rider) : null,
    status_queue: await transformStatusQueue.bind(this, order.status_queue),
    createdAt: await dateToString(order._doc.createdAt),
    updatedAt: await dateToString(order._doc.updatedAt)
  }
}

const transformCategory = category => {
  return {
    ...category._doc,
    _id: category.id
  }
}

const transformReview = order => {
  return {
    ...order._doc,
    _id: order.id,
    review: {
      ...order.review._doc,
      _id: order.review.id,
      order: order.id
    }
  }
}
const order = async orderId => {
  const order = await Order.findById(orderId)
  return transformOrder(order)
}

const transformAllReview = async review => {
  return {
    ...review._doc,
    _id: review.id,
    order: await order.bind(this, review.order)
  }
}

const transformReviews = orders => {
  return orders.map(order => ({
    ...order._doc,
    _id: order.id,
    review: order.review
      ? {
        ...order.review._doc,
        _id: order.review.id
      }
      : {
        _id: '0',
        rating: 0,
        description: '',
        order: order.id,
        is_active: true
      }
  }))
}

const transformOption = async option => {
  return {
    ...option._doc,
    _id: option.id
  }
}
const transformOrderOption = option => {
  return {
    ...option._doc,
    __typename: 'ItemOption',
    _id: option.id
  }
}

const options = async optionIds => {
  const options = await Option.find({
    _id: { $in: optionIds },
    is_active: true
  })
  return options.map(transformOption)
}

const orderOption = async optionId => {
  const option = await Option.findById(optionId)
  return transformOrderOption(option)
}

const addons = async addonIds => {
  const addons = await Addon.find({ _id: { $in: addonIds }, is_active: true })
  return addons.map(transformAddon)
}

const orderAddon = async addonInput => {
  const addon = await Addon.findById(addonInput._id)
  return {
    ...addon._doc,
    __typename: 'ItemAddon',
    _id: addon.id,
    options: await addonInput.options.map(orderOption)
  }
}

const transformAddon = async addon => {
  return {
    ...addon._doc,
    _id: addon.id,
    options: options.bind(this, addon.options)
  }
}

const transformUser = async user => {
  return {
    ...user._doc,
    password: null,
    _id: user.id,
    addresses: populateAddresses.bind(this, user.addresses)
  }
}

const populateAddresses = async addressIds => {
  const addresses = await Address.find({
    _id: { $in: addressIds },
    is_active: true
  }).sort({ createdAt: -1 })
  return addresses.map(address => ({
    ...address._doc,
    _id: address.id
  }))
}

exports.transformCategory = transformCategory
exports.transformFood = transformFood
exports.transformFoods = transformFoods
exports.transformOrder = transformOrder
exports.transformReviews = transformReviews
exports.transformReview = transformReview
exports.transformAllReview = transformAllReview
exports.transformOption = transformOption
exports.transformAddon = transformAddon
exports.transformUser = transformUser
