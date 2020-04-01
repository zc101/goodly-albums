// Test manage/users.js

'use strict';
const assert = require('chai').assert;
const expect = require('chai').expect;
const db = baseRequire('manage/db');

describe(':manage/users', function() {
  var usermgr;
  before('require successfully', function() {
    usermgr = baseRequire('manage/users');
  });

  describe('#isValidUsername()', function() {
    it('returns false given a non-string parameter', function() {
      expect(usermgr.isValidUsername(12345)).to.equal(false);
    });

    it('returns false given a too-short username', function() {
      expect(usermgr.isValidUsername('ab')).to.equal(false);
    });

    it('returns false given a username with invalid character(s)', function() {
      expect(usermgr.isValidUsername('__404&')).to.equal(false);
    });

    it('returns true for a valid username', function() {
      expect(usermgr.isValidUsername('username')).to.equal(true);
    });
  });


  describe('#addUser()', function() {
    it('returns null given an invalid username', async function() {
      expect(await usermgr.addUser('__404&', 'p&ssword')).to.equal(null);
      expect(await usermgr.addUser(404, 'p&ssword')).to.equal(null);
    });

    it('returns null given an invalid password', async function() {
      expect(await usermgr.addUser('users_test01', 'pw')).to.equal(null);
      expect(await usermgr.addUser('users_test02', 12345678)).to.equal(null);
    });

    it('returns an auto-increment ID when a new user is added - given name & password only', async function() {
      expect(await usermgr.addUser('users_test11', 'p&ssword')).to.equal(1000);
      expect(await usermgr.addUser('users_test12', 'p&ssword')).to.equal(1001);
    });

    it('returns an ID when a new user is added - given name, password, & ID', async function() {
      expect(await usermgr.addUser('users_test21', 'p&ssword', 21)).to.equal(21);
    });

    it('returns null when a given username already exists', async function() {
      expect(await usermgr.addUser('users_test21', 'p&ssword')).to.equal(null);
    });

    it('returns null when a given userID already exists', async function() {
      expect(await usermgr.addUser('users_test31', 'p&ssword', 21)).to.equal(null);
    });
  });


  describe('#getUserID()', function() {
    it('returns null given an invalid username', async function() {
      expect(await usermgr.getUserID(12345)).to.equal(null);
      expect(await usermgr.getUserID('__404&')).to.equal(null);
    });

    it('returns null given a valid, non-existent username', async function() {
      expect(await usermgr.getUserID('bogus_user')).to.equal(null);
    });

    it('returns an ID given an existing username', async function() {
      expect(await usermgr.getUserID('users_test21')).to.equal(21);
    });
  });


  describe.skip('#getUsername() [not currently implemented]', function() {
    it('returns null given a non-number argument', async function() {
      expect(await usermgr.getUsername('users_test21')).to.equal(null);
    });

    it('returns null given a non-existent userID', async function() {
      expect(await usermgr.getUsername(27)).to.equal(null);
    });

    it('returns a username given an existing userID', async function() {
      expect(await usermgr.getUsername(21)).to.equal('users_test21');
    });
  });


  describe('#deleteUserByID()', function() {
    it('throws when given a non-number argument', function(done) {
      usermgr.deleteUserByID('users_test21')
        .then((retval) => done(retval))
        .catch(() => done());
    });

    it('returns false given a non-existent userID', async function() {
      expect(await usermgr.deleteUserByID(27)).to.equal(false);
    });

    it('returns true when a user is deleted', async function() {
      expect(await usermgr.deleteUserByID(21)).to.equal(true);
    });
  });


  describe('#deleteUser()', function() {
    it('returns false given an invalid username', async function() {
      expect(await usermgr.deleteUser('__404&')).to.equal(false);
    });

    it('returns false given a valid, non-existent username', async function() {
      expect(await usermgr.deleteUser('bogus_user')).to.equal(false);
    });

    it('returns true when an existing entry is deleted by name', async function() {
      expect(await usermgr.deleteUser('users_test11')).to.equal(true);
    });

    it('returns true when an existing entry is deleted by ID', async function() {
      expect(await usermgr.deleteUser(1001)).to.equal(true);
    });
  });
});
