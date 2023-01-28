const Category = require('../../models/category')
const Food = require('../../models/food')
const { transformCategory } = require('./merge')
module.exports = {
  Query: {
    categories: async(_, args, context) => {
      console.log('categories')
      try {
        const categories = await Category.find({ is_active: true })
        return categories.map(category => {
          return transformCategory(category)
        })
      } catch (err) {
        throw err
      }
    },
    allCategories: async(_, args, context) => {
      console.log('allcategories')
      try {
        const categories = await Category.find({ is_active: true })
          .sort({ createdAt: -1 })
          .skip((args.page || 0) * 10)
          .limit(10)
        return categories.map(category => {
          return transformCategory(category)
        })
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createCategory: async(_, args, context) => {
      console.log('createCategory')
      try {
        const category = new Category({
          title: args.category.title,
          description: args.category.description,
          img_menu: args.category.img_menu
        })

        const result = await category.save()

        return { ...result._doc, _id: result.id }
      } catch (err) {
        throw err
      }
    },
    editCategory: async(_, args, context) => {
      console.log('editCategory')
      try {
        const category = await Category.findOne({ _id: args.category._id })

        category.title = args.category.title
        category.description = args.category.description
        category.img_menu = args.category.img_menu

        const result = await category.save()

        return { ...result._doc, _id: result.id }
      } catch (err) {
        throw err
      }
    },
    deleteCategory: async(_, { id }, context) => {
      console.log('deleteCategory')
      try {
        const category = await Category.findById(id)
        await Food.updateMany({ category: id }, { is_active: false })
        category.is_active = false
        const result = await category.save()
        return { ...result._doc, _id: result.id }
      } catch (err) {
        throw err
      }
    },
    test: async(_, args, context) => {
      await Food.updateMany({ is_active: true })
      return true
    }
  }
}
