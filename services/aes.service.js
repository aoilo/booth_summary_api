const crypto = require('crypto');
const path = require('path')
const ENV_PATH = path.join(__dirname, '../.env');
require('dotenv').config({path: ENV_PATH});

const algorithm = 'aes-256-cbc';
const password = process.env.AES_PASSWORD;
const salt = process.env.AES_SALT;
const key = crypto.scryptSync(password, salt, 32);
const iv = crypto.randomBytes(16);

function encrypt(data) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let cipheredData = cipher.update(data, 'utf8', 'hex');
    cipheredData += cipher.final('hex');
    return cipheredData;
}

function decrypt(data) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decipheredData = decipher.update(data, 'hex', 'utf8');
    decipheredData += decipher.final('utf8');
    return decipheredData;
}

module.exports = { encrypt, decrypt };