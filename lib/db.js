// Database connection abstraction

let knex = require('knex');

let poolOptions  = {
  client: 'mysql'
, connection: {
    socketPath      : '/var/run/mysqld/mysqld.sock'
  , user            : 'goodlyalbums-app'
  , password        : 'goodlyalbums-app'
  , database        : 'GOODLYALBUMS'
  }
, useNullAsDefault: true
, pool: { min: 0, max: 50 }
};

let pool = knex(poolOptions);

module.exports = pool;
