const mongoose = require('mongoose')
const {
  payment_status,
  order_status,
  payment_method
} = require('../helpers/enum')

const Schema = mongoose.Schema

const orderSchema = new Schema(
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
    status: {
      type: Boolean,
      default: null
    },
    order_status: {
      type: String,
      enum: order_status
    },
    status_queue: {
      type: Object,
      required: true
    },
    paid_amount: { type: Number },
    order_amount: { type: Number, required: true },
    delivery_charges: { type: Number },
    payment_method: {
      enum: payment_method,
      type: String,
      required: true,
      default: payment_method[0]
    },
    reason: { type: String },
    coupon: { type: String },
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'Rider'
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)
module.exports = mongoose.model('Order', orderSchema)
