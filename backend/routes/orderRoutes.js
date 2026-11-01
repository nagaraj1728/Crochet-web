
const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const verifyAdmin = require("../middleware/authMiddleware");

// CUSTOMER: PLACE AN ORDER
router.post("/", async (req, res) => {
  try {
    const { customer, items, totalAmount, paymentMethod } = req.body;

    if (
      !customer?.name ||
      !customer?.phone ||
      !customer?.address ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !["Cash on Delivery", "eSewa", "Khalti"].includes(paymentMethod)
    ) {
      return res.status(400).json({
        message: "Please provide valid order details."
      });
    }

    const order = await Order.create({
      customer,
      items,
      totalAmount,
      paymentMethod
    });

    res.status(201).json({
      message: "Order placed successfully!",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// ADMIN ONLY: VIEW ALL ORDERS
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// ADMIN ONLY: UPDATE ORDER STATUS
router.patch("/:id/status", verifyAdmin, async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled"
    ];

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: "Invalid order status."
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found."
      });
    }

    res.json({
      message: "Order status updated.",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
