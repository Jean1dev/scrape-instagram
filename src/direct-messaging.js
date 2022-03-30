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

  async sendDm(username) {
    const userId = await this.client.user.getIdByUsername(username)
    const friendship = await this.client.friendship.create(userId)
    const thread2 = await this.client.entity.directThread([userId.toString()])
    console.log('send dm to ', username)
    try {
      await thread2.broadcastText('teste dm')
    } catch (e) {
      // https://github.com/dilame/instagram-private-api/issues/1084
      console.error('Device#sendMessage Error', e.name, e.message)
    }
  }

  async listFollowers(username) {
    const userId = await this.client.user.getIdByUsername(username)
    const followersFeed = await this.client.feed.accountFollowers(userId)

    let followers = [];
    let reqId = 0;
    let limit = 600;
    let delay = 1000;
    do {
      reqId += 1;
      const items = await followersFeed.items();
      followers = [...followers, ...items];

      if (limit && limit !== -1) {
        if (followers.length >= limit) {
          break;
        }
      }

      await waitInSeconds(delay);
    } while (followersFeed.isMoreAvailable());

    return followers
  }

  async listFollowing(username) {
    const userId = await this.client.user.getIdByUsername(username)
    const followingFeed = await this.client.feed.accountFollowing(userId)

    let followers = [];
    let reqId = 0;
    let limit = 600;
    let delay = 1000;
    do {
      reqId += 1;
      const items = await followingFeed.items();
      followers = [...followers, ...items];

      if (limit && limit !== -1) {
        if (followers.length >= limit) {
          break;
        }
      }

      await waitInSeconds(delay);
    } while (followingFeed.isMoreAvailable());

    return followers
  }
}


function waitInSeconds(milliseconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(null), milliseconds)
  })
}
