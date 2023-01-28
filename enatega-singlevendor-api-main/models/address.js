const mongoose = require('mongoose')

const Schema = mongoose.Schema

const AddressSchema = new Schema(
  {
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    delivery_address: { type: String, required: true },
    details: { type: String },
    label: { type: String, required: true },
    selected: { type: Boolean, default: true },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Address', AddressSchema)
