const { DataTypes } = require('sequelize');

const database = require('../db');

const Season = database.define('Season', {
  id: { type: DataTypes.STRING(10), allowNull: false, unique: true, primaryKey: true },
  season: { type: DataTypes.INTEGER, allowNull: false },
  episodes: DataTypes.INTEGER,
  released: DataTypes.DATE,
  poster: DataTypes.STRING,
});

module.exports = Season;
