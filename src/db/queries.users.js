const User = require('./models').User;
const Topic = require('./models').Topic;
const Post = require('./models').Post;
const Comment = require('./models').Comment;
const Favorite = require('./models').Favorite;
const bcrypt = require('bcryptjs');

module.exports = {
  createUser(newUser, callback){
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);
    return User.create({
      email: newUser.email,
      img: newUser.img,
      password: hashedPassword,
    })
    .then((user) => {
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    });
  },

  getUser(id, callback){
    let result = {};
    User.findByPk(id)
    .then((user) => {
      if(!user){
        callback(404);
      } else {
        result['user'] = user;
        Topic.scope({method: ['lastFiveFor', id]}).findAll()
        .then((topics) => {
          result['topics'] = topics;
          Post.scope({method: ['lastFiveFor', id]}).findAll()
          .then((posts) => {
            result['posts'] = posts;
            Comment.scope({method: ['lastFiveFor', id]}).findAll()
            .then((comments) => {
              result['comments'] = comments;
              Favorite.scope({method: ['favoritePosts', id]}).findAll()
              .then((favoritePosts) => {
                result['favoritePosts'] = favoritePosts;
                callback(null, result);
              });
            });
          });
        })
        .catch((err) => {
          callback(err);
        });
      }
    });
  }
}
