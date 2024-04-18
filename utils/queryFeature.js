const { Op } = require('sequelize');

class QueryFeature {
  constructor(inquery, model) {
    this.inquery = inquery;
    this.model = model;
    this.page = 1;
    this.limit = 20;
    this.query = {};

    this.indexes = {
      media: ['title', 'year', 'rated', 'genre', 'directors', 'writers', 'actors', 'language', 'country', 'keywords'],
      user: ['name', 'email'],
    };
    // this.indexes = { media: 'title, year, rated, genre, directors, writers, actors, language, country, keywords', user: 'name, email' };

    this.execute();
  }

  exclution() {
    const excluded = ['page', 'limit', 'order', 'length', 'total', 'fields', 'consumed', 'available', 'next'];
    const query = { ...this.inquery };
    excluded.forEach((field) => query[field] && delete query[field]);
    this.query.where = query;
  }

  expandQuery(value) {
    // if value is array | string, we return same value to the field
    if (typeof value === 'string') return value.includes(',') ? value.split(',') : value;
    if (typeof value === 'object' && value.length >= 0) return value;

    // if value is and object, we assume the value has an Operator so we create a new
    //    object {[Op.operator]: value} for all operators in the value object
    const object = {};
    Object.entries(value).forEach(([subkey, subvalue]) => {
      object[Op[subkey]] = this.expandQuery(subvalue); // recursion for furthur expanding
    });

    return object;
  }

  filter() {
    this.exclution(); // removing non-where query fields

    const where = {}; // about to create a new where with Op

    // Looping through the query and expanding query fields
    Object.entries(this.query.where).forEach(([key, value]) => {
      where[key] = this.expandQuery(value);
    });

    // For full text search
    if (where.search) {
      if (typeof where.search === 'string') {
        where.search = where.search.trim();

        where[Op.or] = this.indexes[this.model].map((field) => {
          const ob = {};
          ob[field] = {};
          ob[field][Op.like] = `%${where.search}%`;

          return ob;
        });
      } else {
        where[Op.or] = where.search.flatMap((search) =>
          this.indexes[this.model].map((field) => {
            const ob = {};
            ob[field] = {};
            ob[field][Op.like] = `%${search}%`;

            return ob;
          })
        );
      }
      // `%${where.search}%`;
      // where[Op.and] = Sequelize.literal(`MATCH (${this.indexes[this.model]}) AGAINST ('${where.search}')`);
    }

    delete where.search;
    this.query.where = where;
    return this;
  }

  fields() {
    if (!this.inquery.fields) return;
    this.query.attributes = this.inquery.fields.split(',');
  }

  order() {
    if (!this.inquery.order) return;
    this.query.order = this.inquery.order.split(',').map((field) => {
      if (field.startsWith('-')) return [field.slice(1), 'DESC'];
      return [field, 'ASC'];
    });
  }

  paginate() {
    const { page, limit } = this.inquery;
    const p = +page || 1;
    const l = +limit || 30;
    (this.page = p), (this.limit = l);
    this.query.offset = p * l - l;
    this.query.limit = l;
  }

  execute() {
    this.filter();
    this.fields();
    this.order();
    this.paginate();
  }
}

module.exports = QueryFeature;
