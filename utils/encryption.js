// Provide data/token encryption, decryption, and validation

const crypto = require('crypto');
const keys = baseRequire('private-keys');

// id-aes128-GCM or ChaCha20-Poly1305 would be preferable for AEAD, but Node Crypto doesn't seem to actually authenticate messages...
// So, for the time being, just encrypt and hash the old-fashioned way.
const cipherAlgo = 'AES-128-CTR';
const hmacAlgo = 'sha256';
const keyBytes = 16; // 128 bits
const ivBytes = 16;


// Load private encryption and signing keys
const cipherKey = crypto.createSecretKey(Buffer.from(keys.cipherKeyBytes));
const hmacKey = Buffer.from(keys.hmacKeyBytes);


// Expects either a utf8 string or a buffer
// Returns a base64 string with the iv, encrypted data, and hash integrated, or null on failure
function encryptData(data) {
  if ((typeof(data) === 'string' || data instanceof Buffer) && data.length) {
    let iv = crypto.randomBytes(ivBytes);
    let finalData = iv.toString('base64') + ':';

    // Encrypt the data
    let cipher = crypto.createCipheriv(cipherAlgo, cipherKey, iv);
    let encData = cipher.update(data, 'utf8', 'base64');
    encData += cipher.final('base64');
    finalData += encData + ':';

    // Hash the original data (so validation will fail if the iv is tampered with)
    let hmac = crypto.createHmac(hmacAlgo, hmacKey);
    hmac.update(data, 'utf8');
    finalData += hmac.digest('base64');

    return finalData;
  }

  return null;
};


// Expects an integrated base64 string
// Returns the decrypted, validated data as a utf8 string, or null on failure
function validateAndDecryptData(encStr) {
  try {
    if (typeof(encStr) === 'string') {
      let msgParts = encStr.split(':');
      if (msgParts.length === 3) {
        let iv = Buffer.from(msgParts[0], 'base64');
        let encData = msgParts[1];
        let hash = msgParts[2];

        // Decrypt the data
        let cipher = crypto.createDecipheriv(cipherAlgo, cipherKey, iv);
        let data = cipher.update(encData, 'base64', 'utf8');
        data += cipher.final('utf8');

        // Validate the data
        let hmac = crypto.createHmac(hmacAlgo, hmacKey);
        hmac.update(data, 'utf8');
        let calcHash = hmac.digest('base64');
        if (hash === calcHash)
          return data;
      }
    }
  }
  catch (err) {
    return null;
  }

  return null;
};


// Encrypt a JavaScript token
function encryptToken(token) {
  return encryptData(JSON.stringify(token));
};


// Decrypt and validate a JavaScript token
function validateAndDecryptToken(tokenStr) {
  let data = validateAndDecryptData(tokenStr);

  if (data === null)
    return null;

  return JSON.parse(data);
};


module.exports = {
  encryptData
, validateAndDecryptData
, encryptToken
, validateAndDecryptToken
};
