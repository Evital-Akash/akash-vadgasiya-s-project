const express = require("express");
const router = express.Router();
const Reviews = require("../controller/reviews");
const multer = require("multer");
const path = require("path");
const { Authentication } = require("../middleware/Authentication");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/reviews");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/addReview",
  Authentication,
  upload.single("r_img"),
  Reviews.addReviews
);
router.get("/getallreviews", Reviews.getAllReviews);
router.delete("/deletereviews/:id", Reviews.deleteReviews);

module.exports = router;
