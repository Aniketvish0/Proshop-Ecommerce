import express from "express";
const router = express.Router();
import {
  getProducts,
  getProductsById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReviews,
  getTopProducts,
} from "../controllers/productController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import checkObjectId from "../middleware/CheckObjectId.js";

router.route("/").get(getProducts).post(protect, isAdmin, createProduct);
router.route("/:id/reviews").post(protect, checkObjectId, createProductReviews);
router.route("/top").get(getTopProducts);

router
  .route("/:id")
  .get(checkObjectId, getProductsById)
  .put(protect, isAdmin, checkObjectId, updateProduct)
  .delete(protect, isAdmin, checkObjectId, deleteProduct);

export default router;
