const express = require("express");
const router = express.Router();
const Cart = require("../controller/Cart");
const { Authentication } = require("../middleware/Authentication");

router.get("/allcart", Authentication, Cart.allCartProduct);
router.post("/addtoCart", Authentication, Cart.addToCart);
router.delete("/removetocart/:id", Authentication, Cart.removeToCart);

router.delete("/removecartbyproduct", Authentication, Cart.removeByProduct);

module.exports = router;
