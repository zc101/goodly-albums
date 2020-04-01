// Database connection abstraction

const conf = require('./config');
const knex = require('knex');

let poolOptions  = {
  client: 'mysql'
, connection: conf.get('database_connection_params')
, pool: conf.get('database_pool_params')
, useNullAsDefault: true
};

let pool = knex(poolOptions);

module.exports = pool;
