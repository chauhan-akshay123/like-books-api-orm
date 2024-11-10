let { DataTypes, sequelize } = require("../lib/");

let book = sequelize.define("book", {
 title: DataTypes.STRING,
 author: DataTypes.STRING,
 genre: DataTypes.STRING,
 year: DataTypes.INTEGER,
 summary: DataTypes.STRING,
});

module.exports = {
 book,
};