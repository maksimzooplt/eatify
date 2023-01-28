const { PubSub } = require('apollo-server-express')

const PLACE_ORDER = 'PLACE_ORDER'
const ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED'
const ASSIGN_RIDER = 'ASSIGN_RIDER'
const UNASSIGNED_ORDER = 'UNASSIGNED_ORDER'
const RIDER_LOCATION = 'RIDER_LOCATION'

const publishToUser = (userId, order, origin) => {
  const orderStatusChanged = {
    userId,
    order,
    origin
  }
  pubsub.publish(ORDER_STATUS_CHANGED, { orderStatusChanged })
}
const publishToAllRiders = (order, origin) => {
  const unassignedOrder = {
    order,
    origin
  }

  pubsub.publish(UNASSIGNED_ORDER, { unassignedOrder })
}
const publishToAssignedRider = (userId, order, origin) => {
  const subscriptionAssignRider = {
    userId,
    order,
    origin
  }
  pubsub.publish(ASSIGN_RIDER, { subscriptionAssignRider })
}

const publishToDashboard = (order, origin) => {
  const subscribePlaceOrder = {
    order,
    origin
  }
  pubsub.publish(PLACE_ORDER, { subscribePlaceOrder })
}

const publishRiderLocation = rider => {
  pubsub.publish(RIDER_LOCATION, { subscriptionRiderLocation: rider })
}

const pubsub = new PubSub()
module.exports = {
  pubsub,
  PLACE_ORDER,
  ORDER_STATUS_CHANGED,
  ASSIGN_RIDER,
  UNASSIGNED_ORDER,
  RIDER_LOCATION,
  publishToUser,
  publishToAllRiders,
  publishToAssignedRider,
  publishToDashboard,
  publishRiderLocation
}
