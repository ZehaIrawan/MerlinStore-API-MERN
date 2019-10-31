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
router.post(
  '/',
  [
    auth,
    [
      check('id', 'ID is required')
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
      let a = await Product.findById(req.body.id);

      let data = await a

      const newOrder = new Order({
        title: req.data.title,
        description: req.data.description,
        img: req.data.img,
        user: req.user.id,
        dl: req.data.dl,
      });

      const order = await newOrder.save();



      res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Err');
    }
  },
);

module.exports = router;
