const { gql } = require('apollo-server-express')

const typeDefs = gql`
  type Address {
    _id: ID!
    longitude: String!
    latitude: String!
    delivery_address: String!
    details: String
    label: String!
    selected: Boolean
  }

  type Location {
    longitude: String!
    latitude: String!
  }

  type OrderAddress {
    longitude: String!
    latitude: String!
    delivery_address: String!
    details: String
    label: String!
  }

  type Item {
    _id: ID!
    food: Food!
    quantity: Int!
    variation: ItemVariation!
    addons: [ItemAddon!]
    is_active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type PaymentType {
    _id: ID!
    name: String
    is_active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type CardInformation {
    name: String!
    credit_card_number: String!
    expiration_date: String!
    cvv: String!
  }

  type Category {
    _id: ID!
    title: String!
    description: String
    img_menu: String
    is_active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Variation {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float
    addons: [Addon!]
  }
  type ItemVariation {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float!
  }

  type Food {
    _id: ID!
    title: String!
    description: String!
    variations: [Variation!]!
    category: Category!
    img_url: String!
    is_active: Boolean!
    createdAt: String!
    updatedAt: String!
    stock: Int!
    tag: String
  }

  type Rider {
    _id: ID!
    name: String!
    username: String!
    password: String!
    phone: String!
    available: Boolean!
    is_active: Boolean!
    createdAt: String!
    updatedAt: String!
    location: Location
  }

  type User {
    _id: ID
    name: String
    phone: String
    email: String
    password: String
    payment_type: PaymentType
    card_information: CardInformation
    orders: [Order!]
    is_active: Boolean
    is_order_notification: Boolean
    is_offer_notification: Boolean
    createdAt: String
    updatedAt: String
    addresses: [Address!]
    notificationToken: String
  }
  type Configuration {
    _id: String!
    order_id_prefix: String
    push_token: String
    mongodb_url: String
    email: String
    password: String
    enable_email: Boolean
    client_id: String
    client_secret: String
    sandbox: Boolean
    publishable_key: String
    secret_key: String
    delivery_charges: Float
    currency: String
    currency_symbol: String
  }
  type OrderStatus {
    pending: String!
    preparing: String
    picked: String
    delivered: String
    cancelled: String
  }
  type Order {
    _id: ID!
    order_id: String!
    delivery_address: OrderAddress!
    items: [Item!]!
    user: User!
    payment_method: String
    paid_amount: Float
    order_amount: Float
    status: Boolean
    payment_status: String!
    order_status: String
    review: Review
    reason: String
    status_queue: OrderStatus
    is_active: Boolean!
    createdAt: String!
    updatedAt: String!
    delivery_charges: Float
    rider: Rider
  }

  type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
    name: String
    phone: String
    email: String
    notificationToken: String
  }

  type Review {
    _id: ID!
    order: Order!
    rating: Int!
    description: String
    is_active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type ReviewOutput {
    _id: ID!
    order_id: String!
    review: Review!
    is_active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AllReviewOutput {
    review: [Review!]
  }

  type Admin {
    userId: String!
    email: String!
    name: String!
    token: String!
  }

  type ForgotPassword {
    result: Boolean!
  }

  type Option {
    _id: String!
    title: String!
    description: String
    price: Float!
  }
  type ItemOption {
    _id: String!
    title: String!
    description: String
    price: Float!
  }

  type Addon {
    _id: String!
    options: [Option!]
    title: String!
    description: String
    quantity_minimum: Int!
    quantity_maximum: Int!
    is_active: Boolean
  }
  type ItemAddon {
    _id: String!
    options: [ItemOption!]
    title: String!
    description: String
    quantity_minimum: Int!
    quantity_maximum: Int!
  }

  type DashboardData {
    total_orders: Int!
    total_users: Int!
    total_sales: Float!
    total_ratings: Int!
    avg_ratings: Float!
  }

  type DashboardSales {
    orders: [Sales_Values!]
  }
  type DashboardOrders {
    orders: [Orders_Values!]
  }

  type Sales_Values {
    day: String!
    amount: Float!
  }
  type Orders_Values {
    day: String!
    count: Int!
  }
  type Coupon {
    _id: String!
    code: String!
    discount: Float!
    enabled: Boolean!
  }

  type Subscription_Orders {
    userId: String
    order: Order!
    origin: String!
  }

  input OrderConfigurationInput {
    order_id_prefix: String!
  }

  input EmailConfigurationInput {
    email: String!
    password: String!
    enable_email: Boolean!
  }

  input MongoConfigurationInput {
    mongodb_url: String!
  }

  input PaypalConfigurationInput {
    client_id: String!
    client_secret: String!
    sandbox: Boolean!
  }
  input StripeConfigurationInput {
    publishable_key: String!
    secret_key: String!
  }
  input DeliveryConfigurationInput {
    delivery_charges: Float
  }
  input CurrencyConfigurationInput {
    currency: String!
    currency_symbol: String!
  }

  input UpdateUser {
    name: String!
    phone: String!
  }
  input AddonsInput {
    _id: String
    options: [String!]
  }
  input OrderInput {
    food: String!
    quantity: Int!
    variation: String!
    addons: [AddonsInput!]
  }

  input VariationInput {
    title: String!
    price: Float!
    discounted: Float
    addons: [String!]
  }

  input FoodInput {
    _id: String
    title: String!
    description: String
    category: String!
    img_url: String
    variations: [VariationInput!]!
    stock: Int!
  }

  input RiderInput {
    _id: String
    name: String!
    username: String!
    password: String!
    phone: String!
    available: Boolean!
  }

  input UserInput {
    phone: String
    email: String
    password: String
    name: String
    facebookId: String
    notificationToken: String
    appleId: String
  }

  input ReviewInput {
    orderId: String!
    rating: Int!
    description: String
  }

  input CategoryInput {
    _id: String
    title: String!
    description: String
    img_menu: String
  }

  input OptionInput {
    _id: String
    title: String!
    description: String
    price: Float!
  }

  input AddonInput {
    _id: String
    title: String!
    description: String
    options: [String]
    quantity_minimum: Int!
    quantity_maximum: Int!
  }
  input CouponInput {
    _id: String
    code: String!
    discount: Float!
    enabled: Boolean
  }

  input AddressInput {
    _id: String
    latitude: String!
    longitude: String!
    delivery_address: String!
    details: String
    label: String!
  }

  type Query {
    categories: [Category!]!
    allCategories(page: Int): [Category!]!
    orders(offset: Int): [Order!]!
    foods(page: Int): [Food!]!
    undeliveredOrders(offset: Int): [Order!]!
    deliveredOrders(offset: Int): [Order!]!
    allOrders(page: Int, rows: Int, search: String): [Order!]!
    getDashboardTotal(
      starting_date: String
      ending_date: String
    ): DashboardData!
    allReviews(offset: Int): [Review!]
    reviews(offset: Int): [ReviewOutput!]!
    foodByCategory(
      category: String!
      onSale: Boolean
      inStock: Boolean
      min: Float
      max: Float
      search: String
    ): [Food!]!
    profile: User
    configuration: Configuration!
    users(page: Int): [User!]
    order(id: String!): Order!
    riders: [Rider!]
    rider(id: String): Rider!
    orderCount: Int
    availableRiders: [Rider]
    getOrderStatuses: [String!]
    getPaymentStatuses: [String!]
    assignedOrders(id: String): [Order!]
    options: [Option!]
    allOptions(page: Int): [Option!]
    addons: [Addon!]
    allAddons(page: Int): [Addon!]
    foodByIds(ids: [String!]!): [Food!]
    getDashboardOrders(
      starting_date: String
      ending_date: String
    ): DashboardOrders!
    getDashboardSales(
      starting_date: String
      ending_date: String
    ): DashboardSales!
    coupons: [Coupon!]!
    unassignedOrders: [Order!]
  }

  type Mutation {
    adminLogin(email: String!, password: String!): Admin!
    login(
      appleId: String
      facebookId: String
      email: String
      password: String
      type: String!
      name: String
      notificationToken: String
    ): AuthData!
    createUser(userInput: UserInput): AuthData!
    updateUser(updateUserInput: UpdateUser!): User!
    updateNotificationStatus(
      offerNotification: Boolean!
      orderNotification: Boolean!
    ): User!
    createCategory(category: CategoryInput!): Category!
    editCategory(category: CategoryInput!): Category!
    createFood(foodInput: FoodInput): Food!
    editFood(foodInput: FoodInput): Food!
    placeOrder(
      orderInput: [OrderInput!]!
      paymentMethod: String!
      couponCode: String
      address: AddressInput!
    ): Order!
    editOrder(_id: String!, orderInput: [OrderInput!]!): Order!
    reviewOrder(reviewInput: ReviewInput!): Order!
    cancelOrder(orderId: String!): Order!
    uploadPicture(picture: String!): User!
    saveOrderConfiguration(
      configurationInput: OrderConfigurationInput!
    ): Configuration!
    saveEmailConfiguration(
      configurationInput: EmailConfigurationInput!
    ): Configuration!
    saveMongoConfiguration(
      configurationInput: MongoConfigurationInput!
    ): Configuration!
    savePaypalConfiguration(
      configurationInput: PaypalConfigurationInput!
    ): Configuration!
    saveStripeConfiguration(
      configurationInput: StripeConfigurationInput!
    ): Configuration!
    saveDeliveryConfiguration(
      configurationInput: DeliveryConfigurationInput!
    ): Configuration!
    saveCurrencyConfiguration(
      configurationInput: CurrencyConfigurationInput!
    ): Configuration!
    pushToken(token: String): User!
    updateOrderStatus(id: String!, status: String!, reason: String): Order!
    uploadToken(pushToken: String!): Configuration!
    forgotPassword(email: String!): ForgotPassword!
    resetPassword(password: String!, token: String!): ForgotPassword!
    deleteCategory(id: String!): Category!
    deleteFood(id: String!): Food!
    createRider(riderInput: RiderInput): Rider!
    editRider(riderInput: RiderInput): Rider!
    deleteRider(id: String!): Rider!
    toggleAvailablity(id: String): Rider!
    updateStatus(id: String, status: Boolean, reason: String): Order!
    assignRider(id: String!, riderId: String!): Order!
    riderLogin(username: String, password: String, notificationToken: String): AuthData!
    updateOrderStatusRider(id: String!, status: String!): Order!
    updatePaymentStatus(id: String!, status: String!): Order!
    createOptions(optionInput: [OptionInput]): [Option!]
    editOption(optionInput: OptionInput): Option!
    deleteOption(id: String!): String!
    createAddons(addonInput: [AddonInput]): [Addon!]
    editAddon(addonInput: AddonInput): Addon!
    deleteAddon(id: String!): String!
    createCoupon(couponInput: CouponInput!): Coupon!
    editCoupon(couponInput: CouponInput!): Coupon!
    deleteCoupon(id: String!): String!
    coupon(coupon: String!): Coupon!
    createAddress(addressInput: AddressInput!): User!
    editAddress(addressInput: AddressInput!): Address!
    deleteAddress(id: ID!): User!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    sendNotificationUser(
      notificationTitle: String
      notificationBody: String!
    ): String!
    selectAddress(id: String!): User!
    assignOrder(id: String): Order!
    updateRiderLocation(latitude: String!, longitude: String!): Rider!
    test: Boolean
  }
  type Subscription {
    subscribePlaceOrder: Subscription_Orders!
    orderStatusChanged(userId: String!): Subscription_Orders!
    subscriptionAssignRider(riderId: String!): Subscription_Orders!
    unassignedOrder: Subscription_Orders!
    subscriptionRiderLocation(riderId: String!): Rider!
  }
`
module.exports = typeDefs
