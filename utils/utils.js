const { randomUUID } = require('node:crypto');
const QueryFeature = require('./queryFeature');

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

//

exports.updater = async (fn) => {
  try {
    await fn();
  } catch (error) {
    console.log('🔥 Updater Error', error);
  }
};

//

exports.filterQuery = async (Model, reqQuery, model = 'media') => {
  const prevQuery = { ...reqQuery };

  const { page, limit, query } = new QueryFeature(reqQuery, model);

  const data = await Model.findAll(query);
  const total = await Model.count({ where: query.where });

  // console.log(total, prevQuery.total);
  const { length } = data;
  let consumed = (+prevQuery.consumed || 0) + length;
  if (prevQuery.total && total !== +prevQuery.total) consumed = length;

  const available = total - consumed;

  const meta = { ...prevQuery, page, limit, total, length, available, consumed };
  return { meta, data };
};
