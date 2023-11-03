const Authenticator = require('./auth')
const DirectMessaging = require('./direct-messaging')
const fs = require('fs')
const request = require('request')
const path = require('path')

const auth = new Authenticator()

function waitInSeconds(milliseconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(null), milliseconds)
  })
}

async function startSync() {
  const client = await auth.login()
  const currentUser = await client.account.currentUser()
  console.log(`Logged in as ${currentUser.username}`)
  const dm = new DirectMessaging(client)

  let followers, follows, retry = 0

  async function esperar2min() {
    console.log('esperando 120 segundos')


    for (let index = 0; index < 120; index++) {
      console.log(index)
      await waitInSeconds(1000)
    }

    console.log('voltando')
  }

  async function getFollowers() {
    try {
      followers = await dm.listFollowers('jeanlucafp')
      console.log('get followers')
    } catch (error) {
      console.log(error)
      if (retry < 3) {
        await esperar2min()
        retry++
        return getFollowers()
      }

      followers = []
    }
  }

  async function getFollows() {
    try {
      follows = await dm.listFollowing('jeanlucafp')
      console.log('get follows')
    } catch (error) {
      console.log(error)
      if (retry < 3) {
        await esperar2min()
        retry++
        return getFollows()
      }

      follows = []
    }
  }
  await getFollowers()
  await getFollows()

  evidenciarNomeEFotoQuemEuSigoENaoMeSegue(followers, follows)

}

// auth.login()
//   .then(async client => {
//     const currentUser = await client.account.currentUser()
//     console.log(`Logged in as ${currentUser.username}`)

//     const dm = new DirectMessaging(client)
//     const followers = await dm.listFollowers('jeanlucafp')
//     console.log('get followers')

//     const follows = await dm.listFollowing('jeanlucafp')
//     console.log('get follows')

//     //registar(followers)
//     //registar(follows)
//     evidenciarNomeEFotoQuemEuSigoENaoMeSegue(followers, follows)
//     //quemEuSigoENaoMeSegue(followers, follows)
//     //dm.init()
//     // dm.sendDm('jeanlucafp')
//   })
//   .catch(err => {
//     console.error(err)
//   })

function registar(data) {
  const structFollowers = data.map(item => ({
    username: item.username,
    profilePicUrl: item.profile_pic_url
  }))

  fs.writeFileSync('data.json', JSON.stringify(structFollowers))
  gerarPDFdata()
}

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

function evidenciarNomeEFotoQuemEuSigoENaoMeSegue(followers, follows) {
  const evidencias = []
  const structFollowers = followers.map(item => ({
    username: item.username,
    profilePicUrl: item.profile_pic_url
  }))

  const structFollows = follows.map(item => ({
    username: item.username,
    profilePicUrl: item.profile_pic_url
  }))

  for (const user of structFollows) {
    const profile = structFollowers.find(follow => follow.username === user.username)

    if (!profile) {
      evidencias.push(user)
    }
  }

  fs.writeFileSync('data.json', JSON.stringify(evidencias))
  gerarPDFdata()
}

function gerarPDFdata() {
  //fazer com o pipe para resolver arquivos muito grandes

  const fileStream = fs.readFileSync('data.json')
  const data = JSON.parse(fileStream)

  fs.mkdirSync('images_insta')

  const download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    })
  };

  data.forEach(user => {
    const filename = `${path.resolve(__dirname, '..', 'images_insta')}/${user.username}.jpg`
    download(user.profilePicUrl, filename, () => console.log('downloaded', filename))
  })

  fs.rmSync('data.json')
}

startSync()