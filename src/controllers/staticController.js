const Topic = require('../db/models').Topic;

module.exports = {
  index(req, res, next){
    Topic.scope({method: ['lastFiveTopics']}).all()
    .then((topics) => {
      res.render('static/index', {title: 'Welcome to Bloccit', topics});
    })
    .catch((err) => {
      console.log(err);
    })
  }
}
