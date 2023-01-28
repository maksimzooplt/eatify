const mongoose = require('mongoose')

const Schema = mongoose.Schema

const foodSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    variations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Variation'
      }
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },
    img_url: {
      type: String
    },
    is_active: {
      type: Boolean,
      default: true
    },
    stock: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)
foodSchema.index({ '$**': 'text' })
module.exports = mongoose.model('Food', foodSchema)
