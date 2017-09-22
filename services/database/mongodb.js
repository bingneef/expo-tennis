const mongoose = require('mongoose')
const constants = require('../../config/constants')
mongoose.Promise = require('bluebird')

mongoose.connect(constants.mongoDatabaseUrl, { useMongoClient: true, promiseLibrary: global.Promise });
module.exports = mongoose
