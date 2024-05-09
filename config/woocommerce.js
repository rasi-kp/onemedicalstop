const WooCommerceAPI = require('woocommerce-api');
require('dotenv').config();

// Create an instance of the WooCommerce API
const WooCommerce = new WooCommerceAPI({
    url: 'https://onemedical.store',
    consumerKey:process.env.consumerKey,
    consumerSecret:process.env.consumerSecret,
    wpAPI: true,
    version: 'wc/v3'
});

module.exports = WooCommerce;