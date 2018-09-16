const Assert = require('assert');
const Joi = require('joi');
const AngaModel = require('anga-model');
const NewDate = require('joistick/new-date');

const schema = Joi.object({
  _id: Joi.object(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  timeCreated: Joi.date().default(NewDate(), 'time of creation'),
  isComplete: Joi.bool().default(false),
  slug: Joi.string().required(),
  user: Joi.object({
    id: Joi.string().required()
  })
});
/**
 * ToDo data model
 *
 * @class ToDo
 * @extends {AngaModel}
 */
class ToDo extends AngaModel {
  static async create(title, description) {
    Assert.ok(title, 'Missing title argument.');
    Assert.ok(description, 'Missing description argument.');

    const document = new this({
      title,
      description
    });
    const todos = await this.insertOne(document);

    return todos[0];
  }

  constructor(attrs) {
    super(attrs);

    Object.defineProperty(this, '_roles', {
      writable: true,
      enumerable: false
    });
  }

  async linkUser(id) {
    Assert.ok(id, 'Missing user id argument.');

    const update = {
      $set: {
        user: {
          id
        }
      }
    };

    return await ToDo.findByIdAndUpdate(this._id, update);
  }

  static async findAllByUser(userId) {
    Assert.ok(userId, 'Missing userId argument.');

    const query = {
      'user.id': userId
    };
    return this.findAll(query);
  }
  static async findAllIncompleteByUser(userId) {
    Assert.ok(userId, 'Missing userId argument.');

    const query = {
      isComplete: false,
      'user.id': userId
    };

    return this.findAll(query);
  }
}

ToDo.collectionName = 'todos';
ToDo.schema = schema;
ToDo.indexes = [
  {
    key: {
      'user.id': 1
    }
  },
  {
    key: {
      title: 1
    },
    unique: false
  },
  {
    key: {
      slug: 1
    },
    unique: false
  }
];

module.exports = ToDo;
