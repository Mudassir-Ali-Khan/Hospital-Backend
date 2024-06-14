const CryptoJS = require("crypto-js");

const hash512 =(data)=> {
    return CryptoJS.HmacSHA512(data, process.env.CRYPTO_SECRET_KEY)
}

module.exports = hash512;