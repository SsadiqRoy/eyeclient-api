const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const database = require('../db');

//

const User = database.define(
  'User',
  {
    id: { type: DataTypes.STRING(10), allowNull: false, unique: true, primaryKey: true },
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: DataTypes.STRING,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    accessLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: { min: 1, max: 5 },
    },
    included: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { defaultScope: { attributes: { exclude: ['password'] } } }
);

User.addHook('beforeCreate', 'encryptPassword', async (instance) => {
  const password = await bcrypt.hash(instance.password, 13);
  instance.password = password;
});

module.exports = User;
