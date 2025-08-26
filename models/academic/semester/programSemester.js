const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../pg_constant");


const ProgramSemester = sequelize.define("ProgramSemester", {
    program_sem_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    program_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "programs", key: "id" },
    },
    semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "semesters", key: "id" },
    },
}, {
    tableName: "program_semester",
    timestamps: false,
})

module.exports = ProgramSemester