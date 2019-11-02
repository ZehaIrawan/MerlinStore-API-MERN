const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Order = require('../../models/Order');
const User = require('../../models/User');
const Product = require('../../models/Product');

// @route    POST api/cart
// @desc     Create a cart entry
// @access   Private
router.post('/', auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let data = await Product.findById(req.body.id);

    const newOrder = new Order({
      title: data.title,
      description: data.description,
      img: data.img,
      user: req.user.id,
      dl: data.dl,
    });

    const order = await newOrder.save();

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Err');
  }
});

// @route    GET api/orders
// @desc     Get all orders
// @access   Public
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
