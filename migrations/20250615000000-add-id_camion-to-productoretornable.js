"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("ProductoRetornable", "id_camion", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Camion", key: "id_camion" },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ProductoRetornable", "id_camion");
  },
};
