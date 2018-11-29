'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: { msg: 'must be a valid email' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'member'
    },
    img: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'https://images.unsplash.com/photo-1536084006720-6c105926e135?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=446608b2f1c1338e947c246ad16a4988&auto=format&fit=crop&w=2250&q=80'
    }
  }, {});

  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Post, {
      foreignKey: 'userId',
      as: 'posts'
    });

    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comments'
    });

    User.hasMany(models.Vote, {
      foreignKey: 'userId',
      as: 'votes'
    });

    User.hasMany(models.Favorite, {
      foreignKey: 'userId',
      as: 'favorites'
    });

  };

  User.prototype.isAdmin = function() {
    return this.role === 'admin';
  };

  User.prototype.isOwner = function(post) {
    return this.id == post.userId;
  }

  return User;
};
