const authResolver = require('./auth')
const foodResolver = require('./food')
const orderResolver = require('./order')
const categoryResolver = require('./category')
const configurationResolver = require('./configuration')
const riderResolver = require('./rider')
const optionResolver = require('./option')
const addonResolver = require('./addon')
const couponResolver = require('./coupon')
const dashboardResolver = require('./dashboard')
const notificationResolver = require('./notification')

const rootResolver = {
  Query: {
    ...dashboardResolver.Query,
    ...authResolver.Query,
    ...foodResolver.Query,
    ...orderResolver.Query,
    ...categoryResolver.Query,
    ...configurationResolver.Query,
    ...riderResolver.Query,
    ...optionResolver.Query,
    ...addonResolver.Query,
    ...couponResolver.Query
  },
  Subscription: {
    ...orderResolver.Subscription,
    ...riderResolver.Subscription
  },
  Mutation: {
    ...authResolver.Mutation,
    ...foodResolver.Mutation,
    ...orderResolver.Mutation,
    ...categoryResolver.Mutation,
    ...configurationResolver.Mutation,
    ...riderResolver.Mutation,
    ...optionResolver.Mutation,
    ...addonResolver.Mutation,
    ...couponResolver.Mutation,
    ...notificationResolver.Mutation
  }
}

module.exports = rootResolver
