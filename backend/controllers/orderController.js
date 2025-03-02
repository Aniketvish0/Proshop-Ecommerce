import e from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { calcPrices } from "../utils/calcPrices.js";
import { verifyPayPalPayment, checkIfNewTransaction } from "../utils/paypal.js";

/**
 * @desc Create New Order
 * @route Post /api/orders
 * @access Private
 */
const addOrderItems = asyncHandler(async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    // if (!orderItems?.length) {
    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    } else {
      // NOTE: here we must assume that the prices from our client are incorrect.
      // We must only trust the price of the item as it exists in
      // our DB. This prevents a user paying whatever they want by hacking our client
      // side code - https://gist.github.com/bushblade/725780e6043eaf59415fbaf6ca7376ff

      // Get items from database
      const itemsFromDB = await Product.find({
        _id: { $in: orderItems.map((x) => x._id) },
      });

      // map over the order items and use the price from our items from database
      if (itemsFromDB.length !== orderItems.length) {
        res.status(400);
        throw new Error("Some products not found");
      }

      // Map order items with DB prices
      const dbOrderItems = orderItems.map((itemFromClient) => {
        const matchingItemFromDB = itemsFromDB.find(
          (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
        );
        return {
          ...itemFromClient,
          product: itemFromClient._id,
          price: matchingItemFromDB.price,
          _id: undefined,
        };
      });

      // Calculate prices
      const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
        calcPrices(dbOrderItems);

      const order = new Order({
        orderItems: dbOrderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(error.status || 500).json({
      message: error.message || "Failed to create order",
    });
  }
});

/**
 * @desc Get Logged in Users Orders
 * @route Get /api/orders/myorders
 * @access Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error in getMyOrders:", error);
    res.status(500).json({
      error,
    });
    throw new Error(error);
  }
});

/**
 * @desc Get Order by ID
 * @route Get /api/orders/:id
 * @access Private
 */
const getOrdersById = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (orders) {
      res.status(200).json(orders);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    console.error("Error in getOrdersById:", error);
    res.status(500).json({
      error,
    });
    throw new Error(error);
  }
});

/**
 * @desc Update Order to Paid
 * @route Put /api/orders/:id/pay
 * @access Private
 */
const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    // NOTE: here we need to verify the payment was made to PayPal before marking
    // the order as paid
    const { verified, value } = await verifyPayPalPayment(req.body.id);
    if (!verified) {
      res.status(400);
      throw new Error("Payment not verified");
    }

    // check if this transaction has been used before
    const isNewTransaction = await checkIfNewTransaction(Order, req.body.id);
    if (!isNewTransaction) {
      res.status(400);
      throw new Error("Transaction has been used before");
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order) {
      // check the correct amount was paid
      const paidCorrectAmount = order.totalPrice.toString() === value;
      if (!paidCorrectAmount) {
        res.status(400);
        throw new Error("Incorrect amount paid");
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    console.error("Payment update error:", error);
    res.status(error.status || 500).json({
      message: error.message || "Failed to update payment status",
    });
  }
});

/**
 * @desc Update Order to Delivered
 * @route Put /api/orders/:id/deliver
 * @access Private/Admin
 */
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.status(200).json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    console.log(error);
    res.send(500).json(error);
    throw new Error(error);
  }
});

/**
 * @desc Update Order to Delivered
 * @route Get /api/orders
 * @access Private/Admin
 */
const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "id name");
    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
    throw new Error(error);
  }
});

export {
  addOrderItems,
  getMyOrders,
  getOrdersById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
};
