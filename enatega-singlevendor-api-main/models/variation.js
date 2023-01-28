const mongoose = require('mongoose')
const Schema = mongoose.Schema

const variationSchema = new Schema(
  {
    title: {
      type: String
    },
    price: {
      type: Number,
      required: true
    },
    discounted: {
      type: Number,
      required: true
    },
    addons: [String]
  },
  { timestamps: true }
)
module.exports = mongoose.model('Variation', variationSchema)
