const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/topics/';
const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;
const Comment = require('../../src/db/models').Comment;

describe('routes : comments', () => {
    beforeEach((done) => {
        this.user;
        this.topic;
        this.post;
        this.comment;

        sequelize.sync({force: true}).then((res) => {
            User.create({
                email: 'starman@tesla.com',
                password: 'Trekkie4lyfe'
            })
            .then((user) => {
                this.user = user;
                Topic.create({
                    title: 'Expeditions to Alpha Centauri',
                    description: 'A compilation of reports from recent visits to the star system.',
                    posts: [{
                        title: 'My first visit to Proxima Centauri b',
                        body: 'I saw some rocks.',
                        userId: this.user.id
                    }]
                }, {
                    include: {
                        model: Post,
                        as: 'posts'
                    }
                })
                .then((topic) => {
                    this.topic = topic;
                    this.post = this.topic.posts[0];
                    Comment.create({
                        body: 'ay caramba!!!!!',
                        userId: this.user.id,
                        postId: this.post.id
                    })
                    .then((comment) => {
                        this.comment = comment;
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    // TEST START HERE
    // Guest context
    describe('guest attempting to perform CRUD actions for Comment', () => {
        beforeEach((done) => {
            request.get({ // mock authentication
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: 0 // flag to indicate mock auth to destroy any session
                }
            },
                (err, res, body) => {
                    done();
                }
            );
        });

        describe('POST /topics/:topicId/posts/:postId/comments/create', () => {
            it('should not create a new comment', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
                    form: {
                        body: 'This comment is amazing!'
                    }
                };
                request.post(options,
                    (err, res, body) => {
                        Comment.findOne({where: {body: 'This comment is amazing!'}})
                        .then((comment) => {
                            expect(comment).toBeNull(); // ensure no comment was created
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

        describe('POST /topics/:topicId/posts/:postId/comments/:id/destroy', () => {
            it('should not delete the comment with the associated ID', (done) => {
                Comment.findAll()
                .then((comments) => {
                    const commentCountBeforeDelete = comments.length;
                    expect(commentCountBeforeDelete).toBe(1);
                    request.post(
                        `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                        (err, res, body) => {
                            Comment.findAll()
                            .then((comments) => {
                                expect(err).toBeNull();
                                expect(comments.length).toBe(commentCountBeforeDelete);
                                done();
                            });
                        }
                    );
                });
            });
        });
    }); // Guest context end

    // Member context
    describe('signed in user performing CRUD actions for Comment', () => {
        beforeEach((done) => {
            request.get({ // mock authentication
                url: 'http://localhost:3000/auth/fake',
                form: {
                    role: 'member',
                    userId: this.user.id
                }
            },
                (err, res, body) => {
                    done();
                }
            );
        });

        describe('POST /topics/:topicId/posts/:postId/comments/create', () => {
            it('should create a new comment and redirect', (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
                    form: {
                        body: 'This comment is amazing!'
                    }
                };
                request.post(options,
                    (err, res, body) => {
                        Comment.findOne({where: {body: 'This comment is amazing!'}})
                        .then((comment) => {
                            expect(comment).not.toBeNull();
                            expect(comment.body).toBe('This comment is amazing!');
                            expect(comment.id).not.toBeNull();
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

        describe('POST /topics/:topicId/posts/:postId/comments/:id/destroy', () => {
            it('should delete the comment with the associated ID', (done) => {
                Comment.findAll()
                .then((comments) => {
                    const commentCountBeforeDelete = comments.length;
                    expect(commentCountBeforeDelete).toBe(1);
                    request.post(
                        `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                        (err, res, body) => {
                            expect(res.statusCode).toBe(302);
                            Comment.findAll()
                            .then((comments) => {
                                expect(err).toBeNull();
                                expect(comments.length).toBe(commentCountBeforeDelete - 1);
                                done();
                            });
                        }
                    );
                });
            });
        });
    }); // Member context end

    // Non-owner context
    describe('signed in user thats not an onwer performing CRUD actions for Comment', () => {
        beforeEach((done) => {
            request.get({ // mock authentication
                url: 'http://localhost:3000/auth/fake',
                form: {
                    role: 'member',
                    userId: 999,
                    email: this.user.email
                }
            },
                (err, res, body) => {
                    done();
                }
            );
        });

        describe('POST /topics/:topicId/posts/:postId/comments/:id/destroy', () => {
            it('should not delete the comment with the associated ID if member is not creator of comment', (done) => {
                expect(this.comment).not.toBeNull();
                request.post(
                    `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                    (err, res, body) => {
                        Comment.findByPk(this.comment.id)
                        .then((comment) => {
                            expect(comment).not.toBeNull();
                            expect(comment.body).toBe('ay caramba!!!!!');
                            expect(res.statusCode).toBe(401);
                            done();
                        })
                        .catch((err) => {
                            console.log(err)
                            done();
                        })
                    }
                );
            });
        });
    }); // End of non-owner context

    // Admin context
    describe('signed in user that is an admin performing CRUD actions for Comment', () => {
        beforeEach((done) => {
            request.get({ // mock authentication
                url: 'http://localhost:3000/auth/fake',
                form: {
                    role: 'admin',
                    userId: 999,
                    email: this.user.email
                }
            },
                (err, res, body) => {
                    done();
                }
            );
        });

        describe('POST /topics/:topicId/posts/:postId/comments/:id/destroy', () => {
            it('should delete the comment with the associated ID if member is not owner but is admin', (done) => {
                expect(this.comment).not.toBeNull();
                request.post(
                    `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                    (err, res, body) => {
                        Comment.findByPk(this.comment.id)
                        .then((comment) => {
                            expect(res.statusCode).toBe(302);
                            expect(comment).toBeNull();
                            done();
                        })
                        .catch((err) => {
                            console.log(err)
                            done();
                        })
                    }
                );
            });
        });
    }); // End of admin context
});