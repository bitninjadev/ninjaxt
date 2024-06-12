const Binance = require('./src/binance.js');
const Bitmusa = require('./src/bitmusa.js');
const Gateio = require('./src/gateio.js');

const Ninjaxt = {
    Binance,
    Bitmusa,
    Gateio,
};

module.exports = { default: Ninjaxt };