// Set up test database and other test prerequisites

'use strict';
const assert = require('chai').assert;
const expect = require('chai').expect;

// Create a global way to 'require' relative to the base directory
global._baseDir = __dirname;
global.baseRequire = name => require(`${__dirname}/${name}`);

// Import the app configuration so we can override it below
const conf = baseRequire('manage/config');

// Disable the normal logger to avoid polluting test output
global.logger = {
  log: function () {}
, warn: function () {}
, error: function () {}
};

// Override default db connection with an alternate testing database
conf.set('database_connection_params', {
  socketPath: '/var/run/mysqld/mysqld.sock'
, user: 'goodlyalbums-test'
, password: 'goodlyalbums-test'
, database: 'GOODLYALBUMS_TEST'
});

// Override db pool options so Mocha doesn't hang forever on open sockets
// (see https://stackoverflow.com/questions/48015833/npm-test-never-exits)
conf.set('database_pool_params', {
  min: 0
, idleTimeoutMillis: 500
, reapIntervalMillis: 250
});

const db = baseRequire('manage/db');

describe('Test Setup', function() {
  it('create initial database pool connection', async function() {
    await db('visitors').select();
  });

  describe('Clear previous test data and reset auto-increments', function() {
    it(':visitors', async function() {
      await db('visitors').del();
      await db.raw('ALTER TABLE visitors AUTO_INCREMENT = 1');
    });

    it(':user_roles', async function() {
      await db('user_roles').del();
    });

    it(':users', async function() {
      await db('users').del();
      await db.raw('ALTER TABLE users AUTO_INCREMENT = 1000');
    });

    it(':roles', async function() {
      await db('roles').del();
      await db.raw('ALTER TABLE roles AUTO_INCREMENT = 1000');
    });
  });


  describe('Insert some sample data', function() {
    it(':visitors', async function() {
      let results = await db('visitors').insert({
        ip_addr: '127.0.0.1'
      , visits_count: 1
      });
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.equal(1);
    });
  });
});


after('Test Cleanup', function() {
  it('destroy database pool', async function() {
    await db.destroy();
  });
});
