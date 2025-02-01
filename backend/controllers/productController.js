import fs from "fs";
import path from "path";
import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";

/**
 * @desc Fetch All Products
 * @route GET /api/products
 * @access Public
 */
const getProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = process.env.PAGINATION_LIMIT;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};
    const count = await Product.countDocuments({ ...keyword });

    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
    throw new Error(`Error fetching products: ${error.message}`);
  }
});

/**
 * @desc Fetch a Products by ID
 * @route GET /api/products/:id
 * @access Public
 */
const getProductsById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      return res.json(product);
    } else {
      res.status(404);
      throw new Error("Resource Not Found");
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ message: "Error fetching product by ID", error });
    throw new Error(`Error fetching products: ${error.message}`);
  }
});

/**
 * @desc Create a Product
 * @route POST /api/products
 * @access Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  try {
    const product = new Product({
      name: "Sample Name",
      price: 0,
      user: req.user._id,
      image: "/images/sample.jpg",
      brand: "Sample Brand",
      category: "Sample Category",
      countInStock: 0,
      numReviews: 0,
      description: "Sample Description",
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error });
    throw new Error(`Error fetching products: ${error.message}`);
  }
});

/**
 * @desc Update a Product
 * @route PUT /api/products/:id
 * @access Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.price = req.body.price || product.price;
      product.description = req.body.description || product.description;
      product.image = req.body.image || product.image;
      product.brand = req.body.brand || product.brand;
      product.category = req.body.category || product.category;
      product.countInStock = req.body.countInStock || product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    res.status(500).status(error);
    console.log(error);
    throw new Error(error);
  }
});

/**
 * @desc Delete a Product and its associated image
 * @route DELETE /api/products/:id
 * @access Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    // Delete the image if it exists
    if (product.image) {
      const imagePath = product.image.startsWith("/")
        ? product.image.slice(1)
        : product.image;

      const fullPath = path.join(process.cwd(), imagePath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.status(200).json({
        message: "Product and associated image deleted successfully",
      });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    res.status(500).json({ error });
    console.log(error);
    throw new Error(error?.message && "Error deleting product");
  }
});

/**
 * @desc Create Reviews for a Product
 * @route POST /api/products/:id/reviews
 * @access Private
 */
const createProductReviews = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (review) => review.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res
          .status(400)
          .json({ message: "You have already reviewed this product" });
        throw new Error("You have already reviewed this product");
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review Added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    res.status(500).json({ error });
    console.log(error);
    throw new Error(error?.message && "Error deleting product");
  }
});

/**
 * @desc Get Top Rated Products
 * @route GET /api/products/top
 * @access Public
 */
const getTopProducts = asyncHandler(async (req, res) => {
  try {
    const product = await Product.find({}).sort({ rating: -1 }).limit(3);

    if (product) {
      return res.status(200).json(product);
    } else {
      res.status(404);
      throw new Error("Resource Not Found");
    }
  } catch (error) {
    console.error("Error fetching top product:", error);
    res.status(500).json({ message: "Error fetching top product", error });
    throw new Error(`Error fetching products: ${error.message}`);
  }
});

export {
  getProducts,
  getProductsById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReviews,
  getTopProducts,
};
