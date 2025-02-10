const express = require("express");
const productAuth = require("../controller/productAuth");
const { AdminAuth, Authentication } = require("../middleware/Authentication");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "assets/product_img");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "_" + file.originalname);
//   },
// });

const storage = multer.memoryStorage({});

const upload = multer({ storage: storage });
router.get("/getAllProducts", productAuth.getAllProducts);
router.post(
  "/addProducts",
  upload.array("p_img", 5),
  AdminAuth,
  productAuth.addProducts
);

router.delete("/deleteProducts/:id", productAuth.deleteProducts);
router.put("/updateProductDetails/:id", productAuth.UpdateProducts);

router.get("/searchProducts", productAuth.SearchProducts);

router.get("/getallCategory", productAuth.getAllCategory);
router.post("/createCategories", productAuth.createNewCategory);

module.exports = router;
