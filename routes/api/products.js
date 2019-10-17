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
      // console.log(req.admin);
      await Admin.findById(req.admin.id).select('-password');

      const newProduct = new Product({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        img: req.body.img,
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
// @access   Private
router.get('/', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ date: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/products/:id
// @desc     Get product by ID
// @access   Private
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/books/:id
// @desc     Delete a book
// @access   Private
router.delete('/:id', adminAuth, async (req, res) => {
  console.log(req);
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Check user
    if (book.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not adminAuthorized' });
    }

    await book.remove();

    res.json({ msg: 'Book removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/book/:id
// @desc     Update book data
// @access   Private
router.put(
  '/:id',
  [
    adminAuth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('category', 'Category is required')
        .not()
        .isEmpty(),
      check('adminAuthor', 'adminAuthor is required')
        .not()
        .isEmpty(),
      check('totalChapter', 'TotalChapter is required')
        .not()
        .isEmpty(),
      check('currentChapter', 'currentChapter is required')
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
      category: req.body.category,
      adminAuthor: req.body.adminAuthor,
      totalChapter: req.body.totalChapter,
      currentChapter: req.body.currentChapter,
    };

    try {
      const book = await Book.findOne({ _id: req.params.id });

      const result = Object.assign(book, updatedData);

      console.log(book);
      await Book.findByIdAndUpdate(
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
