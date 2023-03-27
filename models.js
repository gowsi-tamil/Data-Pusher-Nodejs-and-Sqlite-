const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Initialize Sequelize
const sequelize = new Sequelize({
   dialect: 'sqlite',
   storage: 'database.sqlite',
  logging: console.log,
  dialectOptions: {
    pragma: {
      foreign_keys: 'ON',
    },
  },
});

// Define Account model
const Account = sequelize.define('Account', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    //unique: true,
  },
  accountId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
   // primaryKey: true,
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  appSecretToken: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: () => uuidv4(), // Generate a unique ID for the token
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Define Destination model
const Destination = sequelize.define('Destination', {
//  id: {
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//         primaryKey: true,
//       },
         accountId: {
        type: DataTypes.STRING,
        allowNull: false,
        //foreignKey:true
      },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  httpMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  headers: {
    type: DataTypes.JSON,
    allowNull: false,
  },


});

//Destination.belongsTo(Account, { foreignKey: 'accountId' });


// Destination.belongsTo(Account, { foreignKey: { name: 'accountId', allowNull: false }, onDelete: 'CASCADE' });
// Account.hasMany(Destination, { foreignKey: { name: 'accountId', allowNull: false }, onDelete: 'CASCADE' });



module.exports = { Account, Destination};

