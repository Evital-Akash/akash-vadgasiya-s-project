const express = require("express");
const cors = require("cors");
const User = require("./routes/User");
const Products = require("./routes/Products");
const Cart = require("./routes/Cart");
const Orders = require("./routes/Order");
const checkOut = require("./routes/checkout");
const Review = require("./routes/Review");
const cookie = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./DB/conn");

const app = express();

// middleware

app.set("trust proxy", true);
app.use(express.json());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookie());
app.use(cors());

// routes
app.use("/assets", express.static("assets/product_img"));
app.use("/api/user", User);
app.use("/api/products", Products);
app.use("/api/cart", Cart);
app.use("/api/orders", Orders);
app.use("/api/checkout", checkOut);
app.use("/api/review", Review);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

// in e-commerce website how many table we have to create for add to cart, remove cart, order of products using sql and node and also give whole code of making api
