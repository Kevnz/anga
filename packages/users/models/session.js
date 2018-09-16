'use strict';
const Assert = require('assert');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('anga-model');
const NewDate = require('joistick/new-date');
const Useragent = require('useragent');
const uuid = require('uuid');

const schema = Joi.object({
  _id: Joi.object(),
  browser: Joi.string().required(),
  ip: Joi.string().required(),
  key: Joi.string().required(),
  lastActive: Joi.date().default(NewDate(), 'time of last activity'),
  os: Joi.string().required(),
  timeCreated: Joi.date().default(NewDate(), 'time of creation'),
  userId: Joi.string().required()
});

class Session extends MongoModels {
  static async create(userId, ip, userAgent) {
    Assert.ok(userId, 'Missing userId argument.');
    Assert.ok(ip, 'Missing ip argument.');
    Assert.ok(userAgent, 'Missing userAgent argument.');

    const keyHash = await this.generateKeyHash();
    const agentInfo = Useragent.lookup(userAgent);
    const browser = agentInfo.family;
    const document = new this({
      browser,
      ip,
      key: keyHash.hash,
      os: agentInfo.os.toString(),
      userId
    });
    const sessions = await this.insertOne(document);

    sessions[0].key = keyHash.key;

    return sessions[0];
  }

  static async findByCredentials(id, key) {
    Assert.ok(id, 'Missing id argument.');
    Assert.ok(key, 'Missing key argument.');

    const session = await this.findById(id);

    if (!session) {
      return;
    }

    const keyMatch = await bcrypt.compare(key, session.key);

    if (keyMatch) {
      return session;
    }
  }

  static async generateKeyHash() {
    const key = uuid.v4();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(key, salt);

    return {
      key,
      hash
    };
  }

  async updateLastActive() {
    const update = {
      $set: {
        lastActive: new Date()
      }
    };

    await Session.findByIdAndUpdate(this._id, update);
  }
}

Session.collectionName = 'anga_sessions';
Session.schema = schema;
Session.indexes = [
  {
    key: {
      userId: 1
    }
  }
];

module.exports = Session;
