var express = require('express');
var router = express.Router();

const { success,allproduct, allorders, addproduct,importdata} = require('../controller/controller')

/* GET home page. */
router.get('/', success)
router.get('/import',importdata)
router.get('/add_product',addproduct)
router.get('/all_product',allproduct)
router.get('/all_orders',allorders)

module.exports = router;
