const conn = require("../DB/conn");
const Email = require("../helpers/Email");
const Quaries = require("../Quaries");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const responseFormate = require("../helpers/responseFormate");
const {
  registerValidation,
  checkEmailValidate,
  forgotpasswordlValidate,
  loginValidate,
  updateProfileValidate,
  resetPasswordValidate,
} = require("../helpers/validations");

const api = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  return res.json(`your ip address ${ip}`);
};

const generateOtp = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

// --------------------- check email -----------------------------------

const checkEmailexist = async (req, res, next) => {
  try {
    const { u_email } = req.body;

    await checkEmailValidate.validateAsync(req.body);

    const checkEmail = await conn.query(Quaries.check_email, [u_email]);
    if (checkEmail.rows.length) {
      return res.json(responseFormate(0, "Email already exists...Now login"));
    }

    return res
      .status(201)
      .json(responseFormate(1, "Email is not exist...!Now register"));
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json(responseFormate(0, error.message));
    }
    next(error);
  }
};

// -------------------------- get all users ---------------------------

const GetAllUsers = (req, res) => {
  conn.query(Quaries.get_all_users, (err, info) => {
    if (err) return err;
    return res.status(200).json(info.rows);
  });
};

// ---------------------- delete User by id --------------------------------

const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  console.log("del id - ", id);

  const delUser = await conn.query(Quaries.delete_user, [id], (err, info) => {
    if (!info) {
      res.status(404).json(responseFormate(0, "User not found...."));
    } else {
      return res.status(201).json(responseFormate(1, "delete success..."));
    }
  });
};

//   ------------------------- user Register --------------------------------

const register = async (req, res, next) => {
  try {
    const { u_name, u_email, u_password, u_mobile } = req.body;

    await registerValidation.validateAsync(req.body);
    const checkEmail = await conn.query(Quaries.check_email, [u_email]);
    if (checkEmail.rows.length) {
      return res.json(responseFormate(0, "Email already exist.."));
    }

    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(u_password, salt);

    const u_otp = generateOtp(100000, 999999);
    //   console.log(otp);

    const ip = req.ip;
    console.log("ip is- ", ip);

    await conn.query(Quaries.register_user, [
      u_name,
      u_email,
      hasedPassword,
      u_mobile,
      ip,
    ]);

    conn.query(Quaries.update_otp, [u_otp, u_email]);
    await Email({
      email: req.body.u_email,
      subject: "OTP for Registration",
      message: `<p>Welcome !! Your OTP for verification is -</p>
               <h1>${u_otp}</h1> `,
    });
    return res.json(responseFormate(1, "Register success & otp send success"));
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json(responseFormate(0, error.message));
    }
    next(error);
  }

  // }
};

// ------------------------- verify otp for register --------------------

const verifyOtp = async (req, res) => {
  try {
    const { u_email, u_otp } = req.body;

    if (!u_otp) {
      return res
        .status(413)
        .json(responseFormate(0, "All field are require.."));
    }

    conn.query(Quaries.verify_otp, [u_email], (err, info) => {
      if (err) {
        return res.status(401).json(responseFormate(0, "error in verify otp"));
      } else {
        const storedOtp = info.rows[0].u_otp;

        const user = info.rows[0];
        // console.log("v-user", user);

        const currentTime = new Date();
        const otpCreateAt = new Date(user.u_updated_at);
        // console.log(otpCreateAt);
        const timediff = currentTime - otpCreateAt;

        if (timediff > 120000) {
          conn.query(Quaries.clear_otp, [u_email]);
          return res.status(400).json(responseFormate(0, "OTP has expired."));
        }

        if (storedOtp !== u_otp)
          return res
            .status(422)
            .json(responseFormate(0, "otp is not verify..."));

        conn.query(Quaries.clear_otp, [u_email]);
        conn.query(Quaries.update_otp_status, [u_email]);

        return res.status(200).json(responseFormate(1, "OTP verify..."));
      }
    });
  } catch (err) {
    res.status(400).json({ message: "error" });
  }
};

// /-------------------------- resend OTP --------------------------------

const resendOTP = async (req, res) => {
  try {
    const { u_email } = req.body;

    if (!u_email) {
      return res
        .status(401)
        .json(responseFormate(0, "All fields are required.."));
    }

    const u_otp = generateOtp(100000, 999999);

    conn.query(Quaries.update_otp, [u_otp, u_email], async (err, info) => {
      if (err) {
        console.log(err);
        return res.json(responseFormate(0, "error n verify otp"));
      } else {
        await Email({
          email: req.body.u_email,
          subject: "Resend OTP for Registration",
          message: `<p>Welcome !! Your OTP for verification is -</p>
               <h1>${u_otp}</h1> `,
        });
      }
    });
    return res.json(responseFormate(1, "OTP resend success"));
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json(responseFormate(0, error.message));
    }
    next(error);
  }
};

// --------------------------- login -----------------------------------

const login = async (req, res) => {
  try {
    let token;
    const { u_email, u_password } = req.body;

    await loginValidate.validateAsync(req.body);

    const checkEmail = await conn.query(Quaries.check_email, [u_email]);
    if (!checkEmail.rows.length) {
      return res.json(responseFormate(0, "Email not exist..."));
    }

    const result = conn.query(
      Quaries.login_user,
      [u_email],
      async (err, info) => {
        if (err) return res.status(400).json(responseFormate(0, "error.."));

        const CheckPass = await bcrypt.compare(
          u_password,
          info.rows[0].u_password
        );

        if (!CheckPass) {
          return res
            .status(413)
            .json(responseFormate(0, "password incorrect.."));
        } else {
          token = jwt.sign(
            {
              id: info.rows[0].id,
              u_email: info.rows[0].u_email,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "5h",
            }
          );

          await res
            .cookie("jwtoken", token, { httpOnly: true })
            .status(201)
            .json(responseFormate(1, "login success...", token));
        }
      }
    );
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json(responseFormate(0, error.message));
    }
    next(error);
  }
};

// -------------------- logout -------------------------------

const logout = async (req, res) => {
  await res
    .clearCookie("jwtoken")
    .status(200)
    .json(responseFormate(1, "Logout Success..."));
};

// --------------------- forgot password -------------------

const forgotPassword = async (req, res, next) => {
  try {
    const { u_email } = req.body;

    await forgotpasswordlValidate.validateAsync(req.body);

    const checkEmail = await conn.query(Quaries.check_email, [u_email]);
    if (!checkEmail.rows.length) {
      return res.status(400).json(responseFormate(0, "Email not exist.."));
    }

    conn.query(Quaries.forgot_password, [u_email], async (err, info) => {
      if (err)
        return res
          .status(401)
          .json(responseFormate(0, "error in forgotpassword.."));
      const u_otp = generateOtp(100000, 999999);

      conn.query(Quaries.update_otp, [u_otp, u_email], async (err, info) => {
        if (err)
          return res.status(413).json(responseFormate(0, "not send otp"));
        await Email({
          email: req.body.u_email,
          subject: "OTP for Reset password...",
          message: `<p>WYour OTP for Reset password is -</p>
               <h1>${u_otp}</h1> `,
        });
        res.status(201).json(responseFormate(1, "otp send success.."));
      });
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json(responseFormate(0, error.message));
    }
    next(error);
  }
};

// -------------------------- reset password ------------------------------

const resetPassword = async (req, res, next) => {
  try {
    const { u_email, u_password } = req.body;
    await resetPasswordValidate.validateAsync(req.body);

    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(u_password, salt);

    conn.query(
      Quaries.reset_password,
      [hasedPassword, u_email],
      (err, info) => {
        if (err) {
          return res.status(400).json(responseFormate(0, "error"));
        } else {
          conn.query(Quaries.clear_otp, [u_email]);
          return res
            .status(200)
            .json(
              responseFormate(
                1,
                "password changed successfully....with otp null"
              )
            );
        }
      }
    );
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json(responseFormate(0, error.message));
    }
    next(error);
  }
};

//---------------------- update profile-------------------------------------------------

const UpdateProfile = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { u_email, u_name, u_mobile } = req.body;

    await updateProfileValidate.validateAsync(req.body);

    if (u_email) {
      return res
        .status(400)
        .json(responseFormate(0, "email can't be updated..."));
    }
    conn.query(Quaries.update_profile, [u_name, u_mobile, id]);
    res.status(201).json(responseFormate(1, `Update Success.....`));
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json(responseFormate(0, error.message));
    }
    next(error);
  }
};

module.exports = {
  api,
  register,
  GetAllUsers,
  deleteUser,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
  logout,
  UpdateProfile,
  checkEmailexist,
  resendOTP,
};
