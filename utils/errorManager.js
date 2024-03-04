/* eslint-disable */

const { existsSync, mkdirSync, appendFile, appendFileSync } = require('node:fs');

class ErrorManager {
  constructor() {
    this.#checkDir();
  }

  //

  /**
   * Write the error to the error file
   * @param {Object|String} error the error data or message
   * @param {Boolean} log Default to false - Whether the error should also be logged to the console
   * @returns The Class instace for appending
   */
  async write(error, log = false) {
    error = this.#structure(error);
    error = `\n\n${JSON.stringify(error)}`;

    if (log) console.log('🔥Error to write: ', error);

    appendFile(`errors/error.log`, error, 'utf-8', (err) => {
      if (err) console.log('🔥 Writing error to log - error', err);
    });

    return this;
  }

  //

  /**
   * Synchronously write the error to the error file
   * @param {Object|String} error the error data or message
   * @param {Boolean} log Default to false - Whether the error should also be logged to the console
   * @returns The Class instace for appending
   */
  writeSync(error, log = false) {
    error = this.#structure(error);
    error = `\n\n${JSON.stringify(error)}`;

    if (log) console.log('🔥Error to write: ', error);

    appendFileSync(`errors/error.log`, error, 'utf-8', (err) => {
      if (err) console.log('🔥 Writing error to log - error', err);
    });

    return this;
  }

  //

  #checkDir() {
    const exist = existsSync('errors');
    if (!exist) mkdirSync('errors');
  }

  //

  #structure(error) {
    if (typeof error === 'string') error = { message: error };

    // For axios requesting error
    if (error.request) {
      const { _options } = error.request;
      error = {
        message: error.message || error.errors[0].message,
        url: `${_options.protocol}://${_options.hostname}:${_options.port}${_options.path}`,
      };
    }

    let err = { ...error };

    // More data about the error
    if (!err.message) err.message = error.message;
    err.date = new Date();
    err.stack = error.stack || 'no stack';

    return err;
  }
}

module.exports = new ErrorManager();
