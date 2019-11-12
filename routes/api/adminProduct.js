const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const adminAuth = require('../../middleware/adminAuth');
const Product = require('../../models/Product');
const Admin = require('../../models/Admin');

// @route    GET api/products
// @desc     Get all products
// @access   Public
router.get('/', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ date: -1 });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
