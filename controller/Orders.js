const conn = require("../DB/conn");
const responseFormate = require("../helpers/responseFormate");
const Quaries = require("../Quaries");

// ----------------------- get all orders -----------------------------

const getAllorders = async (req, res) => {
  conn.query(Quaries.get_all_orders, (err, info) => {
    if (err) return err;
    res.status(200).json(info.rows);
  });
};

// ------------------------- get all order_items ----------------------

const getAllordersItems = async (req, res) => {
  conn.query(Quaries.get_all_orders_items, (err, info) => {
    if (err) return err;
    res.status(200).json(info.rows);
  });
};

// --------------------- delete orders by id ------------------------------

const deleteOrders = async (req, res) => {
  const id = parseInt(req.params.id);
  console.log("order-id", req.params);

  conn.query(Quaries.clear_order_items, [id], async (err, info) => {
    if (err) return res.status(401).json(responseFormate(0, "error.."));

    conn.query(Quaries.clear_orders, [id]);

    return res.status(201).json(responseFormate(1, "delete order success..."));
  });
};

// ----------------------- create orders --------------------------------

const placeOrder = async (req, res) => {
  const { user_id, o_discounts, p_gst_percentage } = req.body;
  console.log("id get - ", req.body);

  if (!user_id) {
    return res.status(400).json(responseFormate(0, "User is not logged in"));
  } else {
    const findCart = await conn.query(Quaries.find_users_cart, [user_id]);
    if (findCart.rows.length === 0) {
      return res
        .status(401)
        .json(
          responseFormate(
            0,
            "No items are available in the cart. Please add products to the cart first."
          )
        );
    }

    const cart_id = findCart.rows[0].id;
    console.log("cart id :-", cart_id);

    const cartItems = await conn.query(Quaries.get_all_items_from_cart, [
      user_id,
    ]);
    console.log("cartItems:-", cartItems.rows);

    if (cartItems.rows.length === 0)
      return res
        .status(401)
        .json(responseFormate(0, "No items found in the cart to order."));

    let productTotal = 0;
    let productDiscount = 0;
    let totalWithoutGST = 0;
    let additionalDiscount = 0;
    let totalDiscounts = 0;

    cartItems.rows.forEach((item) => {
      productTotal += item.p_price * item.cart_quantity;
      productDiscount += (productTotal * item.p_discount) / 100;
      totalWithoutGST += productTotal - productDiscount;
      totalDiscounts += productDiscount;
    });

    console.log("product total", productTotal);
    console.log("product disc (10%)- ", totalDiscounts);
    console.log("Total without additional discount - ", totalWithoutGST);

    additionalDiscount = (totalWithoutGST * o_discounts) / 100;
    console.log("additional disc (10%)-", additionalDiscount);

    // ----- GST ----------------------------------------------

    const discountedTotal = totalWithoutGST - additionalDiscount;
    const gstAmount = (discountedTotal * p_gst_percentage) / 100;
    const totalWithGST = discountedTotal + gstAmount;

    console.log("after all discount total is (gross amt) -", discountedTotal);
    totalDiscounts += additionalDiscount;
    console.log("total discount amt ", totalDiscounts);
    console.log("gst amt (12%)-", gstAmount);
    console.log("total with gst (net amt) -", totalWithGST);

    const ip = req.ip;

    const addressItems = await conn.query(Quaries.get_all_address, [user_id]);
    console.log("address is -->", addressItems.rows[0]);

    // ---------- create new order (Add)-----------------------------

    const newOrder = await conn.query(Quaries.create_new_order, [
      user_id,
      productTotal,
      ip,
      totalDiscounts,
      discountedTotal,
      gstAmount,
      totalWithGST,
      addressItems.rows[0].sh_address1,
      addressItems.rows[0].sh_address2,
      addressItems.rows[0].sh_city,
      addressItems.rows[0].sh_state,
      addressItems.rows[0].sh_country,
      addressItems.rows[0].sh_pincode,
      addressItems.rows[0].sh_latitude,
      addressItems.rows[0].sh_logitude,
    ]);

    console.log("new -", newOrder.rows[0]);

    const orderID = newOrder.rows[0].id;
    console.log("order id is - ", orderID);

    for (const item of cartItems.rows) {
      conn.query(Quaries.order_item_add, [
        orderID,
        item.product_id,
        item.cart_quantity,
        item.p_price,
        item.p_price * item.cart_quantity,
        ip,
      ]);
    }

    await conn.query(Quaries.clear_cart, [cart_id]);

    // const result = await conn.query(Quaries.final_order, [orderID]);

    // console.log("result-", result);

    return res
      .status(200)
      .json(responseFormate(1, "Product added/updated in cart successfully."));
  }
};

// ------------------------- get orders for users ----------------------------------

const getOrders = async (req, res) => {
  const { id } = req.params;
  console.log("idd - ", req.params);

  if (id === 0) {
    return res.status(400).json(responseFormate(0, "User is not logged in."));
  } else {
    const userResult = await conn.query("select * from users where id=$1", [
      id,
    ]);

    console.log("user - ", userResult.rows);

    if (userResult.rows.length === 0) {
      return res.status(404).json(responseFormate(0, "User not found."));
    }

    const username = userResult.rows[0].u_name;
    console.log("user name", username);

    const orderQuery = await conn.query(
      "select o.id as order_id from orders o where o.user_id=$1 order by o.o_created_at desc",
      [id]
    );

    console.log("order-", orderQuery.rows);

    const productIdQuary = await Promise.all(
      orderQuery.rows.map(async (order) => {
        const proQuary = await conn.query(
          "select p.id as product_id from order_items oi join products p on oi.product_id=p.id where oi.order_id=$1",
          [order.order_id]
        );
        return {
          order_id: order.order_id,
          products: proQuary.rows.map((product) => ({
            product_id: product.product_id,
          })),
        };
      })
    );

    return res.status(200).json({
      username: username,
      order: productIdQuary,
    });
  }
};

module.exports = {
  placeOrder,
  getAllorders,
  deleteOrders,
  getOrders,
  getAllordersItems,
};
