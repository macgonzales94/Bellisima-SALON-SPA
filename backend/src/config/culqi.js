// config/culqi.js
const Culqi = require('culqi-node');

const culqi = new Culqi({
    privateKey: process.env.CULQI_PRIVATE_KEY,
    publicKey: process.env.CULQI_PUBLIC_KEY,
    apiVersion: "v2"
});

module.exports = culqi;