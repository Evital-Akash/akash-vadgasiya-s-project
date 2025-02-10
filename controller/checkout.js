const axios = require("axios");
const conn = require("../DB/conn");
const Quaries = require("../Quaries");
const responseFormate = require("../helpers/responseFormate");

// -------------- get all shipping address ------------------------------

const getShippingAddress = async (req, res) => {
  conn.query(Quaries.get_shipping_address, (err, info) => {
    if (err) return err;
    res.status(200).json(info.rows);
  });
};

// ----------------------- delete address by id ---------------------------

const deleteAddress = async (req, res) => {
  const id = parseInt(req.params.id);

  conn.query(Quaries.delete_address, [id], (err, info) => {
    if (!info) {
      return res.json(responseFormate(0, "address not found.."));
    } else {
      res.json(responseFormate(1, "address delete success..."));
    }
  });
};

//  ---------------------- add shipping address ----------------------------

const Checkout = async (req, res) => {
  const id = req.user;
  const ip = req.ip;

  console.log(req.user);
  const {
    sh_address1,
    sh_address2,
    sh_city,
    sh_state,
    sh_country,
    sh_pincode,
  } = req.body;

  if (
    !sh_address1 ||
    !sh_address2 ||
    !sh_city ||
    !sh_state ||
    !sh_country ||
    !sh_pincode
  ) {
    return res
      .status(400)
      .json({ message: "All address fields required.", success: false });
  } else {
    const result = await conn.query(Quaries.insert_address, [
      sh_address1,
      sh_address2,
      sh_city,
      sh_state,
      sh_country,
      sh_pincode,
      ip,
      id,
    ]);

    const addressID = result.rows[0].id;
    console.log("add id-", addressID);

    const combineAdd =
      req.body.sh_address2 +
      ", " +
      req.body.sh_city +
      ", " +
      req.body.sh_state +
      ", " +
      req.body.sh_pincode +
      ", " +
      req.body.sh_country;

    await savedAddress(combineAdd, addressID);
    console.log("address :", combineAdd);
    res.status(201).json(responseFormate(1, "address added success....."));
  }
};

// ------------------------ get lat and long coordinates -----------------------

async function getCoordinates(address, id) {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: { q: address, format: "json", limit: 1 },
      headers: { "User-Agent": "YourApp/1.0" },
    }
  );

  if (response.data.length > 0) {
    const location = response.data[0];
    // return { lat: parseFloat(location.lat), lng: parseFloat(location.lon) };

    const latt = parseFloat(location.lat);
    const long = parseFloat(location.lon);

    console.log(`latt is - ${latt}   and long is - ${long}  and id is -${id}`);
    conn.query(
      "update shipping_address set sh_latitude=$1, sh_logitude=$2 where id=$3",
      [latt, long, id]
    );
  }
}

async function savedAddress(address, addressID) {
  const coords = await getCoordinates(address, addressID);

  console.log("address added success...");
}
module.exports = { Checkout, getShippingAddress, deleteAddress };
