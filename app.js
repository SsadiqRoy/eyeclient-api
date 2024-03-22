const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');

const app = express();
const corsOrigin = [
  'http://localhost:3100',
  'https://www.eyeclient.com',
  'https://eyeclient.com',
  'https://www.api.eyeclient.com',
  'https://api.eyeclient.com',
];

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: corsOrigin, credentials: true }));

const globalError = require('./utils/globalError');
const { loggedIn } = require('./middlewares/globalMdw');
const userRoutes = require('./routes/userRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const AppError = require('./utils/appError');

app.use(loggedIn);
app.use('/v1/users', userRoutes);
app.use('/v1/media', mediaRoutes);

app.use('*', (req, res, next) => {
  next(new AppError(`Could not get url: ${req.originalUrl}`, 404));
});

app.use(globalError);

module.exports = app;
