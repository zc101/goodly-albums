// Database connection abstraction

const conf = require('./config');
const knex = require('knex');

let poolOptions  = {
  client: 'mysql'
, connection: conf.get('database_params')
, useNullAsDefault: true
, pool: { min: 0, max: 50 }
};

let pool = knex(poolOptions);

module.exports = pool;
