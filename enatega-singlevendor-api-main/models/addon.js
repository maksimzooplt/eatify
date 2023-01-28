const mongoose = require('mongoose')

const Schema = mongoose.Schema

const addonSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    options: [String],
    quantity_minimum: {
      type: Number,
      required: true
    },
    quantity_maximum: {
      type: Number,
      required: true
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Addon', addonSchema)
