const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/utils');
const User = require('../models/userModel');

exports.protect = catchAsync(async (req, res, next) => {
  if (req.user) return next();

  const cookie = req.cookies?.[process.env.login_cookie];
  if (!cookie) return next(new AppError('You are not logged in', 406, { code: 100, textCode: 'ACCESS_DENIED' }));

  let { id, iat, exp } = jwt.verify(cookie, process.env.jwt_secrete);
  iat = iat * 1000;
  exp = exp * 1000;

  if (Date.now() > exp) return next(new AppError('Log in expired. Please log in again', 417, { code: 101, textCode: 'ACCESS_EXPIRED' }));

  const user = await User.findByPk(id);
  if (!user) return next(new AppError('No account found', 404, { code: 201, textCode: 'ITEM_NOT_FOUND' }));

  if (!user.active) return next(new AppError('Account is not active', 405, { code: 100, textCode: 'ACCESS_DENIED' }));

  req.user = user;
  next();
});

//

exports.loggedIn = catchAsync(async (req, res, next) => {
  const cookie = req.cookies?.[process.env.login_cookie];

  // console.log(cookie);
  if (!cookie) return next();

  let { id, iat, exp } = jwt.verify(cookie, process.env.jwt_secrete);
  iat = iat * 1000;
  exp = exp * 1000;

  if (Date.now() > exp) return next();

  const user = await User.findByPk(id);
  if (!user) return next();

  if (!user.active) return next();

  req.user = user;
  next();
});

//

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.user)
    return res.status(200).json({
      status: 'success',
      data: req.user,
    });

  const cookie = req.cookies?.[process.env.login_cookie];
  if (!cookie) return next(new AppError('You are not logged in', 406, { code: 100, textCode: 'ACCESS_DENIED' }));

  let { id, iat, exp } = jwt.verify(cookie, process.env.jwt_secrete);
  iat = iat * 1000;
  exp = exp * 1000;

  if (Date.now() > exp) return next(new AppError('Log in expired. Please log in again', 417, { code: 101, textCode: 'ACCESS_EXPIRED' }));

  const user = await User.findByPk(id);
  if (!user) return next(new AppError('No account found', 404, { code: 201, textCode: 'ITEM_NOT_FOUND' }));

  if (!user.active) return next(new AppError('Account is not active', 405, { code: 100, textCode: 'ACCESS_DENIED' }));

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
