const express = require("express");
const router = express.Router();
const CheckOut = require("../controller/checkout");
const { Authentication } = require("../middleware/Authentication");

router.post("/checkout", Authentication, CheckOut.Checkout);
router.get("/getaddress", Authentication, CheckOut.getShippingAddress);

router.delete("/deleteAddressById/:id", CheckOut.deleteAddress);

module.exports = router;
