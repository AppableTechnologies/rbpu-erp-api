const { DataTypes } = require("sequelize");
const {sequelize} = require("../../pg_constant");

const ProgramSession = sequelize.define(
  "ProgramSession",
  {
    program_sem_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "program_session",
    timestamps: false,
  }
);

module.exports = ProgramSession;
