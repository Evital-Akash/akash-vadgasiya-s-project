const conn = require("../DB/conn");
const Quaries = require("../Quaries");

// ------------------------ get all cart product ------------------------

const allCartProduct = async (req, res) => {
  try {
    conn.query(Quaries.all_cart_product, (err, info) => {
      if (err) return res.status(400).json({ message: "errors.." });
      res.status(201).json(info.rows);
    });
  } catch (err) {
    res.json(err);
  }
};

// ------------------------- add to cart -----------------------------------

const addToCart = async (req, res) => {
  const { user_id, product_id, cart_quantity } = req.body;
  console.log(req.body);

  if (!user_id || !product_id || !cart_quantity) {
    res.status(401).json({ message: "all fields are required.." });
  } else {
    conn.query(Quaries.check_product_exist, [product_id], (err, info) => {
      if (err) {
        res.status(400).json({ message: "error..." });
      } else {
        if (info.rows.length === 0) {
          return res.status(404).json({ message: "Product not found" });
        }
        const availStock = info.rows[0].p_qnt;
        console.log(availStock);

        if (availStock <= cart_quantity) {
          return res.status(400).json({ message: "Insufficient stock" });
        }

        const ip = req.ip;

        conn.query(
          Quaries.add_to_cart,
          [user_id, product_id, cart_quantity, ip],
          (err, info) => {
            if (err) return res.status(413).json({ message: "error" });
            res.status(201).json({ message: "product added to cart..." });
          }
        );
      }
    });
  }
};

// --------------------------- remove from cart by cart id--------------------------------

const removeToCart = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    conn.query(Quaries.remove_to_cart, [id], (err, info) => {
      if (err) return res.status(413).json({ message: "error..." });

      res.status(201).json({ message: "product remove success....." });
    });
  } catch (err) {
    res.json(err);
  }
};

// -------------------- using product id remove product from cart---------------------------

const removeByProduct = async (req, res) => {
  try {
    const { id } = req.user;
    console.log("u-id", id);

    const { product_id } = req.body;
    // console.log(req.body);

    if (!id || !product_id) {
      res.status(401).json({ message: "error..." });
    } else {
      const findcart = await conn.query(
        "select id from cart where user_id=$1",
        [id]
      );
      if (findcart.rows.length === 0) {
        return res.status(404).json({ message: "Cart not found for user." });
      }

      const cartID = findcart.rows[0].id;

      const cartResult = await conn.query(
        "select id,cart_quantity from cart where id=$1 and product_id=$2",
        [cartID, product_id]
      );

      if (cartResult.rows.length === 0) {
        return res.status(404).json({ message: "Product not found in cart." });
      }

      await conn.query("delete from cart where id=$1 and product_id=$2", [
        cartID,
        product_id,
      ]);

      return res.status(201).json({
        message: "Product removed from cart Successfully.",
        success: true,
      });
    }
  } catch (err) {
    res.json(err);
  }
};
module.exports = { addToCart, removeToCart, allCartProduct, removeByProduct };
