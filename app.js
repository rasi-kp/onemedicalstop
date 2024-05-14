const express = require('express');
const dotenv = require('dotenv');
var logger = require('morgan');
// const path = require('path');

const main = require('./routes/index');

require('./config/dbconnection');

dotenv.config();
const app = express();
app.use(logger('dev'));

// app.use(express.static(path.join(__dirname, 'public')));
// Use routes
app.use('/', main);

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});