import CryptoJS from 'crypto-js';

const secret = 'my_secret_key';
const message = 'Hello, crypto-js!';

// Encrypt
const encrypted = CryptoJS.AES.encrypt(message, secret).toString();

// Decrypt
const decrypted = CryptoJS.AES.decrypt(encrypted, secret).toString(
  CryptoJS.enc.Utf8,
);

console.log({ encrypted, decrypted });
