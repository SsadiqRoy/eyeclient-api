const AppError = require('./appError');

function sequelizeValidationError(error) {
  const message = error.message + ': ' + error.errors[0]?.message;
  let options = { code: 200, textCode: 'INVALID_INPUT' };

  if (error.name === 'SequelizeUniqueConstraintError') options = { code: 202, textCode: 'UNIQUE_ITEM' };

  const newError = new AppError(message, 405, options);
  newError.type = error.name;

  return newError;
}

//

function globalError(error, req, res, next) {
  let newError = { ...error };

  if (error.name === 'SequelizeValidationError') newError = sequelizeValidationError(error);
  if (error.name === 'SequelizeUniqueConstraintError') newError = sequelizeValidationError(error);

  if (!newError.message) newError.message = error.message || error._message || 'No message on this error';

  res.status(error.statusCode || 500).json(newError);
}

module.exports = globalError;
