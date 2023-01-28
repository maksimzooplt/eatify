const mongoose = require('mongoose')
const {
  payment_status,
  order_status,
  payment_method
} = require('../helpers/enum')

const Schema = mongoose.Schema

const stripeSchema = new Schema(
  {
    order_id: {
      type: String,
      required: true
    },
    delivery_address: {
      latitude: { type: String, required: true },
      longitude: { type: String, required: true },
      delivery_address: { type: String, required: true },
      details: { type: String },
      label: { type: String, required: true }
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Item'
      }
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    payment_status: {
      type: String,
      enum: payment_status,
      default: payment_status[0]
    },
    review: {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    },
    order_status: {
      type: String,
      enum: order_status
    },
    order_amount: { type: Number, required: true },
    status_queue: {
      type: Object,
      required: true
    },
    payment_method: {
      enum: payment_method,
      type: String,
      required: true,
      default: payment_method[0]
    },
    stripe_create_payment: {
      type: Object,
      default: null
    },
    stripe_payment_response: {
      type: Object,
      default: null
    },
    paymentId: {
      type: String
    },
    coupon: { type: String },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)
module.exports = mongoose.model('Stripe', stripeSchema)
