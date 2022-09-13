require('dotenv').config()
const { IgApiClient } = require('instagram-private-api')

module.exports = class Authenticator {

  async login() {
    const ig = new IgApiClient()
    const username = process.env.INSTAGRAM_USER
    const password = process.env.INSTAGRAM_PASS
    ig.state.generateDevice(username)

    ig.request.end$.subscribe(async () => {
      const serialized = await ig.state.serialize()
      delete serialized.constants
    })

    await ig.account.login(username, password)
    return ig
  }
}
