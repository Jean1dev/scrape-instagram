const Authenticator = require('./auth')
const DirectMessaging = require('./direct-messaging')

const auth = new Authenticator()

auth.login()
  .then(async client => {
    const currentUser = await client.account.currentUser()
    console.log(`Logged in as ${currentUser.username}`)

    const dm = new DirectMessaging(client)
    const followers = await dm.listFollowers('jeanlucafp')
    const follows = await dm.listFollowing('jeanlucafp')
    quemEuSigoENaoMeSegue(followers, follows)
    //dm.init()
    // dm.sendDm('jeanlucafp')
  })
  .catch(err => {
    console.error(err)
  })

function quemMeSegueAndEuNaoSigoDeVolta(followers, follows) {
  const userNameFollowers = followers.map(item => item.username)
  const userNameFollows = follows.map(item => item.username)

  userNameFollowers.forEach(user => {
    const profile = userNameFollows.find(follow => follow === user)
    if (!profile) {
      console.log('voce nao segue de volta o ', user)
    }
  })
}

function quemEuSigoENaoMeSegue(followers, follows) {
  const userNameFollowers = followers.map(item => item.username)
  const userNameFollows = follows.map(item => item.username)

  userNameFollows.forEach(user => {
    const profile = userNameFollowers.find(follow => follow === user)
    if (!profile) {
      console.log('nao esta te seguindo de volta ', user)
    }
  })
}
