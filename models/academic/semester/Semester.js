const {DataTypes} = require('sequelize');
const {sequelize} = require('../../../pg_constant');

const Semester = sequelize.define('Semester', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING(191),
        allowNull: false,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
}, {
    tableName: 'semesters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Semester