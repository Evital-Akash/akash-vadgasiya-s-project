const express = require("express");
const router = express.Router();
const Order = require("../controller/Orders");
const { Authentication } = require("../middleware/Authentication");

router.get("/getAllorders", Order.getAllorders);
router.post("/createOrder", Authentication, Order.placeOrder);
router.delete("/clearOrder/:id", Authentication, Order.deleteOrders);

router.get("/getorder/:id", Authentication, Order.getOrders);
router.get("/getallorderItems", Authentication, Order.getAllordersItems);

module.exports = router;
