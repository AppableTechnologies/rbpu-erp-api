const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../pg_constant");

const BatchProgram = sequelize.define("BatchProgram", {
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "batches", key: "id" },
  },
  program_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "programs", key: "id" },
  },
}, {
  tableName: "batch_program",
  timestamps: false,
});

module.exports = BatchProgram;
