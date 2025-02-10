const conn = require("../DB/conn");
const responseFormate = require("../helpers/responseFormate");
const { productsValidation } = require("../helpers/validations");
const Quaries = require("../Quaries");
const fs = require("fs");
const sharp = require("sharp");

// --------------------------- get all products  ----------------------------------

const getAllProducts = async (req, res) => {
  try {
    conn.query(Quaries.get_all_products, async (err, info) => {
      if (err)
        return res
          .status(413)
          .json(responseFormate(0, "error in get products"));

      const products = info.rows.map((product) => ({
        ...product,
        p_img: JSON.parse(product.p_img),
      }));

      await res.status(200).json(responseFormate(1, "Get Success..", products));
    });
  } catch (err) {
    res.send(err);
  }
};

// ------------------------ create new products ---------------------------------------

const addProducts = async (req, res, next) => {
  // const p_img = req.files;
  try {
    const {
      p_name,
      p_desc,
      p_brand,
      p_price,
      p_qnt,
      cat_id,
      p_hsn_code,
      p_discount,
    } = req.body;

    await productsValidation.validateAsync(req.body);

    const ip = req.ip;

    // const p_img = req.files
    //   ? req.files.map((file) => file.buffer.toString("base64"))
    //   : [];

    const p_img = await Promise.all(
      req.files.map(async (file) => {
        const compressedImage = await sharp(file.buffer)
          .resize({ width: 1 })
          .jpeg({ quality: 50 })
          .toBuffer();

        return compressedImage.toString("base64"); // Convert to Base64
      })
    );

    if (p_img.length === 0) {
      return res
        .status(400)
        .json(responseFormate(0, "At least one product image is required."));
    }

    conn.query(
      Quaries.add_products,
      [
        p_name,
        p_desc,
        p_brand,
        p_price,
        p_qnt,
        cat_id,
        p_hsn_code,
        p_discount,
        JSON.stringify(p_img),
        ip,
      ],
      async (err, info) => {
        console.log(err);
        if (err)
          return res
            .status(422)
            .json(responseFormate(0, "error in add products.."));

        await res
          .status(201)
          .json(responseFormate(1, "product add success..."));
      }
    );
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json(responseFormate(0, error.message));
    }
    next(error);
  }
};

// ----------------------------------- delete product ----------------------------------

const deleteProducts = (req, res) => {
  const id = parseInt(req.params.id);

  conn.query(Quaries.delete_products, [id], (err, info) => {
    if (!info) {
      return res.status(213).json(responseFormate(0, "product not found.."));
    } else {
      res.status(200).json(responseFormate(1, "product delete success..."));
    }
  });
};

// ------------------------- update product details --------------------------------

const UpdateProducts = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const { p_name, p_desc, p_brand, p_price, p_qnt } = req.body;

    await conn.query(Quaries.update_products_details, [
      p_name,
      p_desc,
      p_brand,
      p_price,
      p_qnt,
      id,
    ]);

    return res.status(201).json(responseFormate(1, "Update Success....."));
  } catch (err) {
    console.log(err);
  }
};

// ---------------------search products -----------------------------

const SearchProducts = async (req, res) => {
  try {
    const SearchValue = req.query.word;

    conn.query(
      Quaries.search_products,
      [SearchValue, SearchValue],
      (err, info) => {
        if (err) return res.status(401).json(responseFormate(0, "error.."));

        res.status(201).json(info.rows);
      }
    );
  } catch (err) {
    res.send(err);
  }
};

// ------------------------------- get all product categories -------------------------------

const getAllCategory = async (req, res) => {
  try {
    conn.query(Quaries.get_all_categories, async (err, info) => {
      if (err) return res.status(413).json(responseFormate(0, "error.."));

      await res.status(200).json(info.rows);
    });
  } catch (err) {
    res.send(err);
  }
};

// ------------------ create new category --------------------------------

const createNewCategory = async (req, res) => {
  try {
    const { cat_name } = req.body;

    if (!cat_name) {
      res.status(413).json(responseFormate(0, "all fields are required..."));
    } else {
      conn.query(Quaries.create_new_category, [cat_name], async (err, info) => {
        if (err) return res.status(422).json({ message: "error..." });

        await res
          .status(201)
          .json(responseFormate(1, "category create sucess.."));
      });
    }
  } catch (err) {
    rew.json(err);
  }
};

module.exports = {
  getAllProducts,
  deleteProducts,
  addProducts,
  UpdateProducts,
  SearchProducts,
  getAllCategory,
  createNewCategory,
};
