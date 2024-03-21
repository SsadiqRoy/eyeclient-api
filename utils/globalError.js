const AppError = require('./appError');
const errorManager = require('./errorManager');

function sequelizeValidationError(error) {
  const message = error.message + ': ' + error.errors[0]?.message;
  let options = { code: 200, textCode: 'INVALID_INPUT' };

  if (error.name === 'SequelizeUniqueConstraintError') options = { code: 202, textCode: 'UNIQUE_ITEM' };

  const newError = new AppError(message, 405, options);
  newError.type = error.name;

  return newError;
}

//

function sequelizeDatabaseError(error) {
  const newError = new AppError(error.message, 405, { code: 200, textCode: 'INVALID_INPUT' });
  newError.type = error.name;

  if (process.env.NODE_ENV === 'development') return newError;
  errorManager.write(newError);
  return new AppError('Sorry, Problem from our server', 405, { code: 204, textCode: 'DATABASE_ERROR' });
}

//

function globalError(error, req, res, next) {
  let newError = { ...error };
  // console.log('🍎', error);

  if (error.name === 'SequelizeValidationError') newError = sequelizeValidationError(error);
  if (error.name === 'SequelizeUniqueConstraintError') newError = sequelizeValidationError(error);
  if (error.name === 'SequelizeDatabaseError') newError = sequelizeDatabaseError(error);

  if (!newError.message) newError.message = error.message || error._message || 'No message on this error';

  console.log('🔥global error', newError);
  res.status(error.statusCode || 500).json(newError);
}

module.exports = globalError;
