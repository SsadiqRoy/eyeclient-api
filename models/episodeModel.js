const { DataTypes } = require('sequelize');

const database = require('../db');

const Episode = database.define('Episode', {
  id: { type: DataTypes.STRING(10), allowNull: false, unique: true, primaryKey: true },
  imdbId: DataTypes.STRING,
  imdbSeries: DataTypes.STRING,
  episode: { type: DataTypes.INTEGER, allowNull: false },
  title: DataTypes.STRING,
  plot: DataTypes.STRING,
  poster: DataTypes.STRING,
  runtime: DataTypes.STRING,
  rated: DataTypes.STRING,
  imdbRating: DataTypes.STRING,
  released: DataTypes.DATE,
});

module.exports = Episode;
