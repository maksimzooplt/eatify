const config = require('../config')

module.exports = {
  signupTemplate: `<h1>Congratulations!</h1>
    <p>You have successfully created an account for Enatega</p>`,
  signupText: `<h1>Congratulations</h1>
    <p>You have success created an account for Enatega</p>`,
  placeOrderTemplate(params) {
    return `<h1>Order</h1>
    <p>You placed an order on Enatega</p>
    <p>Order Id : ${params[0]}</p>
    <p>Items : ${params[1]}</p>
    <p>Addons : ${params[6]}</p>
    <p> Delivery Address: ${params[2]}</p >
    <p>Cost : ${params[3]}</p>
    <p>Delivery Charges : ${params[4]}</p>
    <p>Total : ${params[5]}</p>
    `
  },
  placeOrderText(params) {
    return `<h1>Order</h1>
<h4>You placed an order on Enatega</h4>
    <p>Order Id : ${params[0]}</p>
    <p>Items : ${params[1]}</p>
    <p>Addons : ${params[6]}</p>
    <p> Delivery Address: ${params[2]}</p >
    <p>Cost : ${params[3]}</p>
    <p>Delivery Charges : ${params[4]}</p>
    <p>Total : ${params[5]}</p>`
  },
  orderTemplate(params) {
    return `< h1 > Order Status</h1 >
            <p>Your order ${params[0]} is ${params[1]}</p>`
  },
  orderText(params) {
    return `< h1 > Order status</h1 >
            <p>Your orders ${params[0]} is ${params[1]} <p>`
  },
  resetPasswordTemplate(params) {
    return `<h1 > Reset Password</h1 >
                <p>Follow the link to reset password ${config.RESET_PASSWORD_LINK}${params[0]}</p>`
  },
  resetPasswordText(params) {
    return `<h1>Reset Password </h1>
                <p>Follow the link to reset password ${config.RESET_PASSWORD_LINK} ${params[0]} </p>`
  }
}
