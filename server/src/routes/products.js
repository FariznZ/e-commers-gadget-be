'use strict';

const express = require('express');
const {
  listProducts,
  getProduct,
  getCategories,
} = require('../controllers/productController');

const router = express.Router();

router.get('/products', listProducts);
router.get('/products/:id', getProduct);
router.get('/categories', getCategories);

module.exports = router;
