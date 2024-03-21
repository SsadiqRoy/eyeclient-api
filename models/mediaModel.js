const { DataTypes } = require('sequelize');

const User = require('./userModel');
const Season = require('./seasonModel');
const Episode = require('./episodeModel');
const Link = require('./linkModel');

const database = require('../db');

const Media = database.define(
  'Media',
  {
    id: { type: DataTypes.STRING(10), allowNull: false, unique: true, primaryKey: true },
    imdbId: DataTypes.STRING,
    type: { type: DataTypes.ENUM, allowNull: false, values: ['movie', 'game', 'series', 'collection'] },
    title: { type: DataTypes.STRING, allowNull: false },
    year: DataTypes.STRING,
    rated: DataTypes.STRING,
    released: DataTypes.DATE,
    genre: DataTypes.STRING,
    directors: DataTypes.STRING,
    writers: DataTypes.STRING(500),
    actors: DataTypes.STRING,
    plot: DataTypes.STRING,
    poster: DataTypes.STRING,
    language: DataTypes.STRING,
    country: DataTypes.STRING,
    runtime: DataTypes.STRING,
    imdbRating: { type: DataTypes.FLOAT, defaultValue: null },
    totalSeasons: DataTypes.INTEGER,
    keywords: DataTypes.STRING,
    about: DataTypes.STRING(10000),
    episodes: DataTypes.INTEGER,
    lastEpisodeOn: DataTypes.DATE,
    collectionType: { type: DataTypes.ENUM, values: ['game', 'movie', 'series'] },
  },
  {
    indexes: [
      {
        type: 'FULLTEXT',
        name: 'textsearch',
        fields: ['title', 'year', 'rated', 'genre', 'directors', 'writers', 'actors', 'language', 'country', 'keywords'],
      },
    ],
  }
);

// User
User.hasMany(Media, { foreignKey: 'createdBy', sourceKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
Media.belongsTo(User, { foreignKey: 'createdBy', targetKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });

User.hasMany(Season, { foreignKey: 'createdBy', sourceKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
Season.belongsTo(User, { foreignKey: 'createdBy', targetKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });

User.hasMany(Episode, { foreignKey: 'createdBy', sourceKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
Episode.belongsTo(User, { foreignKey: 'createdBy', targetKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });

User.hasMany(Link, { foreignKey: 'createdBy', sourceKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
Link.belongsTo(User, { foreignKey: 'createdBy', targetKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });

// Media
// Media.hasMany(Media, { as: 'collection', sourceKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
// Media.belongsTo(Media, { as: 'collection', targetKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });

// Media.hasMany(Media, { foreignKey: 'collection', as: 'collections', sourceKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
// Media.belongsTo(Media, { foreignKey: 'collection', as: 'Collections', targetKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });

Media.hasMany(Media, { foreignKey: 'collection', as: 'Collections', sourceKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
Media.belongsTo(Media, { foreignKey: 'collection', as: 'CollectionId', targetKey: 'id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });

Media.hasMany(Season, { foreignKey: 'series', sourceKey: 'id', onDelete: 'CASCADE', onUpdate: 'NO ACTION' });
Season.belongsTo(Media, { foreignKey: 'series', targetKey: 'id', onDelete: 'CASCADE', onUpdate: 'NO ACTION' });

Media.hasMany(Episode, { foreignKey: 'series', sourceKey: 'id', onDelete: 'CASCADE', onUpdate: 'NO ACTION' });
Episode.belongsTo(Media, { foreignKey: 'series', targetKey: 'id', onDelete: 'CASCADE', onUpdate: 'NO ACTION' });

Media.hasMany(Link, { foreignKey: 'media', sourceKey: 'id', onDelete: 'CASCADE', onUpdate: 'NO ACTION' });
Link.belongsTo(Media, { foreignKey: 'media', targetKey: 'id', onDelete: 'CASCADE', onUpdate: 'NO ACTION' });

// Episode
Season.hasMany(Episode, { foreignKey: 'season', sourceKey: 'id', onDelete: 'CASCADE', onUpdate: 'NO ACTION' });
Episode.belongsTo(Season, { foreignKey: 'season', targetKey: 'id', onDelete: 'CASCADE', onUpdate: 'NO ACTION' });

Episode.hasMany(Link, { foreignKey: 'episode', sourceKey: 'id', onDelete: 'CASCADE', onUpdate: 'NO ACTION' });
Link.belongsTo(Episode, { foreignKey: 'episode', targetKey: 'id', onDelete: 'CASCADE', onUpdate: 'NO ACTION' });

module.exports = Media;
