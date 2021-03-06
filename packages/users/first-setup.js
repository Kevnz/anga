'use strict';
const Account = require('./models/account');
const Admin = require('./models/admin');
const AdminGroup = require('./models/admin-group');
const AuthAttempt = require('./models/auth-attempt');
const MongoModels = require('anga-model');
const Session = require('./models/session');
const Status = require('./models/status');
const User = require('./models/user');

const main = async function (mongodbUri, dbName) {
  let options = {
    mongodbUri: mongodbUri,
    db: dbName
  };

  const config = Object.assign({}, options.default, {
    uri: mongodbUri,
    db: 'anga'
  });
  console.log('dbconfig', config);
  const db = await MongoModels.connect(config);

  if (!db) {
    throw Error('Could not connect to MongoDB.');
  }
  console.log('connected');

  // get root user creds

  const rootEmail = 'kevin.isom@gmail.com';
  const rootPassword = 'password';

  // clear tables

  await Promise.all([
    Account.deleteMany({}),
    AdminGroup.deleteMany({}),
    Admin.deleteMany({}),
    AuthAttempt.deleteMany({}),
    Session.deleteMany({}),
    Status.deleteMany({}),
    User.deleteMany({})
  ]);

  // setup root group

  await AdminGroup.create('Root');

  // setup root admin and user

  await Admin.insertOne(
    new Admin({
      _id: Admin.ObjectId('111111111111111111111111'),
      groups: {
        root: 'Root'
      },
      name: {
        first: 'Root',
        middle: '',
        last: 'Admin'
      },
      user: {
        id: '000000000000000000000000',
        name: 'root'
      }
    })
  );

  const passwordHash = await User.generatePasswordHash(rootPassword);

  await User.insertOne(
    new User({
      _id: User.ObjectId('000000000000000000000000'),
      email: rootEmail.toLowerCase(),
      password: passwordHash.hash,
      roles: {
        admin: {
          id: '111111111111111111111111',
          name: 'Root Admin'
        }
      },
      username: 'root',
      isEmailVerified: true
    })
  );

  // all done

  MongoModels.disconnect();

  console.log('First time setup complete.');
};
module.exports = main;
