const Product = require("../product/model.js");
const CartItem = require("../cart-item/model.js");

const store = async (req, res, next) => {
  try {
    const cartItem = req.body[0];
    const _id = cartItem?.product?._id;
    console.log("Product ID:", _id);
    console.log("reqbody", req.body);

    if (!_id) {
      return res.status(400).json({
        error: 1,
        message: "Product ID is required",
      });
    }

    // Cek apakah produk ada di database
    const product = await Product.findById(_id); // Menggunakan _id
    if (!product) {
      return res.status(404).json({
        error: 1,
        message: "Product not found",
      });
    }

    // Cek apakah item sudah ada di keranjang
    const existingCartItem = await CartItem.findOne({
      user: req.user._id, // Pastikan req.user tersedia dari middleware autentikasi
      product: _id, // Menggunakan _id
    });

    if (existingCartItem) {
      // Jika sudah ada, tambahkan qty sebanyak 1
      existingCartItem.qty += 1;
      await existingCartItem.save();
      return res.status(200).json({
        message: "Quantity updated in cart",
        cartItem: existingCartItem,
      });
    } else {
      // Jika belum ada, tambahkan item baru ke keranjang
      const newCartItem = new CartItem({
        product: product._id,
        qty: 1, // Tambahkan 1 qty
        price: product.price,
        image_url: product.image_url,
        name: product.name,
        user: req.user._id, // Pastikan ini tersedia
      });

      await newCartItem.save();
      return res.status(201).json({
        message: "Product added to cart",
        cartItem: newCartItem,
      });
    }
  } catch (err) {
    // Tangani ValidationError atau error lainnya
    if (err && err.name === "ValidationError") {
      return res.status(400).json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 1, message: "Invalid input" });
    }

    for (const item of items) {
      const { product, qty } = item;

      if (!product || !product._id) {
        return res
          .status(400)
          .json({ error: 1, message: "Product ID is required" });
      }

      const existingCartItem = await CartItem.findOne({
        user: req.user._id,
        product: product._id,
      });

      if (existingCartItem) {
        existingCartItem.qty += qty;
        if (existingCartItem.qty <= 0) {
          await existingCartItem.remove();
        } else {
          await existingCartItem.save();
        }
      } else if (qty > 0) {
        const newCartItem = new CartItem({
          product: product._id,
          qty,
          price: product.price,
          image_url: product.image_url,
          user: req.user._id,
        });
        await newCartItem.save();
      }
    }

    const updatedCartItems = await CartItem.find({
      user: req.user._id,
    }).populate("product");
    return res.json(updatedCartItems);
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(400).json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const destroy = async (req, res, next) => {
  try {
    let cart = await CartItem.findOneAndDelete({
      user: req.user._id,
      product: req.params.id,
    });

    if (!cart) {
      return res.status(404).json({ error: 1, message: "Cart item not found" });
    }

    return res.json(cart);
  } catch (error) {
    next(error);
  }
};

const index = async (req, res, next) => {
  try {
    let items = await CartItem.find({ user: req.user._id }).populate("product");

    return res.json(items);
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(400).json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

module.exports = {
  store,
  update,
  index,
  destroy,
};
