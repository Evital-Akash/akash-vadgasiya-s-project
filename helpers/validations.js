const Joi = require("joi");

const registerValidation = Joi.object({
  u_name: Joi.string().required(),
  u_email: Joi.string().email().exist().required(),
  u_password: Joi.string()
    .min(6)
    .max(30)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must have at least 1 uppercase letter, 1 number, and 1 special character.",
      "string.min": "Password must be at least 6 characters long.",
    }),
  u_mobile: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be exactly 10 digits.",
    }),
});

const loginValidate = Joi.object({
  u_email: Joi.string().email().exist().required(),
  u_password: Joi.string().min(6).max(30).required(),
});

const checkEmailValidate = Joi.object({
  u_email: Joi.string().email().exist().required(),
});

const forgotpasswordlValidate = Joi.object({
  u_email: Joi.string().email().exist().required(),
});

const updateProfileValidate = Joi.object({
  u_name: Joi.string().required(),
  u_mobile: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be exactly 10 digits.",
    }),
});

const resetPasswordValidate = Joi.object({
  u_email: Joi.string().email().exist().required(),
  u_password: Joi.string()
    .min(6)
    .max(30)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must have at least 1 uppercase letter, 1 number, and 1 special character.",
      "string.min": "Password must be at least 6 characters long.",
    }),
});

// ===================================== product validations ==========================================

const productsValidation = Joi.object({
  p_name: Joi.string().required(),
  p_desc: Joi.string().required(),
  p_brand: Joi.string().required(),
  p_price: Joi.string().required(),
  p_qnt: Joi.string().required(),
  cat_id: Joi.required(),
  p_hsn_code: Joi.string().required(),
  p_discount: Joi.string().required(),
});

const updateproductsValidation = Joi.object({
  p_name: Joi.required(),
  p_desc: Joi.string().required(),
  p_brand: Joi.string().required(),
  p_price: Joi.string().required(),
  p_qnt: Joi.string().required(),

  // p_img: Joi.object({
  //   mimetype: Joi.string()
  //     .valid("image/jpeg", "image/png", "image/jpg", "image/webp")
  //     .required(),
  //   size: Joi.number()
  //     .max(10 * 1024 * 1024)
  //     .required(),
  // }),
});

module.exports = {
  registerValidation,
  loginValidate,
  checkEmailValidate,
  forgotpasswordlValidate,
  updateProfileValidate,
  resetPasswordValidate,
  productsValidation,
  updateproductsValidation,
};
