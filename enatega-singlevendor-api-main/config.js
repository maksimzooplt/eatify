const dotenv = require('dotenv')
const path = require('path')
dotenv.config({
  path: path.join(__dirname, `.env.${process.env.NODE_ENV}`)
})
module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  SERVER_URL: process.env.SERVER_URL,
  PORT: process.env.PORT,
  CONNECTION_STRING: process.env.CONNECTION_STRING,
  RESET_PASSWORD_LINK: process.env.RESET_PASSWORD_LINK
}
