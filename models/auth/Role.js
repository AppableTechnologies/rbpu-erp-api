// models/auth/Role.js
const {sequelize}  = require('../../pg_constant');
const { DataTypes } = require("sequelize");

const Role = sequelize.define('Role', {
  role_id_pk: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  guard_name: {
    type: DataTypes.STRING(191),
    allowNull: false,
    defaultValue: "web",
  },
}, {
  tableName: "roles",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Role;
