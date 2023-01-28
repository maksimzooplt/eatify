const mongoose = require('mongoose')

const Schema = mongoose.Schema

const itemSchema = new Schema(
  {
    food: {
      type: Schema.Types.ObjectId,
      ref: 'Food'
    },
    quantity: {
      type: Number,
      required: true
    },
    variation: {
      type: Schema.Types.ObjectId,
      ref: 'Variation',
      required: true
    },
    addons: [
      {
        _id: String,
        options: [String]
      }
    ],
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)
module.exports = mongoose.model('Item', itemSchema)
