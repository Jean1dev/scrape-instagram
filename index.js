const instagram = require('instagram-scraping');

instagram.deepScrapeTagPage('sabado').then(result => {
  result.medias.forEach(element => {
      console.table([element.owner.username, element.owner.full_name])
  });
})

