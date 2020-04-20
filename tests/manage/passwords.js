// Test manage/passwords.js

'use strict';
const assert = require('chai').assert;
const expect = require('chai').expect;
const conf = baseRequire('manage/config');
const db = baseRequire('manage/db');

describe(':manage/passwords', function() {
  var pwmgr;
  const validPW = 'P&ssw0rd';
  const validNewPW = 'P&ssw0rd2';
  const validNew2PW = 'P&ssw0rd3';
  const invalidPW = 'ab'; // Too short
  const testUserID = 11;
  const bogusUserID = 17;
  const testUsername = 'passwords_testuser';
  const bogusUsername = 'bogus_user';

  before('require script and add sample user successfully', async function() {
    pwmgr = baseRequire('manage/passwords');

    // Add a user for checking/updating tests.
    // If generateSalt(), hashPassword(), and/or the insert fail here for some
    // reason, chances are all dependent tests would have failed anyway.
    // But, we can at least avoid any addUser() issues by using a static insert.
    let salt = pwmgr.generateSalt();
    let hash = pwmgr.hashPassword(validPW, salt);
    let results = await db('users').insert({
      user_id: testUserID
    , user_name: testUsername
    , password_hash: hash
    , password_salt: salt
    });
    expect(results).to.have.lengthOf(1);
    expect(results[0]).to.equal(testUserID);
  });


  describe('#isValidPassword()', function() {
    it('returns false given a non-string parameter', function() {
      expect(pwmgr.isValidPassword(12345)).to.equal(false);
    });

    it('returns false given a too-short password', function() {
      expect(pwmgr.isValidPassword('ab')).to.equal(false);
    });

    it('returns false given a password with invalid character(s)', function() {
      // Default password regex currently should include ASCII codes 32-126 inclusive
      expect(pwmgr.isValidPassword(validPW + String.fromCharCode(31))).to.equal(false);
      expect(pwmgr.isValidPassword(validPW + String.fromCharCode(127))).to.equal(false);
      expect(pwmgr.isValidPassword(validPW + String.fromCharCode(200))).to.equal(false); // 8-bit Unicode letter
      expect(pwmgr.isValidPassword(validPW + String.fromCharCode(300))).to.equal(false); // 16-bit Unicode letter
    });

    it('returns true for a valid password', function() {
      expect(pwmgr.isValidPassword(validPW)).to.equal(true);
    });
  });


  describe('#generateSalt()', function() {
    let saltLen = conf.get('password_salt_len');
    let saltRegex = /^[a-zA-Z0-9\+\/=]+$/;
    var salt;

    it('does not throw an error', function() {
      expect(() => (salt = pwmgr.generateSalt())).to.not.throw();
    });

    it('returns a string', function() {
      expect(typeof(salt)).to.equal('string');
    });

    it('returns the configured length of characters', function() {
      expect(salt.length).to.equal(saltLen);
    });

    it('returns only hex characters', function() {
      expect(salt.match(saltRegex)).to.not.equal(null);
    });
  });


  describe('#hashPassword()', function() {
    let hashLen = conf.get('password_hash_len');
    let hashRegex = /^[a-zA-Z0-9\+\/=]+$/;
    let salt = 'bK/EmMj8DCkGYk/cCFcNVA==';
    var hash;
    
    before('get a sample hash', function() {
      hash = pwmgr.hashPassword(validPW, salt);
    });

    it('returns null on an invalid password', function() {
      expect(pwmgr.hashPassword(invalidPW, salt)).to.equal(null);
    });

    it('returns a string given a valid password & hash', function() {
      expect(typeof(hash)).to.equal('string');
    });

    it('returns the configured hash string length', function() {
      expect(hash.length).to.equal(hashLen);
    });

    it('returns only hex characters', function() {
      expect(hash.match(hashRegex)).to.not.equal(null);
    });

    it('is repeatable given the same password & salt', function() {
      expect(pwmgr.hashPassword(validPW, salt)).to.equal(hash);
    });
  });


  describe('#checkPasswordByID()', function() {
    it('throws when given a non-number userID argument', function(done) {
      pwmgr.checkPasswordByID(testUsername, validPW)
        .then((retval) => done(retval))
        .catch(() => done());
    });

    it('throws when given a non-string password argument', function(done) {
      pwmgr.checkPasswordByID(testUserID, 12345678)
        .then((retval) => done(retval))
        .catch(() => done());
    });

    it('returns false given a non-existent userID', async function() {
      expect(await pwmgr.checkPasswordByID(bogusUserID, validPW)).to.equal(false);
    });

    it('returns false given an existing userID and invalid password', async function() {
      expect(await pwmgr.checkPasswordByID(testUserID, invalidPW)).to.equal(false);
    });

    it('returns false given an existing userID and valid but wrong password', async function() {
      expect(await pwmgr.checkPasswordByID(testUserID, validPW + 'a')).to.equal(false);
    });

    it('returns true given an existing userID and the correct password', async function() {
      expect(await pwmgr.checkPasswordByID(testUserID, validPW)).to.equal(true);
    });
  });


  describe('#checkPassword()', function() {
    it('returns false given an invalid password', async function() {
      expect(await pwmgr.checkPassword(testUsername, invalidPW)).to.equal(false);
    });

    it('returns false given a non-existent username and valid password', async function() {
      expect(await pwmgr.checkPassword(bogusUsername, validPW)).to.equal(false);
    });

    it('returns false given an existing username and valid but wrong password', async function() {
      expect(await pwmgr.checkPassword(testUsername, validPW + 'a')).to.equal(false);
    });

    it('returns true given an existing username and the correct password', async function() {
      expect(await pwmgr.checkPassword(testUsername, validPW)).to.equal(true);
    });
  });


  describe('#updatePasswordByID()', function() {
    it('throws when given a non-number userID argument', function(done) {
      pwmgr.updatePasswordByID(testUsername, validNewPW)
        .then((retval) => done(retval))
        .catch(() => done());
    });

    it('throws when given a non-string password argument', function(done) {
      pwmgr.updatePasswordByID(testUserID, 12345678)
        .then((retval) => done(retval))
        .catch(() => done());
    });

    it('returns false given a non-existent userID', async function() {
      expect(await pwmgr.updatePasswordByID(bogusUserID, validNewPW)).to.equal(false);
    });

    it('returns false given the user\'s current password (must be new)', async function() {
      expect(await pwmgr.updatePasswordByID(testUserID, validPW)).to.equal(false);
    });

    it('returns true when a password is updated', async function() {
      expect(await pwmgr.updatePasswordByID(testUserID, validNewPW)).to.equal(true);
    });
  });


  describe('#updatePassword()', function() {
    it('returns false given an existing username and invalid password', async function() {
      expect(await pwmgr.updatePassword(testUsername, invalidPW)).to.equal(false);
    });

    it('returns false given a non-existent username and valid password', async function() {
      expect(await pwmgr.updatePassword(bogusUsername, validNew2PW)).to.equal(false);
    });

    it('returns true when a password is updated by username', async function() {
      expect(await pwmgr.updatePassword(testUsername, validNew2PW)).to.equal(true);
    });
  });
});
