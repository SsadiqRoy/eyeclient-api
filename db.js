const Sequelize = require('sequelize');

const database = new Sequelize(process.env.db_name, process.env.db_user, process.env.db_password, {
  port: process.env.db_port,
  host: process.env.db_host,
  dialect: process.env.db_dialect,
});

module.exports = database;
