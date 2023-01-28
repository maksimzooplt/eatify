const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/user')
const Reset = require('../../models/reset')
const Address = require('../../models/address')
const { checkPhoneAlreadyUsed } = require('../../helpers/utilities')
const { credentials } = require('../../helpers/credentials')
const sendEmail = require('../../helpers/email')
const { transformUser } = require('./merge')
const {
  signupTemplate,
  signupText,
  resetPasswordTemplate,
  resetPasswordText
} = require('../../helpers/templates')
const uuidv4 = require('uuid/v4')
module.exports = {
  Query: {
    profile: async(_, args, { req, res }) => {
      console.log('profile')
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const user = await User.findById(req.userId)
        if (!user) throw new Error('User does not exist')
        return transformUser(user)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    users: async(_, args, context) => {
      console.log('users')
      try {
        const users = await User.find({ is_active: true }).sort({
          createdAt: -1
        })
        if (!users || !users.length) return []
        // transform users
        return users.map(user => {
          return transformUser(user)
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createUser: async(_, args, context) => {
      console.log('createUser', args.userInput)
      try {
        if (args.userInput.facebookId) {
          const existingfacebookId = await User.findOne({
            facebookId: args.userInput.facebookId
          })
          if (existingfacebookId) {
            throw new Error(
              'Facebook account is already registered. Please Login'
            )
          }
        }
        if (args.userInput.appleId) {
          const existingAppleId = await User.findOne({
            appleId: args.userInput.appleId
          })
          if (existingAppleId) {
            throw new Error('Apple account is already registered. Please Login')
          }
        }
        if (args.userInput.email) {
          const existingEmail = await User.findOne({
            email: args.userInput.email
          })
          if (existingEmail) {
            throw new Error('Email is already associated with another account.')
          }
        }
        if (args.userInput.phone) {
          const existingPhone = await User.findOne({
            phone: args.userInput.phone
          })
          if (existingPhone) {
            throw new Error('Phone is already associated with another account.')
          }
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
        const user = new User({
          appleId: args.userInput.appleId,
          facebookId: args.userInput.facebookId,
          email: args.userInput.email,
          password: hashedPassword,
          phone: args.userInput.phone,
          name: args.userInput.name,
          notificationToken: args.userInput.notificationToken,
          is_order_notification: !!args.userInput.notificationToken,
          is_offer_notification: !!args.userInput.notificationToken
        })

        const result = await user.save()
        sendEmail(result.email, 'Account Creation', signupText, signupTemplate)
        const token = jwt.sign(
          {
            userId: result.id,
            email: result.email || result.facebookId || result.appleId
          },
          'somesupersecretkey'
        )
        console.log({
          ...result._doc,
          userId: result.id,
          token: token,
          tokenExpiration: 1
        })
        return {
          ...result._doc,
          userId: result.id,
          token: token,
          tokenExpiration: 1
        }
      } catch (err) {
        throw err
      }
    },
    login: async(
      _,
      { appleId, facebookId, email, password, type, name, notificationToken },
      context
    ) => {
      console.log('login', {
        appleId,
        facebookId,
        email,
        password,
        type,
        notificationToken
      })
      var user = facebookId
        ? await User.findOne({ facebookId: facebookId })
        : appleId
          ? await User.findOne({ appleId: appleId })
          : await User.findOne({ email: email })
      if (!user && appleId) {
        const newUser = new User({
          appleId: appleId,
          email: email,
          name: name
        })
        user = await newUser.save()
      }
      if (!user && type === 'google') {
        const newUser = new User({
          email: email,
          name: name
        })
        user = await newUser.save()
      }
      if (!user && facebookId) {
        const newUser = new User({
          facebookId: facebookId,
          email: email,
          name: name
        })
        user = await newUser.save()
      }
      if (!user) {
        user = await User.findOne({ phone: email })
        if (!user) throw new Error('User does not exist!')
      }
      if (type === 'default') {
        const isEqual = await bcrypt.compare(password, user.password)
        if (!isEqual) {
          throw new Error('Invalid credentials!')
          // throw new Error('Password is incorrect!');
        }
      }
      user.notificationToken = notificationToken
      await user.save()

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email || user.facebookId || user.appleId
        },
        'somesupersecretkey'
      )
      return {
        ...user._doc,
        email: user.email || user.appleId,
        userId: user.id,
        token: token,
        tokenExpiration: 1
      }
    },
    updateUser: async(_, args, { req, res }) => {
      console.log(args.updateUserInput)
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      const user = await User.findById(req.userId)
      if (!user) throw new Error('Please logout and login again')
      // check if phone number is already associated with another account
      if (
        !(await checkPhoneAlreadyUsed(req.userId, args.updateUserInput.phone))
      ) {
        try {
          user.name = args.updateUserInput.name
          user.phone = args.updateUserInput.phone
          const result = await user.save()
          return transformUser(result)
        } catch (err) {
          console.log(err)
          throw err
        }
      } else {
        throw new Error(
          'Phone number is already associated with another account'
        )
      }
    },
    uploadPicture: async(_, args, { req, res }) => {
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const user = await User.findById(req.userId)
        if (!user) throw new Error('invalid request')
        user.picture = args.picture
        const result = await user.save()
        return transformUser(result)
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    adminLogin: async(_, args, { req, res }) => {
      if (
        credentials.ADMIN_USER !== args.email ||
        credentials.ADMIN_PASSWORD !== args.password
      ) {
        throw new Error('Invalid credentials')
      }
      const user = {
        userId: credentials.USER_ID,
        email: args.email,
        password: args.password,
        name: credentials.NAME
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        'somesupersecretkey'
      )
      return { ...user, password: '', token: token }
    },
    pushToken: async(_, args, { req, res }) => {
      if (!req.isAuth) throw new Error('Unauthenticated')
      try {
        console.log(args.token)
        const user = await User.findById(req.userId)
        user.notificationToken = args.token
        await user.save()

        return transformUser(user)
      } catch (err) {
        throw err
      }
    },
    forgotPassword: async(_, { email }, { req, res }) => {
      const user = await User.findOne({ email: email })
      if (!user) {
        throw new Error('User does not exist!')
      }
      // generate token,
      const token = uuidv4()
      const reset = new Reset({
        user: user.id,
        token
      })
      console.log(user.id, token)
      await reset.save()
      const resetPassword_template = resetPasswordTemplate([token])
      const resetPassword_text = resetPasswordText([token])

      sendEmail(
        user.email,
        'Reset Password',
        resetPassword_text,
        resetPassword_template
      )

      // email link for reset password
      return {
        result: true
      }
    },
    resetPassword: async(_, { password, token }, constext) => {
      console.log(password, token)
      const reset = await Reset.findOne({ token })
      if (!reset) {
        throw new Error('Invalid Token!')
      }
      const user = await User.findById(reset.user)
      if (!user) {
        throw new Error('Something went wrong. Contact Support!')
      }
      const hashedPassword = await bcrypt.hash(password, 12)
      user.password = hashedPassword
      await user.save()
      await Reset.remove({ token })
      // validate token against time- not done yet
      // find user from reset object
      // generate hash of password
      // update user
      // remove token from reset collection
      // return result true
      return {
        result: true
      }
    },
    createAddress: async(_, { addressInput }, { req, res }) => {
      console.log('createAddress')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }

        await Address.updateMany(
          { _id: { $in: user.addresses } },
          { $set: { selected: false } }
        )

        const address = new Address({
          ...addressInput
        })
        const savedAddress = await address.save()
        user.addresses.push(savedAddress)
        const updatedUser = await user.save()

        return transformUser(updatedUser)
      } catch (e) {
        throw e
      }
    },
    editAddress: async(_, { addressInput }, { req, res }) => {
      console.log('editAddress')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }
        const address = await Address.findById(addressInput._id)
        if (!address) {
          throw new Error('Address not found')
        }

        address.latitude = addressInput.latitude
        address.longitude = addressInput.longitude
        address.delivery_address = addressInput.delivery_address
        address.details = addressInput.details
        address.label = addressInput.label

        const updatedAddress = await address.save()
        return { ...updatedAddress._doc, _id: updatedAddress.id }
      } catch (e) {
        throw e
      }
    },
    deleteAddress: async(_, { id }, { req, res }) => {
      console.log('deleteAddress')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }
        const address = await Address.findById(id)
        if (!address) {
          throw new Error('Address not found')
        }
        address.is_active = false
        await address.save()
        const updatedUser = await User.findById(req.userId)
        return transformUser(updatedUser)
      } catch (e) {
        throw e
      }
    },
    changePassword: async(_, { oldPassword, newPassword }, { req, res }) => {
      console.log('changePassword')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }
        const isEqual = await bcrypt.compare(oldPassword, user.password)
        if (!isEqual) {
          throw new Error('Invalid credentials!')
          // throw new Error('Password is incorrect!');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashedPassword
        await user.save()
        return true
      } catch (e) {
        throw e
      }
    },
    updateNotificationStatus: async(_, args, { req, res }) => {
      console.log('updateNotificationStatus')
      try {
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }
        user.is_offer_notification = args.offerNotification
        user.is_order_notification = args.orderNotification
        user.save()
        return transformUser(user)
      } catch (e) {
        return false
      }
    },
    selectAddress: async(_, { id }, { req }) => {
      console.log('selectAddress')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }

        await Address.updateMany(
          { _id: { $in: user.addresses } },
          { $set: { selected: false } }
        )
        await Address.updateOne({ _id: id }, { $set: { selected: true } })

        return transformUser(user)
      } catch (e) {
        throw e
      }
    }
  }
}
