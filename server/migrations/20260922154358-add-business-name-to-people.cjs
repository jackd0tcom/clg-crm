"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("people", "business_name", {
      type: Sequelize.STRING,
      allowNull: true, // matches your model — safe for existing rows
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("people", "business_name");
  },
};
