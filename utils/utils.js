const { randomUUID } = require('node:crypto');

exports.catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

//

exports.generateId = async (Model) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const id = randomUUID().split('-').join('').slice(0, 10);

    const instance = await Model.findByPk(id);

    if (!instance) return id;

    return this.generateId(Model);
  } catch (error) {
    throw error;
  }
};
