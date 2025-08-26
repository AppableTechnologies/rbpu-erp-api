const { DataTypes } = require("sequelize");
const {sequelize} = require("../../pg_constant"); // adjust path to your Sequelize instance

const UserSession = sequelize.define(
  "UserSession",
  {
    sid: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    sess: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    expire: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "user_sessions",
    timestamps: false,
  }
);

module.exports = UserSession;
