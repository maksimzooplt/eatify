/* eslint-disable no-path-concat */
const express = require('express')
const bodyParser = require('body-parser')
const { ApolloServer } = require('apollo-server-express')
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose')
const path = require('path')
const engines = require('consolidate')
//const { graphqlUploadExpress } = require('graphql-upload');
const typeDefs = require('./graphql/schema/index')
const resolvers = require('./graphql/resolvers/index')
const paypal = require('./routes/paypal')
const stripe = require('./routes/stripe')
const isAuth = require('./middleware/is-auth')
const config = require('./config.js')
const http = require('http')
const app = express()

app.engine('ejs', engines.ejs)
app.set('views', './views')
app.set('view engine', 'ejs')

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

mongoose
  .connect(
    `mongodb+srv://maks2000:passwordMax123@cluster0.uneh7.mongodb.net/FirstDatabase`,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log('server started at port', config.PORT)
    httpServer.listen(config.PORT)
  })
  .catch(err => {
    console.log(err)
  })

// DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set('useCreateIndex', true)

app.use(express.static('public'))

app.use(isAuth)

app.use('/paypal', paypal)
app.use('/stripe', stripe)

// app.use(
//   '/graphql',
//   graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
//   graphqlHTTP({
//     schema: graphQlSchema,
//     rootValue: graphQlResolvers,
//     graphiql: true
//   })
// );

app.get('/', function(req, res) {
  res.sendFile(
    path.join(__dirname + '/static/food-delivery-landingPage/index.html')
  )
})
app.get('/privacy-policy', function(req, res) {
  res.sendFile(
    path.join(
      __dirname + '/static/food-delivery-landingPage/privacy-policy.html'
    )
  )
})
app.get('/chat', function(req, res) {
  res.sendFile(
    path.join(
      __dirname + '/static/food-delivery-landingPage/food-delivery-chat.html'
    )
  )
})

app.use('/dashboard', express.static(path.join(__dirname, '/build')))
const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    settings: {
      'editor.theme': 'light',
    },
  },
  context: ({ req, res }) => {
    return { req, res }
  }
})
// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname + '/build/index.html'))
// })

server.applyMiddleware({ app })
const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)
console.log(server)


