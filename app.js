const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const Sequelize = require('sequelize');
const DataTypes = require('sequelize');
const accountRouter = require('./account');
const { v4: uuidv4 } = require('uuid');


const app = express();
const port = process.env.PORT || 3000;



app.use(bodyParser.json());
app.use('/', accountRouter);



// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

