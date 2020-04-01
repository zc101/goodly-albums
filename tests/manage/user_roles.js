// Test manage/user_roles.js

'use strict';
const assert = require('chai').assert;
const expect = require('chai').expect;
const db = baseRequire('manage/db');

describe(':manage/user_roles', function() {
  var ur;
  before('require successfully', function() {
    ur = baseRequire('manage/user_roles');
  });

  before('added sample data', async function() {
    // Add a user
    let results = await db('users').insert({
      user_id: 41
    , user_name: 'userrole_test_user'
    , password_hash: '7961b7a15182e3d079b7dc0b315db1d04b000eb9de64240616faada322509542' // 'p&ssword'
    , password_salt: '76aee4a3780ad515e288c7575f4e2efe'
    });
    expect(results).to.have.lengthOf(1);
    expect(results[0]).to.equal(41);

    // Add a role
    results = await db('roles').insert({
      role_id: 42
    , role_name: 'userrole_test_role'
    });
    expect(results).to.have.lengthOf(1);
    expect(results[0]).to.equal(42);
  });


  describe('#addUserRoleByID()', function() {
    it('returns false given a non-existent userID', async function() {
      expect(await ur.addUserRoleByID(404, 42)).to.equal(false);
    });

    it('returns false given a non-existent roleID', async function() {
      expect(await ur.addUserRoleByID(41, 404)).to.equal(false);
    });

    it('returns true when a new entry is added', async function() {
      expect(await ur.addUserRoleByID(41, 42)).to.equal(true);
    });

    it('returns false when an entry already exists', async function() {
      expect(await ur.addUserRoleByID(41, 42)).to.equal(false);
    });
  });


  describe('#getUserRoleIDs()', function() {
    it('returns an empty list given a non-existent userID', async function() {
      expect(await ur.getUserRoleIDs(404)).to.deep.equal([ ]);
    });

    it('returns an empty list given an invalid username', async function() {
      expect(await ur.getUserRoleIDs('__404&')).to.deep.equal([ ]);
    });

    it('returns an empty list given a valid, non-existent username', async function() {
      expect(await ur.getUserRoleIDs('bogus_user')).to.deep.equal([ ]);
    });

    it('returns a list given a correct userID', async function() {
      let results = await ur.getUserRoleIDs(41);
      expect(results).to.deep.equal([ 42 ]);
    });

    it('returns a list given a correct username', async function() {
      let results = await ur.getUserRoleIDs('userrole_test_user');
      expect(results).to.deep.equal([ 42 ]);
    });
  });


  describe('#deleteUserRoleByID()', function() {
    it('returns false given a non-existent userID', async function() {
      expect(await ur.deleteUserRoleByID(404, 42)).to.equal(false);
    });

    it('returns false given a non-existent roleID', async function() {
      expect(await ur.deleteUserRoleByID(41, 404)).to.equal(false);
    });

    it('returns true when an entry is deleted', async function() {
      expect(await ur.deleteUserRoleByID(41, 42)).to.equal(true);
    });
  });


  describe('#addUserRole()', function() {
    it('returns false given an invalid username', async function() {
      expect(await ur.addUserRole('__404&', 'userrole_test_role')).to.equal(false);
    });

    it('returns false given an invalid role name', async function() {
      expect(await ur.addUserRole('userrole_test_user', '__404&')).to.equal(false);
    });

    it('returns false given a valid, non-existent username', async function() {
      expect(await ur.addUserRole('bogus_user', 'userrole_test_role')).to.equal(false);
    });

    it('returns false given a valid, non-existent role name', async function() {
      expect(await ur.addUserRole('userrole_test_user', 'bogus_role')).to.equal(false);
    });

    it('returns true when a new entry is added', async function() {
      expect(await ur.addUserRole('userrole_test_user', 'userrole_test_role')).to.equal(true);
    });

    it('returns false when an entry already exists', async function() {
      expect(await ur.addUserRole('userrole_test_user', 'userrole_test_role')).to.equal(false);
    });
  });


  describe('#deleteUserRole()', function() {
    it('returns false given an invalid username', async function() {
      expect(await ur.deleteUserRole('__404&', 'userrole_test_role')).to.equal(false);
    });

    it('returns false given an invalid role name', async function() {
      expect(await ur.deleteUserRole('userrole_test_user', '__404&')).to.equal(false);
    });

    it('returns false given a valid, non-existent username', async function() {
      expect(await ur.deleteUserRole('bogus_user', 'userrole_test_role')).to.equal(false);
    });

    it('returns false given a valid, non-existent role name', async function() {
      expect(await ur.deleteUserRole('userrole_test_user', 'bogus_role')).to.equal(false);
    });

    it('returns true when an entry is deleted', async function() {
      expect(await ur.deleteUserRole('userrole_test_user', 'userrole_test_role')).to.equal(true);
    });
  });
});
