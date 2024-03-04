const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const globalError = require('./utils/globalError');
const { loggedIn } = require('./middlewares/globalMdw');
const userRoutes = require('./routes/userRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

app.use(loggedIn);
app.use('/v1/users', userRoutes);
app.use('/v1/users', mediaRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    status: 'failed',
    message: `Could not get url: ${req.originalUrl}`,
  });
});

app.use(globalError);

module.exports = app;
