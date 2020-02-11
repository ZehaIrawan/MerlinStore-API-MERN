const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Cart = require('../../models/Cart');
const User = require('../../models/User');

// @route    POST api/cart
// @desc     Create a cart entry
// @access   Private
router.post(
  '/',
  [
    auth,
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
      check('quantity', 'Quantity is required')
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
      await User.findById(req.user.id).select('-password');

      const newCart = new Cart({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        img: req.body.img,
        quantity: req.body.quantity,
        user: req.user.id,
        id: req.body.id,
      });

      const cart = await newCart.save();

      res.json(cart);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Err');
    }
  },
);

// @route    GET api/cart
// @desc     Get all item in cart
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.find({
      user: req.user.id,
    }).sort({ date: -1 });
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/cart/:id
// @desc     Get item in cart by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/cart/:id
// @desc     Delete an item in cart
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    // Check user
    if (cart.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await cart.remove();

    res.json({ msg: 'Cart removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/cart/:id
// @desc     Update item quantity in cart
// @access   Private
router.put(
  '/:id',
  [
    auth,
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
      check('quantity', 'Quantity is required')
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
      quantity: req.body.quantity,
    };

    try {
      const cart = await Cart.findOne({ _id: req.params.id });

      const result = Object.assign(cart, updatedData);

      await Cart.findByIdAndUpdate(
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
