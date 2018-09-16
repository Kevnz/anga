const MongodbMemoryServer = require('mongodb-memory-server').default;

const setupServerReturnUri = async () => {
  const mongoServer = new MongodbMemoryServer({
    debug: true,
    instance: {
      dbName: 'anga',
      port: 27017
    }
  });

  const inMemoryUri = await mongoServer.getConnectionString();
  console.log('dev db', inMemoryUri);
  return inMemoryUri;
};
setupServerReturnUri();
