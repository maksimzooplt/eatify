const Addon = require('../../models/addon')
const { transformAddon } = require('./merge')

module.exports = {
  Query: {
    addons: async(_, args, context) => {
      console.log('addons')
      try {
        const addons = await Addon.find({ is_active: true })
        return addons.map(addon => {
          return transformAddon(addon)
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    allAddons: async(_, args, context) => {
      console.log('allAddons')
      try {
        const addons = await Addon.find({ is_active: true }).sort({
          createdAt: -1
        })
        return addons.map(addon => {
          return transformAddon(addon)
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createAddons: async(_, args, context) => {
      console.log('createAddon')
      try {
        const addons = await Addon.insertMany(args.addonInput)
        return addons.map(addon => {
          return transformAddon(addon)
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editAddon: async(_, args, context) => {
      console.log('editAddon')
      try {
        const addon = await Addon.findById(args.addonInput._id)
        if (!addon) {
          throw new Error('Addon does not exist')
        }
        addon.title = args.addonInput.title
        addon.description = args.addonInput.description
        addon.options = args.addonInput.options
        addon.quantity_minimum = args.addonInput.quantity_minimum
        addon.quantity_maximum = args.addonInput.quantity_maximum

        const result = await addon.save()
        return transformAddon(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteAddon: async(_, args, context) => {
      console.log('deleteAddon')
      try {
        const addon = await Addon.findById(args.id)
        addon.is_active = false
        const result = await addon.save()
        return result.id
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
