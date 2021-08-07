const Authenticator = require('./auth')
const DirectMessaging = require('./direct-messaging')

const auth = new Authenticator()

auth.login()
  .then(async client => {
    const currentUser = await client.account.currentUser()
    console.log(`Logged in as ${currentUser.username}`)

    const dm = new DirectMessaging(client)
    dm.init()
  })
  .catch(err => {
    console.error(err)
  })
