const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PaymentTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      default: ''
    },
    payment_type: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentType'
    },
    card_information: {
      name: String,
      credit_card_number: String,
      expiration_date: String,
      cvv: String
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order'
      }
    ],
    facebookId: { type: String },
    appleId: { type: String },
    is_active: {
      type: Boolean,
      default: true
    },
    notificationToken: {
      type: String
    },
    is_order_notification: {
      type: Boolean,
      default: false
    },
    is_offer_notification: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: [],
      default: []
    },
    addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Address'
      }
    ]
  },
  { timestamps: true }
)

module.exports = mongoose.model('PaymentType', PaymentTypeSchema)
module.exports = mongoose.model('User', userSchema)
