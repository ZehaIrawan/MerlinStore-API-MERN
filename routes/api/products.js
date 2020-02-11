const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const adminAuth = require('../../middleware/adminAuth');
const Product = require('../../models/Product');
const Admin = require('../../models/Admin');

// @route    POST api/products
// @desc     Create a products entry
// @access   Private
router.post(
  '/',
  [
    adminAuth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('description', 'Description is required')
        .not()
        .isEmpty(),
      check('price', 'Price is required')
        .not()
        .isEmpty(),
      check('img', 'Image is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await Admin.findById(req.admin.id).select('-password');

      const newProduct = new Product({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        img: req.body.img,
        admin: req.admin.id,
        dl:req.body.dl
      });

      const product = await newProduct.save();

      res.json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('You are not an admin');
    }
  },
);

// @route    GET api/products
// @desc     Get all products
// @access   Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .select('-dl')
      .select('-admin')
      .sort({ date: -1 });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/products/:id
// @desc     Get product by ID
// @access   Private
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('-dl')
      .select('-admin');

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/products/:id
// @desc     Delete a product
// @access   Private
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'product not found' });
    }

    // Check user
    if (product.admin.toString() !== req.admin.id) {
      return res.status(401).json({ msg: 'Admin is not Authorized' });
    }

    await product.remove();

    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/product/:id
// @desc     Update product data
// @access   Private
router.put(
  '/:id',
  [
    adminAuth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('description', 'Description is required')
        .not()
        .isEmpty(),
      check('price', 'Price is required')
        .not()
        .isEmpty(),
      check('img', 'Image is required')
        .not()
        .isEmpty(),
      check('dl', 'Download link is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updatedData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      img: req.body.img,
      dl: req.body.dl,
    };

    try {
      const product = await Product.findOne({ _id: req.params.id });

      const result = Object.assign(product, updatedData);

      await Product.findByIdAndUpdate(
        req.params.id,
        { $set: result },
        { new: true },
      );

      res.json(result);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

module.exports = router;
