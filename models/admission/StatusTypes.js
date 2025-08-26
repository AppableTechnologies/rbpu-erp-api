const { DataTypes } = require("sequelize");
const {sequelize} = require("../../pg_constant");

const StatusTypes = sequelize.define('StatusTypes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'status_types',
  timestamps: false, // Set to true if you want Sequelize to auto-manage createdAt/updatedAt
});

module.exports = StatusTypes;
