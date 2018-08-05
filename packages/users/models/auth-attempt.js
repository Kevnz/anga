'use strict';
const Assert = require('assert');
const Joi = require('joi');
const MongoModels = require('anga-model');
const NewDate = require('joistick/new-date');


const schema = Joi.object({
  _id: Joi.object(),
  ip: Joi.string().required(),
  timeCreated: Joi.date().default(NewDate(), 'time of creation'),
  username: Joi.string().required()
});


class AuthAttempt extends MongoModels {
  static async abuseDetected(ip, username) {

    Assert.ok(ip, 'Missing ip argument.');
    Assert.ok(username, 'Missing username argument.');
    console.log(ip, 'Missing ip argument.');
    console.log(username, 'Missing username argument.');
    console.log('the this', this);
    const [countByIp, countByIpAndUser] = await Promise.all([
      this.count({
        ip
      }),
      this.count({
        ip,
        username
      })
    ]);
    //const config = Config.get('/authAttempts');
    const ipLimitReached = countByIp >= 50; //;
    const ipUserLimitReached = countByIpAndUser >= 7; //config.forIpAndUser;

    return ipLimitReached || ipUserLimitReached;
  }

  static async create(ip, username) {

    Assert.ok(ip, 'Missing ip argument.');
    Assert.ok(username, 'Missing username argument.');

    const document = new this({
      ip,
      username
    });
    const authAttempts = await this.insertOne(document);

    return authAttempts[0];
  }
}


AuthAttempt.collectionName = 'anga_authAttempts';
AuthAttempt.schema = schema;
AuthAttempt.indexes = [{
  key: {
    ip: 1,
    username: 1
  }
}, {
  key: {
    username: 1
  }
}];


module.exports = AuthAttempt;