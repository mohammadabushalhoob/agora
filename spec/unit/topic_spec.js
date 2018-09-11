const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;

describe('Topic', () => {

  beforeEach((done) => {
    this.topic;
    this.post;
    sequelize.sync({force: true}).then((res) => {
      Topic.create({
        title: 'UFOs and Hot Dogs',
        description: 'What do they have in common?'
      })
      .then((topic) => {
        this.topic = topic;

        Post.create({
          title: 'My take on UFOs and Hot Dogs',
          body: 'They are not the same shape.',
          topicId: this.topic.id
        })
        .then((post) => {
          this.post = post;
          done();
        });
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

  describe('#create()', () => {
    it('should create a topic object with a title and description', (done) => {
      Topic.create({
        title: 'Validity of Thanos',
        description: 'Did he have a point?'
      })
      .then((topic) => {
        expect(topic.title).toBe('Validity of Thanos');
        expect(topic.description).toBe('Did he have a point?');
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it('should not create a topic with missing title or description', (done) => {
      Topic.create({
        title: 'Validity of Thanos'
      })
      .then((topic) => {
        done();
      })
      .catch((err) => {
        expect(err.message).toContain('Topic.description cannot be null');
        done();
      });
    });
  });

  describe('#getPosts()', () => {
    it('should return an array of posts associated with the topic', (done) => {
      Post.create({
        title: 'Hot Dogs and UFOs are not associated',
        body: 'They are just not.',
        topicId: this.topic.id
      });
      this.topic.getPosts()
      .then((posts) => {
        posts.forEach((post) => {
          expect(post.topicId).toBe(this.topic.id);
        });
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

});
