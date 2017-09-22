const winston = require('winston')

winston.add(winston.transports.File, { filename: 'log/output.log' });

module.exports = winston
