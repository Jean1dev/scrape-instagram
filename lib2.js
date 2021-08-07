const Insta = require('scraper-instagram');
const InstaClient = new Insta();

InstaClient.subscribeHashtagPosts('sabado', (post, err) => {
  if (post) {
    InstaClient.getPost(post.shortcode).then(postagem => {
      console.log(postagem.author.username)
    })
  }
  else
    console.error(err);
})
