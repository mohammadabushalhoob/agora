const Topic = require('../db/models').Topic;
const Post = require('../db/models').Post;
const Comment = require('../db/models').Comment;
const User = require('../db/models').User;
const Vote = require('../db/models').Vote;
const Favorite = require('../db/models').Favorite;
const userQueries = require('../db/queries.users.js');

module.exports = {
  index(req, res, next){
    // Topic.scope({method: ['lastFiveTopics']}).findAll()
    // .then((topics) => {
    //   res.render('static/index', {title: 'Welcome to Bloccit', topics});
    // })
    // .catch((err) => {
    //   console.log(err);
    // })
    Post.all({
      include: [
        {model: Comment, as: 'comments', include: [
          {model: User}
        ]}, {model: Vote, as: 'votes'},
              {model: Favorite, as: 'favorites'},
                {model: Topic},
                  {model: User}
      ]
    })
    .then((posts) => {
      if(req.user) {
        userQueries.getUser(req.user.id, (err, result) => {
          res.render('static/index', {title: 'Welcome to Bloccit', posts, result});
        })
      } else {
        res.render('static/index', {title: 'Welcome to Bloccit', posts});
      }
    })
    .catch((err) => {
      console.log(err);
    })
  }
}
