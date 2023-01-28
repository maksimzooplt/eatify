const Food = require('../../models/food')
const Variation = require('../../models/variation')
const { transformFood } = require('./merge')

module.exports = {
  Query: {
    foodByIds: async(_, args, context) => {
      console.log('foodByIds')
      try {
        const foods = await Food.find({
          _id: { $in: args.ids },
          is_active: true
        })
        return foods.map(food => {
          return transformFood(food)
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    foods: async(_, args, context) => {
      console.log('foods')
      try {
        const foods = await Food.find({ is_active: true }).sort({
          createdAt: -1
        })
        return foods.map(food => {
          return transformFood(food)
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    foodByCategory: async(_, args, context) => {
      console.log('foodByCategory')
      try {
        let filters = {}
        console.log(args.inStock, args.min, args.max, args.search)
        if (args.search) {
          const search = new RegExp(
            // eslint-disable-next-line no-useless-escape
            args.search.replace(/[\\\[\]()+?.*]/g, c => '\\' + c),
            'i'
          )
          const foods = await Food.find({
            category: args.category,
            is_active: true,
            $or: [
              { title: { $regex: search } },
              { description: { $regex: search } }
            ]
          })
          // const { likes } = await User.findById(req.userId, 'likes')
          console.log('foods', search)
          return foods.map(food => {
            return transformFood(food)
          })
        } else {
          if (args.onSale) filters.discounted = { $gt: 0 }
          if (args.min || args.max) {
            filters.price = { $gte: args.min, $lte: args.max }
          }

          const variations = await Variation.find({ ...filters }).select('_id')
          filters = {}
          if (args.inStock) filters.stock = { $gt: 0 }

          const foods = await Food.find({
            category: args.category,
            is_active: true,
            variations: { $in: variations.map(({ _id }) => _id) },
            ...filters
          })
          return foods.map(food => {
            return transformFood(food)
          })
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createFood: async(_, args, context) => {
      console.log('createFood')
      const insertedIVariations = await Variation.insertMany(
        args.foodInput.variations
      )
      const insertedIds = insertedIVariations.filter(
        variations => variations.id
      )
      const food = new Food({
        title: args.foodInput.title,
        description: args.foodInput.description,
        category: args.foodInput.category,
        img_url: args.foodInput.img_url,
        variations: insertedIds,
        stock: args.foodInput.stock
      })
      let createdFood
      try {
        const result = await food.save()
        createdFood = transformFood(result)

        return createdFood
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editFood: async(_, args, context) => {
      console.log(args.foodInput._id)
      const insertedIVariations = await Variation.insertMany(
        args.foodInput.variations
      )
      const insertedIds = insertedIVariations.filter(
        variations => variations.id
      )
      const food = await Food.findOne({ _id: args.foodInput._id })
      food.title = args.foodInput.title
      food.description = args.foodInput.description
      food.category = args.foodInput.category
      food.img_url = args.foodInput.img_url
      food.variations = insertedIds
      food.stock = args.foodInput.stock

      let updatedFood
      try {
        const result = await food.save()
        updatedFood = transformFood(result)

        return updatedFood
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteFood: async(_, { id }, context) => {
      console.log('deleteFood')
      try {
        const food = await Food.findById(id)
        food.is_active = false
        const result = await food.save()
        return { ...result._doc, _id: result.id }
      } catch (err) {
        throw err
      }
    }
  }
}
