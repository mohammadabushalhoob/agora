'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Users',
      'img',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'https://images.unsplash.com/photo-1536084006720-6c105926e135?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=446608b2f1c1338e947c246ad16a4988&auto=format&fit=crop&w=2250&q=80'
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'img');
  }
};
