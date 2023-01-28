const Configuration = require('../../models/configuration')

module.exports = {
  Query: {
    configuration: async(_, args, context) => {
      const configuration = await Configuration.findOne()
      if (!configuration) {
        return {
          _id: '',
          order_id_prefix: '',
          mongodb_url: '',
          email: '',
          password: '',
          enable_email: true,
          client_id: '',
          client_secret: '',
          sandbox: false,
          publishable_key: '',
          secret_key: '',
          delivery_charges: 0,
          currency: '',
          currency_symbol: ''
        }
      }
      return {
        ...configuration._doc,
        _id: configuration.id
      }
    }
  },
  Mutation: {
    saveOrderConfiguration: async(_, args, context) => {
      console.log('saveOrderConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.order_id_prefix = args.configurationInput.order_id_prefix
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveEmailConfiguration: async(_, args, context) => {
      console.log('saveEmailConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.email = args.configurationInput.email
      configuration.password = args.configurationInput.password
      configuration.enable_email = args.configurationInput.enable_email
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveMongoConfiguration: async(_, args, context) => {
      console.log('saveMongoConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.mongodb_url = args.configurationInput.mongodb_url
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    uploadToken: async(_, args, context) => {
      console.log(args.pushToken)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.push_token = args.pushToken
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    savePaypalConfiguration: async(_, args, context) => {
      console.log('savePaypalConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.client_id = args.configurationInput.client_id
      configuration.client_secret = args.configurationInput.client_secret
      configuration.sandbox = args.configurationInput.sandbox
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveStripeConfiguration: async(_, args, context) => {
      console.log('saveStripeConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.publishable_key = args.configurationInput.publishable_key
      configuration.secret_key = args.configurationInput.secret_key
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveDeliveryConfiguration: async(_, args, context) => {
      console.log('saveDeliveryConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.delivery_charges = args.configurationInput.delivery_charges
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveCurrencyConfiguration: async(_, args, context) => {
      console.log('saveCurrencyConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.currency = args.configurationInput.currency
      configuration.currency_symbol = args.configurationInput.currency_symbol
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    }
  }
}
