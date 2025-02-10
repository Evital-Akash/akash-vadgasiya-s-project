const jwt = require("jsonwebtoken");
const conn = require("../DB/conn");
const Quaries = require("../Quaries");

const Authentication = async (req, res, next) => {
  const token = req.cookies?.jwtoken;

  if (!token) {
    return res.status(400).json({ message: "no authorization.." });
  }

  const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

  if (verifyToken) {
    let id = verifyToken.id;
    req.user = id;
    next();
  } else {
    return res.send(401).json({ message: "No Authorized Request" });
  }
};

const AdminAuth = async (req, res, next) => {
  const token = req.cookies?.jwtoken;
  console.log("token auth-", token);

  if (!token) {
    return res.status(400).json({ message: "no authorization.." });
  }

  const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

  if (verifyToken) {
    let id = verifyToken.id;

    conn.query(Quaries.is_admin, [id], (err, info) => {
      if (err) {
        return res.status(400).json({ message: "error..." });
      }
      req.params.id = id;
      next();
    });
  } else {
    return res.send(401).json({ message: "No Authorized Request" });
  }
};

module.exports = { Authentication, AdminAuth };
