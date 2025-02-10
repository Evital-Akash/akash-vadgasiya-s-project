const conn = require("../DB/conn");
const responseFormate = require("../helpers/responseFormate");
const Quaries = require("../Quaries");

const getAllReviews = async (req, res) => {
  try {
    conn.query(Quaries.get_all_reviews, async (err, info) => {
      if (err) return res.status(413).json(responseFormate(0, "error.."));

      await res.status(200).json(info.rows);
    });
  } catch (err) {
    res.send(err);
  }
};

const addReviews = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  const { product_id } = req.body;

  const r_img = req.file.filename;
  console.log("reviews-", req.file.filename);

  try {
    const { r_rating, r_comment } = req.body;
    const ip = req.ip;

    if (!r_rating || !r_comment) {
      res.status(422).json(responseFormate(0, "err.."));
    } else {
      conn.query(Quaries.add_reviews, [
        r_rating,
        r_comment,
        r_img,
        id,
        product_id,
        ip,
      ]);
      return res.status(201).json(responseFormate(1, "Add success"));
    }
  } catch (err) {
    res.json(err);
  }
};

const deleteReviews = async (req, res) => {
  const id = parseInt(req.params.id);
  console.log("del-", id);

  conn.query(Quaries.delete_reviews, [id], (err, info) => {
    if (!info) {
      return res.status(213).json(responseFormate(0, "reviews not found.."));
    } else {
      res.status(200).json(responseFormate(1, "delete success..."));
    }
  });
};

module.exports = { addReviews, getAllReviews, deleteReviews };
