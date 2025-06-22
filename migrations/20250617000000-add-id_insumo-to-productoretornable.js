"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("ProductoRetornable", "id_insumo", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Insumo", key: "id_insumo" },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ProductoRetornable", "id_insumo");
  },
};
