const { DataTypes } = require('sequelize');

const database = require('../db');

const Link = database.define('Link', {
  id: { type: DataTypes.STRING(10), allowNull: false, unique: true, primaryKey: true },
  filled: { type: DataTypes.BOOLEAN, defaultValue: true },
  name: DataTypes.STRING,
  position: DataTypes.INTEGER,
  resolution: DataTypes.INTEGER,
  link: DataTypes.STRING,
});

module.exports = Link;
