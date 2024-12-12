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
    const items = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 1, message: "Invalid input" });
    }

    const productIds = items.map((item) => item.product._id);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res
        .status(400)
        .json({ error: 1, message: "Some products not found" });
    }

    let cartItems = items.map((item) => {
      let relatedProduct = products.find(
        (product) => product._id.toString() === item.product._id.toString()
      );
      return {
        product: relatedProduct._id,
        price: relatedProduct.price,
        image_url: relatedProduct.image_url,
        name: relatedProduct.name,
        user: req.user._id,
        qty: item.qty,
      };
    });

    await CartItem.deleteMany({ user: req.user._id });
    await CartItem.bulkWrite(
      cartItems.map((item) => {
        return {
          updateOne: {
            filter: {
              user: req.user._id,
              product: item.product,
            },
            update: item,
            upsert: true,
          },
        };
      })
    );

    return res.json(cartItems);
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
    let cart = await CartItem.findByIdAndDelete(req.params.id);

    if (!cart) {
      return res.status(404).json({ error: 1, message: "Cart not found" });
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
