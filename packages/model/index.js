const mongoModels = require('mongo-models');

/**
 * serialize
 *
 * @returns JSONAPI compatible object
 */

/*
 mongoModels.prototype.serialize = function () {

  const description = Joi.describe(this.constructor.schema);
  const keys = Object.keys(description.children);
  const attrs = {};
  keys.forEach((k) => {
    attrs[k] = this[k];
  });
  console.log('attrs', attrs);
  const obj = {
    type: this.constructor.collectionName,
    id: this._id,
    attributes: attrs
  };
  return obj;
};
*/
module.exports = mongoModels;
