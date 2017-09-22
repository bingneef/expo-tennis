const constants = {
  version: '0.0.1',
  serverPort: process.env.PORT || 4000,
  redisPort: process.env.REDIS_PORT || 16379,
  mongoDatabaseUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017',
  elasticSearch: {
    discogs: {
      host: process.env.ELASTICSERCH_HOST || '37.97.189.174:9200',
      index: process.env.ELASTICSERCH_INDEX || 'discogs',
    }
  }
};

module.exports = constants;
