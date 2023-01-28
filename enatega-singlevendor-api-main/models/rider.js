const mongoose = require('mongoose')

const Schema = mongoose.Schema

const riderSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      default: '123'
    },
    phone: {
      type: String,
      required: true
    },
    available: {
      type: Boolean,
      default: true
    },
    assigned: [String],
    delivered: [String],
    location: {
      latitude: {
        type: String,
        default: '33.7000031'
      },
      longitude: {
        type: String,
        default: '72.9735346'
      }
    },
    notificationToken: {
      type: String
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Rider', riderSchema)
