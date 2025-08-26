const { DataTypes } = require("sequelize");
const {sequelize} = require("../../pg_constant"); // adjust path to your Sequelize instance

const UserRole = sequelize.define(
  "UserRole",
  {
    user_id_fk: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id_pk", //PK for users table
      },
    },
    role_id_fk: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "roles",
        key: "role_id_pk", //PK for roles table
      },
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_roles",
    timestamps: false,
  }
);

module.exports = UserRole;
