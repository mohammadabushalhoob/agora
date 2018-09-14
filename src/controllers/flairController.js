const flairQueries = require('../db/queries.flairs.js');

module.exports = {
  new(req, res, next){
    res.render('flairs/new', {topicId: req.params.topicId, postId: req.params.postId});
  },

  create(req, res, next){
    let newFlair = {
      name: req.body.name,
      color: req.body.color,
      postId: req.params.postId
    };
    flairQueries.addFlair(newFlair, (err, flair) => {
      if(err){
        // console.log(err);
        res.redirect(500, `/topics/${req.params.topicId}/posts/${req.params.postId}/flairs/new`);
      } else {
        res.redirect(303, `/topics/${req.params.topicId}/posts/${req.params.postId}/flairs/${flair.id}`);
      }
    });
  },

  show(req, res, next){
    flairQueries.getFlair(req.params.id, (err, flair) => {
      if(err || flair == null){
        res.redirect(404, '/');
      } else {
        res.render('flairs/show', {topicId: req.params.topicId, flair});
      }
    });
  },

  destroy(req, res, next){
    flairQueries.deleteFlair(req.params.id, (err, deletedRecordsCount) => {
      if(err){
        res.redirect(500, `/topics/${req.params.topicId}/posts/${req.params.postId}/flairs/${req.params.id}`)
      } else {
        res.redirect(303, `/topics/${req.params.topicId}/posts/${req.params.postId}`)
      }
    });
  },

  edit(req, res, next){
    flairQueries.getFlair(req.params.id, (err, flair) => {
      if(err || flair == null){
        res.redirect(404, '/');
      } else {
        res.render('flairs/edit', {topicId: req.params.topicId, flair});
      }
    });
  },

  update(req, res, next){
    flairQueries.updateFlair(req.params.id, req.body, (err, flair) => {
      if(err || flair == null){
        res.redirect(404, `/topics/${req.params.topicId}/posts/${req.params.postId}/flairs/${req.params.id}/edit`);
      } else {
        res.redirect(`/topics/${req.params.topicId}/posts/${req.params.postId}/flairs/${req.params.id}`);
      }
    });
  }
}
