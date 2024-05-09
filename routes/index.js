var express = require('express');
var router = express.Router();

const { success,allproduct, allorders, addproduct,importdata} = require('../controller/controller')

/* GET home page. */
router.get('/', success)
router.get('/import',importdata)
router.get('/addproduct',addproduct)
router.get('/allproduct',allproduct)
router.get('/allorders',allorders)

module.exports = router;
