import CryptoJS from 'crypto-js';

export const aesEncrypt = (data: string, secret: string) => {
  try {
    return encodeURIComponent(CryptoJS.AES.encrypt(data, secret).toString());
  } catch (error) {
    throw error;
  }
};

export const aesDecrypt = (input: string, secret: string) => {
  try {
    return CryptoJS.AES.decrypt(decodeURIComponent(input), secret).toString(
      CryptoJS.enc.Utf8,
    );
  } catch (error) {
    throw error;
  }
};
