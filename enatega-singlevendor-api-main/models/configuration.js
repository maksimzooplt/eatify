const mongoose = require('mongoose')

const Schema = mongoose.Schema

const configurationSchema = new Schema(
  {
    order_id: {
      type: Number,
      default: 1,
      required: true
    },
    order_id_prefix: {
      type: String,
      default: 'FD-'
    },
    push_token: {
      type: String
    },
    mongodb_url: {
      type: String
    },
    email: {
      type: String
    },
    password: {
      type: String
    },
    enable_email: {
      type: Boolean
    },
    client_id: {
      type: String
    },
    client_secret: {
      type: String
    },
    sandbox: {
      type: Boolean
    },
    publishable_key: {
      type: String
    },
    secret_key: {
      type: String
    },
    delivery_charges: {
      type: Number
    },
    currency: {
      type: String
    },
    currency_symbol: {
      type: String
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Configuration', configurationSchema)
