const express = require("express");
const userAuth = require("../controller/userAuth");
const { AdminAuth, Authentication } = require("../middleware/Authentication");
const router = express.Router();

router.get("/", userAuth.api);
router.get("/getallusers", userAuth.GetAllUsers);
router.delete("/delete/:id", userAuth.deleteUser);

router.post("/checkEmail", userAuth.checkEmailexist);
router.post("/register", userAuth.register);

router.post("/verifyotp", userAuth.verifyOtp);
router.post("/resendOtp", userAuth.resendOTP);

router.post("/forgotPassword", userAuth.forgotPassword);
router.post("/resetPassword", userAuth.resetPassword);

router.post("/login", userAuth.login);
router.post("/logout", userAuth.logout);

router.put("/updateProfile/:id", userAuth.UpdateProfile);

module.exports = router;
