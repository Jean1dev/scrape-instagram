const request = require('request')
const fs = require('fs')
const path = require('path')
const Authenticator = require('./auth')
const DirectMessaging = require('./direct-messaging')
const gerarPdf = require('./gerar-pdf')

const auth = new Authenticator()

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

    structFollows.forEach(user => {
        const profile = structFollowers.find(follow => follow.username === user.username)

        if (!profile) {
            evidencias.push(user)
        }
    })

    fs.writeFileSync('data.json', JSON.stringify(evidencias))
}

async function gerarPDFdata() {
    //fazer com o pipe para resolver arquivos muito grandes

    const fileStream = fs.readFileSync('data.json')
    const data = JSON.parse(fileStream)

    const download = function (uri, filename) {
        return new Promise((resolve, _reject) => {
            request.head(uri, function (err, res, body) {
                console.log('content-type:', res.headers['content-type']);
                console.log('content-length:', res.headers['content-length']);
    
                request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);
            })
        })
    };

    for (user of data) {
        const filename = `${path.resolve(__dirname, '..', 'images_insta')}/${user.username}.jpg`
        await download(user.profilePicUrl, filename)
        console.log('downloaded', filename)
    }

    fs.rmSync('data.json')
}

auth.login().then(async client => {
    const currentUser = await client.account.currentUser()
    console.log(`Logged in as ${currentUser.username}`)

    const filestream = fs.readFileSync(path.resolve(__dirname, '..', 'input.json'))
    
    const data = JSON.parse(filestream)

    const dm = new DirectMessaging(client)
    
    const failuresUsers = []
    const successUser = []

    fs.mkdirSync('pdf')

    for (item of data) {
        try {
            console.log('analise perfil', item.insta)

            const followers = await dm.listFollowers(item.insta)
            console.log('get followers', followers.length)

            const follows = await dm.listFollowing(item.insta)
            console.log('get follows', follows.length)

            evidenciarNomeEFotoQuemEuSigoENaoMeSegue(followers, follows)

            fs.mkdirSync('images_insta')
            await gerarPDFdata()

            gerarPdf(`${item.insta}.pdf`)

            successUser.push(item)
        } catch (error) {
            console.error(error.message)
            failuresUsers.push({
                error: error.message,
                item
            })
        } finally {
            successUser.forEach(arroba => {
                const finded = data.find(_ => _.insta === arroba.insta)
                if (finded) {
                    const index = data.indexOf(finded)
                    data.splice(index, 1)
                }
            })


            if (failuresUsers.length) {
                fs.writeFileSync('output-error.json', JSON.stringify(failuresUsers))
            }

            if (successUser.length)
                fs.writeFileSync('input.json', JSON.stringify(data))
        }
    }
})