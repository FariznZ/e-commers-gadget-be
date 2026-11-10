'use strict';

const express = require('express');
const auth = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrder,
  payOrder,
} = require('../controllers/orderController');

const router = express.Router();

// All order routes require a valid Supabase access token.
router.use(auth);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/:id/pay', payOrder);

module.exports = router;
