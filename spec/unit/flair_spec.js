const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const Flair = require('../../src/db/models').Flair;

describe('Flair', () => {
  beforeEach((done) => {
    this.topic;
    this.post;
    this.flair;
    sequelize.sync({force: true}).then((res) => {
      Topic.create({
        title: 'Expeditions to Alpha Centauri',
        description: 'A compilation of reports from recent visits to the star system.'
      })
      .then((topic) => {
        this.topic = topic;
        Post.create({
          title: 'My first visit to Proxima Centauri b',
          body: 'I saw some rocks.',
          topicId: this.topic.id
        })
        .then((post) => {
          this.post = post;
          Flair.create({
            name: 'Exciting',
            color: 'Blue',
            postId: this.post.id
          })
          .then((flair) => {
            this.flair = flair;
            done();
          });
        });
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

  describe('#create()', () => {
    it('should create a flair object with a name, color, and assigned post', (done) => {
      Flair.create({
        name: 'Exciting',
        color: 'Blue',
        flairId: this.flair.id
      })
      .then((flair) => {
        expect(flair.name).toBe('Exciting');
        expect(flair.color).toBe('Blue');
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it('should not create a flair with missing name, color, or assigned post', (done) => {
      Flair.create({
        name: 'Exciting'
      })
      .then((flair) => {
        done();
      })
      .catch((err) => {
        expect(err.message).toContain('Flair.color cannot be null');
        expect(err.message).toContain('Flair.postId cannot be null');
        done();
      })
    });
  });

  describe('#setPost()', () => {
    it('should associate a post and a flair together', (done) => {
      Post.create({
        title: 'What I think of milk',
        body: 'Milk is good.',
        topicId: this.topic.id
      })
      .then((newPost) => {
        expect(this.flair.postId).toBe(this.post.id);
        this.flair.setPost(newPost)
        .then((flair) => {
          expect(flair.postId).toBe(newPost.id);
          done();
        });
      });
    });
  });

  describe('#getPost()', () => {
    it('should return the associated Post', (done) => {
      this.flair.getPost()
      .then((associatedPost) => {
        expect(associatedPost.title).toBe('My first visit to Proxima Centauri b');
        done();
      });
    });
  });

});
