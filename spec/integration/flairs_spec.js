const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/topics';

const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const Flair = require('../../src/db/models').Flair;

describe('routes : flairs', () => {

  beforeEach((done) => {
    this.topic;
    this.post;
    this.flair;
    sequelize.sync({force: true}).then((res) => {
      Topic.create({
        title: 'Winter Games',
        description: 'Post your Winter Games stories.'
      })
      .then((topic) => {
        this.topic = topic;
        Post.create({
          title: 'Snowball Fighting',
          body: 'So much snow!',
          topicId: this.topic.id
        })
        .then((post) => {
          this.post = post;
          Flair.create({
            name: 'Interesting',
            color: 'Blue',
            postId: this.post.id
          })
          .then((flair) => {
            this.flair = flair;
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });
  });

  describe('GET /topics/:topicId/posts/:postId/flairs/new', () => {
    it('should render a new post form', (done) => {
      request.get(`${base}/${this.topic.id}/posts/${this.post.id}/flairs/new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain('New Flair');
        done();
      });
    });
  });

  describe('POST /topics/:topicId/posts/:postId/flairs/create', () => {
    it('should create a new post and redirect', (done) => {
      const options = {
        url: `${base}/${this.topic.id}/posts/${this.post.id}/flairs/create`,
        form: {
          name: 'Exciting',
          color: 'blue'
        }
      };
      request.post(options,
        (err, res, body) => {
          Flair.findOne({where: {name: 'Exciting'}})
          .then((flair) => {
            expect(flair).not.toBeNull();
            expect(flair.name).toBe('Exciting');
            expect(flair.color).toBe('blue');
            expect(flair.postId).not.toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        }
      );
    });
  });

  describe('GET /topics/:topicId/posts/:postId/flairs/:id', () => {
    it('should render a view with the selected flair', (done) => {
      request.get(`${base}/${this.topic.id}/posts/${this.post.id}/flairs/${this.flair.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain('Interesting');
        done();
      });
    });
  });

  describe('POST /topics/:topicId/posts/:postId/flairs/:id', () => {
    it('should delete the flair with the associated ID', (done) => {
      expect(this.flair.id).toBe(1);
      request.post(`${base}/${this.topic.id}/posts/${this.post.id}/flairs/${this.flair.id}/destroy`, (err, res, body) => {
        Flair.findById(1)
        .then((flair) => {
          expect(err).toBeNull();
          expect(flair).toBeNull();
          done();
        });
      });
    });
  });

  describe('GET /topics/:topicId/posts/:postId/flairs/:id/edit', () => {
    it('should render a view with an edit flair form', (done) => {
      request.get(`${base}/${this.topic.id}/posts/${this.post.id}/flairs/${this.flair.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain('Edit Flair');
        expect(body).toContain('Interesting');
        done();
      });
    });
  });

  describe('POST /topics/:topicId/posts/:postId/flairs/:flairId/update', () => {
    it('should return a status code 302', (done) => {
      request.post({
        url: `${base}/${this.topic.id}/posts/${this.post.id}/flairs/${this.flair.id}/update`,
        form: {
          name: 'Boring',
          color: 'red'
        }
      }, (err, res, body) => {
        expect(res.statusCode).toBe(302);
        done();
      });
    });
  });

  it('should update the flair with the given values', (done) => {
    const options = {
      url: `${base}/${this.topic.id}/posts/${this.post.id}/flairs/${this.flair.id}/update`,
      form: {
        name: 'Boring',
        color: 'red'
      }
    };
    request.post(options,
      (err, res, body) => {
        expect(err).toBeNull();
        Flair.findOne({
          where: {id: this.flair.id}
        })
        .then((flair) => {
          expect(flair.name).toBe('Boring');
          expect(flair.color).toBe('red');
          done();
        });
      }
    );
  });

});
