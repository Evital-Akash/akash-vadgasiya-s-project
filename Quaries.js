const get_all_users = "select * from users";
const delete_user = "delete from users where id=$1";

const register_user =
  "insert into users(u_name,u_email,u_password,u_mobile,u_ipaddress) values ($1,$2,$3,$4,$5)";
const check_email = "select from users where u_email=$1";
const update_otp = "update users set u_otp=$1 where u_email=$2";

const verify_otp =
  "select u_email, u_otp, u_updated_at from users where u_email=$1";
const clear_otp = "update users set u_otp=NULL where u_email=$1";

const update_otp_status =
  "update users set u_otpstatus='verified' where u_email=$1";

const login_user = "select * from users where u_email=$1";
const forgot_password = "select u_email from users where u_email=$1";
const reset_password = "update users set u_password=$1 where u_email=$2";

const update_profile = "update users set u_name=$1,u_mobile=$2 where id=$3";

// ------------------------------------ Authentication --------------------------------------

const is_admin = "select * from users where id=$1";

// --------------------------------- product ------------------------------------------------

const get_all_products = "select * from products";

const add_products =
  "insert into products (p_name,p_desc,p_brand,p_price,p_qnt,cat_id,p_hsn_code,p_discount,p_img,p_ipaddress) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)";

const delete_products = "delete from products where id=$1";

const update_products_details =
  "update products set p_name=$1,p_desc=$2,p_brand=$3,p_price=$4,p_qnt=$5 where id=$6";

const search_products =
  "select * from products where p_name LIKE $1 or p_brand LIKE $2";

// --------------------------------------- categories -----------------------------------------

const get_all_categories = "select * from categories";

const create_new_category = "insert into categories (cat_name) values ($1)";

// -------------------------------------- carts -------------------------------------------------

const add_to_cart =
  "insert into cart (user_id,product_id,cart_quantity,cart_ipaddress) values ($1,$2,$3,$4)";
const remove_to_cart = "delete from cart where id=$1";

const all_cart_product = "select * from cart";

const check_product_exist = "select p_qnt from products where id=$1";

// ----------------------------------- orders-----------------------------------------------------

const create_new_order =
  "insert into orders (user_id,o_total,o_ipaddress,o_discounts,o_gross_amt,o_gst,o_net_amt,o_address1,o_address2,o_city,o_state,o_country,o_pincode,o_latitude,o_logitude) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id";
const get_all_orders = "select * from orders";

const get_all_orders_items = "select * from order_items";

const clear_order_items = "delete from order_items where order_id=$1";

const clear_orders = "delete from orders where id=$1";
const order_item_add =
  "insert into order_items (order_id,product_id,oi_quantity,oi_price,oi_total,oi_ipaddress) values ($1,$2,$3,$4,$5,$6)";

const clear_cart = "delete from cart where id=$1";

const get_all_items_from_cart =
  "select ci.product_id, ci.cart_quantity, p.p_price,p.p_discount,p.p_hsn_code FROM cart ci join products p on ci.product_id=p.id where ci.user_id=$1";

const get_all_address = "select * from shipping_address where user_id=$1";

const find_users_cart = "select id from cart where user_id=$1";

// ------------------------------------------ checkout -------------------------------

const insert_address =
  "insert into shipping_address (sh_address1,sh_address2,sh_city,sh_state,sh_country,sh_pincode,sh_ipaddress,user_id) values ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id";

const get_shipping_address = "select * from shipping_address";

const delete_address = "delete from shipping_address where id=$1";

const final_order_details =
  "select * from order_items oi join users u on u.id=oi.id";

// ---------------------------------- reviews -------------------------------------------

const add_reviews =
  "insert into reviews(r_rating,r_comment,r_img,user_id,product_id,r_ipaddress) values ($1,$2,$3,$4,$5,$6)";

const get_all_reviews = "select * from reviews";

const delete_reviews = "delete from reviews where id=$1";

module.exports = {
  register_user,
  get_all_users,
  check_email,
  delete_user,
  update_otp,
  verify_otp,
  clear_otp,
  login_user,
  forgot_password,
  reset_password,
  update_profile,
  get_all_products,
  add_products,
  delete_products,
  update_products_details,
  add_to_cart,
  check_product_exist,
  remove_to_cart,
  all_cart_product,
  create_new_order,
  get_all_items_from_cart,
  order_item_add,
  is_admin,
  search_products,
  clear_cart,
  clear_order_items,
  get_all_orders,
  update_otp_status,
  get_all_categories,
  create_new_category,
  find_users_cart,
  insert_address,
  get_shipping_address,
  add_reviews,
  get_all_reviews,
  delete_reviews,
  get_all_orders_items,
  clear_orders,
  delete_address,
  get_all_address,
};
