const serverPort = process.env.PORT || 4000
const baseUrl = process.env.baseUrl || 'http://localhost'

export default {
  version: '0.0.1',
  serverPort,
  baseUrl,
  redisPort: process.env.REDIS_PORT || 16379,
  mongoDatabaseUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017',
  elasticSearch: {
    discogs: {
      host: process.env.ELASTICSERCH_HOST || '37.97.189.174:9200',
      index: process.env.ELASTICSERCH_INDEX || 'discogs',
    }
  },
  staticUrl: process.env.STATIC_URL || `${baseUrl}:${serverPort}`,
  tokens: {
    sportradar: process.env.SPORTRADAR_TOKEN || '',
    apolloEngine: process.env.APOLLO_ENGINE_KEY || null,
  },
};
