// Test utils/encryption.js

'use strict';
const assert = require('chai').assert;
const expect = require('chai').expect;
const encutil = baseRequire('utils/encryption');

describe(':utils/encryption', function() {
  const testToken = {
    testStr: 'A secret string'
  , testNum: 42
  , testBool: true
  , testNil: null
  };

  // Encrypted payload should be 3 base64 fields separated by colons
  const encRegex = /^[a-zA-Z0-9\+\/=]+:[a-zA-Z0-9\+\/=]+:[a-zA-Z0-9\+\/=]+$/;


  describe('#encryptData()', function() {
    it('returns null given various invalid parameter types', function() {
      expect(encutil.encryptData()).to.equal(null);
      expect(encutil.encryptData(1234)).to.equal(null);
      expect(encutil.encryptData('')).to.equal(null);
    });

    it('returns properly-formed fields in a string when given a string', function() {
      let encStr = encutil.encryptData(testToken.testStr);
      expect(typeof(encStr)).to.equal('string');
      expect(encStr.match(encRegex)).to.not.equal(null);
    });

    it('returns properly-formed fields in a string when given a Buffer', function() {
      let encStr = encutil.encryptData(Buffer.from(testToken.testStr, 'utf8'));
      expect(typeof(encStr)).to.equal('string');
      expect(encStr.match(encRegex)).to.not.equal(null);
    });
  });


  describe('#validateAndDecryptData()', function() {
    let encStr = encutil.encryptData(testToken.testStr);
    encStr = encStr || '::';
    let encArray = encStr.split(':');

    it('returns null given various invalid parameter types', function() {
      expect(encutil.validateAndDecryptData()).to.equal(null);
      expect(encutil.validateAndDecryptData(null)).to.equal(null);
      expect(encutil.validateAndDecryptData(42)).to.equal(null);
    });

    // Note that adding characters to the *end* of these strings may have no effect, because
    // anything occuring after '=' padding during the base64 decoding seems to simply be skipped
    it('returns null when the IV has been modified', function() {
      let testStr = ['a' + encArray[0], encArray[1], encArray[2]].join(':');
      let result = encutil.validateAndDecryptData(testStr);
      expect(result).to.equal(null);
    });

    it('returns null when the payload has been modified', function() {
      let testStr = [encArray[0], 'a' + encArray[1], encArray[2]].join(':');
      let result = encutil.validateAndDecryptData(testStr);
      expect(result).to.equal(null);
    });

    it('returns null when the hash has been modified', function() {
      let testStr = [encArray[0], encArray[1], 'a' + encArray[2]].join(':');
      let result = encutil.validateAndDecryptData(testStr);
      expect(result).to.equal(null);
    });

    it('returns a reconstituted utf8 string given an unmodified encryption string', function() {
      expect(encutil.validateAndDecryptData(encStr)).to.equal(testToken.testStr);
    });
  });


  describe('#encryptToken()', function() {
    it('returns null given an invalid token parameter', function() {
      expect(encutil.encryptToken()).to.equal(null);
    });

    it('returns properly-formed fields in a string when given a token object', function() {
      let encStr = encutil.encryptToken(testToken);
      expect(typeof(encStr)).to.equal('string');
      expect(encStr.match(encRegex)).to.not.equal(null);
    });
  });


  describe('#validateAndDecryptToken()', function() {
    let encStr = encutil.encryptToken(testToken);
    encStr = encStr || '::';
    let encArray = encStr.split(':');

    it('returns null given various invalid parameter types', function() {
      expect(encutil.validateAndDecryptToken()).to.equal(null);
      expect(encutil.validateAndDecryptToken(null)).to.equal(null);
      expect(encutil.validateAndDecryptToken(42)).to.equal(null);
    });

    it('returns null when the IV has been modified', function() {
      let testStr = ['a' + encArray[0], encArray[1], encArray[2]].join(':');
      let result = encutil.validateAndDecryptToken(testStr);
      expect(result).to.equal(null);
    });

    it('returns null when the payload has been modified', function() {
      let testStr = [encArray[0], 'a' + encArray[1], encArray[2]].join(':');
      let result = encutil.validateAndDecryptToken(testStr);
      expect(result).to.equal(null);
    });

    it('returns null when the hash has been modified', function() {
      let testStr = [encArray[0], encArray[1], 'a' + encArray[2]].join(':');
      let result = encutil.validateAndDecryptToken(testStr);
      expect(result).to.equal(null);
    });

    it('returns a reconstituted token object given an unmodified encryption string', function() {
      expect(encutil.validateAndDecryptToken(encStr)).to.deep.equal(testToken);
    });
  });
});
