// Test manage/roles.js

'use strict';
const assert = require('chai').assert;
const expect = require('chai').expect;
const db = baseRequire('manage/db');

describe(':manage/roles', function() {
  var rolemgr;
  before('require successfully', function() {
    rolemgr = baseRequire('manage/roles');
  });

  describe('#isValidRoleName()', function() {
    it('returns false given a non-string parameter', function() {
      expect(rolemgr.isValidRoleName(12345)).to.equal(false);
    });

    it('returns false given a too-short role name', function() {
      expect(rolemgr.isValidRoleName('ab')).to.equal(false);
    });

    it('returns false given a role name with invalid character(s)', function() {
      expect(rolemgr.isValidRoleName('__404&')).to.equal(false);
    });

    it('returns true for a valid role name', function() {
      expect(rolemgr.isValidRoleName('rolename')).to.equal(true);
    });
  });


  describe('#addRole()', function() {
    it('returns null given an invalid role name', async function() {
      expect(await rolemgr.addRole('__404&')).to.equal(null);
    });

    it('returns an auto-increment ID when a new role is added - given name only', async function() {
      expect(await rolemgr.addRole('roles_test_role')).to.equal(1000);
      expect(await rolemgr.addRole('roles_test_role2')).to.equal(1001);
    });

    it('returns an ID when a new role is added - given name & ID', async function() {
      expect(await rolemgr.addRole('roles_test_2_role', 31)).to.equal(31);
    });

    it('returns null when a given role name already exists', async function() {
      expect(await rolemgr.addRole('roles_test_2_role')).to.equal(null);
    });

    it('returns null when a given roleID already exists', async function() {
      expect(await rolemgr.addRole('roles_test_3rd_role', 31)).to.equal(null);
    });
  });


  describe('#getRoleID()', function() {
    it('returns null given an invalid role name', async function() {
      expect(await rolemgr.getRoleID(12345)).to.equal(null);
      expect(await rolemgr.getRoleID('__404&')).to.equal(null);
    });

    it('returns null given a valid, non-existent role name', async function() {
      expect(await rolemgr.getRoleID('bogus_role')).to.equal(null);
    });

    it('returns an ID given an existing role name', async function() {
      expect(await rolemgr.getRoleID('roles_test_2_role')).to.equal(31);
    });
  });


  describe('#getRoleName()', function() {
    it('returns null given a non-number argument', async function() {
      expect(await rolemgr.getRoleName('roles_test_role')).to.equal(null);
    });

    it('returns null given a non-existent roleID', async function() {
      expect(await rolemgr.getRoleName(37)).to.equal(null);
    });

    it('returns a role name given an existing roleID', async function() {
      expect(await rolemgr.getRoleName(31)).to.equal('roles_test_2_role');
    });
  });


  describe('#deleteRoleByID()', function() {
    it('throws when given a non-number argument', function(done) {
      rolemgr.deleteRoleByID('roles_test_role')
        .then((retval) => done(retval))
        .catch(() => done());
    });

    it('returns false given a non-existent roleID', async function() {
      expect(await rolemgr.deleteRoleByID(37)).to.equal(false);
    });

    it('returns true when a role is deleted', async function() {
      expect(await rolemgr.deleteRoleByID(31)).to.equal(true);
    });
  });


  describe('#deleteRole()', function() {
    it('returns false given an invalid role name', async function() {
      expect(await rolemgr.deleteRole('__404&')).to.equal(false);
    });

    it('returns false given a valid, non-existent role name', async function() {
      expect(await rolemgr.deleteRole('bogus_role')).to.equal(false);
    });

    it('returns true when an existing entry is deleted by name', async function() {
      expect(await rolemgr.deleteRole('roles_test_role')).to.equal(true);
    });

    it('returns true when an existing entry is deleted by ID', async function() {
      expect(await rolemgr.deleteRole(1001)).to.equal(true);
    });
  });
});
