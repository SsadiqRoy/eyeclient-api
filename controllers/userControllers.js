/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { catchAsync, generateId, filterQuery } = require('../utils/utils');

async function sendCookie(user, res) {
  const { jwt_secrete, jwt_expires, jwt_issuer, login_cookie, NODE_ENV, cookie_domain } = process.env;

  const token = jwt.sign({ id: user.id }, jwt_secrete, { expiresIn: +jwt_expires / 1000, issuer: jwt_issuer });

  res.cookie(login_cookie, token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    expires: new Date(Date.now() + +jwt_expires),
    domain: cookie_domain,
  });

  res.status(200).json({
    status: 'success',
    data: user,
  });
}

//

exports.addUser = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, access, accessLevel } = req.body;

  // console.log(access, process.env.pass_code);
  if (password !== passwordConfirm) return next(new AppError('Passwords do not match', 406, { code: 103, textCode: 'WRONG_DATA' }));
  if (access !== process.env.pass_code) return next(new AppError('Access code is incorrect', 406, { code: 100, textCode: 'ACCESS_DENIED' }));

  const id = await generateId(User);
  const user = await User.create({ id, name, email, password, accessLevel });

  res.status(200).json({
    status: 'success',
    message: `A new admin ${user.name} has been added`,
    data: user,
  });
});

//

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email }, attributes: { include: ['password'] } });

  if (!user) return next(new AppError('No account found', 404, { code: 201, textCode: 'ITEM_NOT_FOUND' }));
  if (!user.active) return next(new AppError('Account is not active', 405, { code: 100, textCode: 'ACCESS_DENIED' }));

  const verify = await bcrypt.compare(password, user.password);

  if (!verify) return next(new AppError('Email of Password is incorrect', 405, { code: 103, textCode: 'WRONG_INPUT' }));

  sendCookie(user, res);
});

//

exports.update = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  let user = await User.update({ name: name, email: email }, { where: { id: req.user.id } });

  user = await User.findByPk(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Your details have been updated',
    data: user,
  });
});

//

exports.upgrade = catchAsync(async (req, res, next) => {
  const { accessLevel, access, id } = req.body;

  if (access !== process.env.pass_code) return next(new AppError('Access code is incorrect', 406, { code: 100, textCode: 'ACCESS_DENIED' }));

  let user = await User.update({ accessLevel }, { where: { id } });
  user = await User.findByPk(id);

  res.status(200).json({
    status: 'success',
    message: 'Users Access Level has been upgraded',
    data: user,
  });
});

//

exports.password = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  // checking password equality
  if (password !== passwordConfirm) return next(new AppError('Passwords do not match', 406, { code: 103, textCode: 'WRONG_DATA' }));
  const user = await User.findOne({ where: { id: req.user.id }, attributes: { include: ['password'] } });

  // checking current password validity
  const verify = await bcrypt.compare(currentPassword, user.password);
  if (!verify) return next(new AppError('Current password is not correct', 405, { code: 103, textCode: 'WRONG_INPUT' }));

  // updating password
  const newPassword = await bcrypt.hash(password, 13);
  await User.update({ password: newPassword }, { where: { id: req.user.id } });

  res.status(200).json({
    status: 'success',
    message: 'Your password has now been changed',
    data: user,
  });
});

//

exports.deactivate = catchAsync(async (req, res, next) => {
  const { access, id } = req.body;

  if (access !== process.env.pass_code) return next(new AppError('Access code is incorrect', 406, { code: 100, textCode: 'ACCESS_DENIED' }));
  if (req.user.accessLevel < 5) return next(new AppError('You can not perform this action', 401, { code: 102, textCode: 'UNAUTHORIZED' }));

  let user = await User.update({ active: false }, { where: { id } });
  user = await User.findByPk(id);

  res.status(200).json({
    status: 'success',
    message: `${user.name}'s account has been deactivated`,
    data: user,
  });
});

//

exports.activate = catchAsync(async (req, res, next) => {
  const { access, id } = req.body;

  if (access !== process.env.pass_code) return next(new AppError('Access code is incorrect', 406, { code: 100, textCode: 'ACCESS_DENIED' }));
  if (req.user.accessLevel < 5) return next(new AppError('You can not perform this action', 401, { code: 102, textCode: 'UNAUTHORIZED' }));

  let user = await User.update({ active: true }, { where: { id } });
  user = await User.findByPk(id);

  res.status(200).json({
    status: 'success',
    message: `${user.name}'s account is back to active`,
    data: user,
  });
});

//

exports.deleteUser = catchAsync(async (req, res, next) => {
  if (req.user.accessLevel < 5) return next(new AppError('You can not perform this action', 401, { code: 102, textCode: 'UNAUTHORIZED' }));

  const user = await User.findByPk(req.params.id);
  await User.destroy({ where: { id: req.params.id } });

  res.status(200).json({
    status: 'success',
    message: `${user.name}'s account has been deleted`,
    data: user,
  });
});

//

exports.users = catchAsync(async (req, res, next) => {
  const data = await filterQuery(User, req.query, 'user');

  res.status(200).json({
    status: 'success',
    ...data,
  });
});

//

exports.single = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
