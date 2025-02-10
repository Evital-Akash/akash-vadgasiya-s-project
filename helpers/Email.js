const nodemailer = require("nodemailer");

const Email = async ({ email, subject, message }) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: message,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("error", err);
    } else {
      res.status(200).json({ message: "email sent sucess..." });
    }
  });
};

module.exports = Email;
