const { Expo } = require('expo-server-sdk')
const User = require('../../models/user')
const { sendNotificationMobile } = require('../../helpers/utilities')

module.exports = {
  Mutation: {
    sendNotificationUser: async(_, args, { req, res }) => {
      try {
        const users = await User.find({ is_active: true })
        const messages = []
        users.forEach(async(user, i) => {
          if (user.notificationToken && user.is_offer_notification) {
            if (Expo.isExpoPushToken(user.notificationToken)) {
              messages.push({
                to: user.notificationToken,
                sound: 'default',
                body: args.notificationBody,
                title: args.notificationTitle,
                channelId: 'default',
                data: {}
              })
            }
          }
        })
        await sendNotificationMobile(messages)
        return 'Success'
      } catch (e) {
        console.log(e)
      }
    }
  }
}
