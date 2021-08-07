module.exports = class DirectMessaging {
  client
  threads
  me

  constructor(client) {
    this.client = client
    this.client.account.currentUser().then(user => {
      this.me = user
    })
  }

  /**
   * https://github.com/dilame/instagram-private-api/issues/792
   * https://www.npmjs.com/package/instagram-private-api
   * https://github.com/dilame/instagram-private-api/tree/master/examples
   */

  async init() {
    this.threads = await this.client.feed.directInbox().items()
    console.log(this.threads)
    // const tId = (await this.client.direct.createGroupThread(['@jeanlucafp', '@saviaugusto'], 'teste')).thread_id
    // const [thread] = await this.client.feed.directInbox().records()

    // await this.client.entity.directThread(thread.threadId).broadcastText('DM AUTOMATICA')
    const userId = await this.client.user.getIdByUsername('jeanlucafp')
    const thread2 = await this.client.entity.directThread([userId.toString()])
    await thread2.broadcastText('agora vai')
  }
}
