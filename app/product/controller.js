const path = require("path");
const fs = require("fs-extra");
const config = require("../config.js");
const Product = require("./model.js");
const Category = require("../category/model.js");
const Tag = require("../tag/model.js");
const { options } = require("./routes.js");

/**
 * Handles the storage of a product, including image file processing.
 *
 * This asynchronous function processes an incoming request to store a product.
 * It checks if an image file is included in the request, processes the file by
 * moving it to a target directory, and saves the product information to the database.
 *
 * @param {Object} req - The request object containing product data and optional file.
 * @param {Object} res - The response object used to send back the result.
 * @param {Function} next - The next middleware function in the stack.
 *
 * @returns {Promise<void>} - Returns a JSON response with the saved product or an error message.
 *
 * @throws {Error} - Throws an error if file processing or database operations fail.
 */
const store = async (req, res, next) => {
  try {
    let payload = req.body;
    console.log("Payload received:", payload);

    //relasi dengan category
    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: `i` },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.length > 0) {
      let tags = await Tag.findOne({
        name: { $in: payload.tags },
      });
      if (tags.length) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      } else {
        delete payload.tags;
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt = req.file.originalname.split(".").pop();
      let filename = `${req.file.filename}.${originalExt}`;
      let target_path = path.resolve(
        config.rootPath,
        `public/images/products/${filename}`
      );

      await fs.ensureDir(path.dirname(target_path));

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = new Product({ ...payload, image_url: filename });
          await product.save();
          console.log("Product saved:", product);
          return res.json(product);
        } catch (err) {
          fs.unlinkSync(target_path);
          if (err && err.name === "ValidationError") {
            return res.json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }
          next(err);
        }
      });

      src.on("error", (err) => {
        next(err);
      });
    } else {
      let product = new Product(payload);
      await product.save();
      console.log("Product saved:", product);
      return res.json(product);
    }
  } catch (err) {
    console.error("Error occurred:", err);
    if (err && err.name === "ValidationError") {
      return res.json({
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
    let payload = req.body;
    let { id } = req.params;
    console.log("Payload received:", payload);

    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: `i` },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length > 0) {
      let tags = await Tag.find({
        name: { $in: payload.tags },
      });
      if (tags.length) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      } else {
        delete payload.tags;
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt = req.file.originalname.split(".").pop();
      let filename = `${req.file.filename}.${originalExt}`;
      let target_path = path.resolve(
        config.rootPath,
        `public/images/products/${filename}`
      );

      await fs.ensureDir(path.dirname(target_path));

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = await Product.findById(id);
          let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;

          if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
          }
          product = await Product.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true,
          });
          console.log("Product saved:", product);
          return res.json(product);
        } catch (err) {
          fs.unlinkSync(target_path);
          if (err && err.name === "ValidationError") {
            return res.json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }
          next(err);
        }
      });

      src.on("error", (err) => {
        next(err);
      });
    } else {
      let product = await Product.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });
      console.log("Product saved:", product);
      return res.json(product);
    }
  } catch (err) {
    console.error("Error occurred:", err);
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const index = async (req, res, next) => {
  try {
    let { skip = 0, limit = 10, q = "", category = "", tags = [] } = req.body;
    let criteria = {};
    if (q.length) {
      criteria = { ...criteria, name: { $regex: `${q}`, $options: `i` } };
    }

    if (category.length) {
      let categoryResult = await Category.findOne({
        name: { $regex: `${category}` },
        $options: `i`,
      });

      if (categoryResult) {
        criteria = { ...criteria, category: categoryResult._id };
      }
    }

    if (tags.length) {
      let tagsResult = await Tag.find({ name: { $in: tags } });
      if (tagsResult.length > 0) {
        criteria = {
          ...criteria,
          tags: { $in: tagsResult.map((tag) => tag._id) },
        };
      }
    }
    console.log(criteria);
    let count = await Product.find().countDocuments();
    let product = await Product.find(criteria)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("category")
      .populate("tags");
    return res.json({
      data: product,
      count,
    });
  } catch (err) {
    next(err);
  }
};

const destroy = async (req, res, next) => {
  try {
    let product = await Product.findOneAndDelete(req.params.id);
    let currentImage = `${config.rootPath}/public/images/products/${product_images_url}`;

    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }

    return res.json(product);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  store,
  index,
  update,
  destroy,
};
