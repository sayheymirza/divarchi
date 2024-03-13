const { middleware, api } = require('./app');
const database = require('./core/database');

module.exports = {
    middleware,
    api,
    database,
}