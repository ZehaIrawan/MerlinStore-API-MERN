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
      });

      const cart = await newCart.save();

      res.json(cart);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Err');
    }
  },
);
module.exports = router;
