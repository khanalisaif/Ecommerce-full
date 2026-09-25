/**
 * Delhivery API Utility — backend helper for all 9 Delhivery APIs
 * All credentials come from .env (DELHIVERY_TOKEN, DELHIVERY_BASE_URL, etc.)
 */
import axios from "axios";
import qs from "qs";

const TOKEN        = process.env.DELHIVERY_TOKEN;
const BASE_URL     = process.env.DELHIVERY_BASE_URL    || "https://track.delhivery.com";
const PICKUP_LOC   = process.env.DELHIVERY_PICKUP_LOCATION || "DIGIVAHAN";
const ORIGIN_PIN   = process.env.DELHIVERY_ORIGIN_PINCODE  || "110092";

if (!TOKEN) {
  console.warn("⚠️  DELHIVERY_TOKEN not set — Delhivery APIs will fail at runtime");
}

const hdrs = (ct = "application/json") => ({
  Authorization: `Token ${TOKEN}`,
  "Content-Type": ct,
  Accept: "application/json",
});

/**
 * API 1 — Create Shipment (CMU API)
 * POST https://track.delhivery.com/api/cmu/create.json
 * Content-Type: application/x-www-form-urlencoded
 * Returns waybill/AWB number in packages[0].waybill
 */
export async function createShipment(orderData) {
  const payload = {
    shipments: [
      {
        name:             orderData.name,
        add:              orderData.address,
        pin:              String(orderData.pincode),
        city:             orderData.city   || "",
        state:            orderData.state  || "",
        country:          orderData.country || "India",
        phone:            String(orderData.phone),
        order:            orderData.orderId,
        payment_mode:     orderData.paymentMode || "Prepaid",   // "Prepaid" | "COD"
        shipment_length:  String(orderData.length  || 10),
        shipment_width:   String(orderData.width   || 10),
        shipment_height:  String(orderData.height  || 5),
        weight:           String(orderData.weight  || 0.05),    // kg
        products_desc:    orderData.productName || "Product",
        total_amount:     String(orderData.totalAmount || 0),
        cod_amount:       orderData.paymentMode === "COD"
                            ? String(orderData.totalAmount || 0)
                            : "0",
        shipping_mode:    orderData.shippingMode || "Surface",  // "Surface" | "Express"
      },
    ],
    pickup_location: { name: PICKUP_LOC },
  };

  const formData = qs.stringify({
    format: "json",
    data:   JSON.stringify(payload),
  });

  const res = await axios.post(
    `${BASE_URL}/api/cmu/create.json`,
    formData,
    { headers: { Authorization: `Token ${TOKEN}`, "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return res.data;
}

/**
 * API 2 — Schedule Pickup (First Mile Pickup API)
 * POST https://track.delhivery.com/fm/request/new/
 */
export async function schedulePickup({ pickupDate, pickupTime, packageCount }) {
  const res = await axios.post(
    `${BASE_URL}/fm/request/new/`,
    {
      pickup_date:            pickupDate    || new Date().toISOString().slice(0, 10),
      pickup_time:            pickupTime    || "16:00:00",
      pickup_location:        PICKUP_LOC,
      expected_package_count: Number(packageCount || 1),
    },
    { headers: hdrs("application/json") }
  );
  return res.data;
}

/**
 * API 3 — Generate Shipping Label / Packing Slip
 * GET https://track.delhivery.com/api/p/packing_slip
 * Returns packages[0].pdf_download_link
 */
export async function generateLabel(waybill) {
  const res = await axios.get(`${BASE_URL}/api/p/packing_slip`, {
    params: { wbns: waybill, pdf: true, pdf_size: "" },
    headers: { Authorization: `Token ${TOKEN}`, Accept: "application/json" },
  });
  return res.data;
}

/**
 * API 4 — Cancel Shipment
 * POST https://track.delhivery.com/api/p/edit
 */
export async function cancelShipment(waybill) {
  const res = await axios.post(
    `${BASE_URL}/api/p/edit`,
    { waybill, cancellation: "true" },
    { headers: hdrs("application/json") }
  );
  return res.data;
}

/**
 * API 5 — Track Package
 * GET https://track.delhivery.com/api/v1/packages/json/?waybill=
 */
export async function trackPackage(waybill) {
  const res = await axios.get(
    `${BASE_URL}/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}`,
    { headers: hdrs("application/json") }
  );
  return res.data;
}

/**
 * API 6 — Expected TAT
 * GET https://track.delhivery.com/api/dc/expected_tat
 */
export async function getExpectedTAT({ destinationPin, mode = "S", pickupDateTime }) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const res = await axios.get(`${BASE_URL}/api/dc/expected_tat`, {
    params: {
      origin_pin:           ORIGIN_PIN,
      destination_pin:      destinationPin,
      mot:                  mode,
      pdt:                  "B2C",
      expected_pickup_date: pickupDateTime || formatted,
    },
    headers: { Authorization: `Token ${TOKEN}` },
  });
  return res.data;
}

/**
 * API 7 — Shipping Charges / Rate Calculator
 * GET https://track.delhivery.com/api/kinko/v1/invoice/charges/.json
 */
export async function getShippingCharges({ destinationPin, weightGrams, paymentType = "Prepaid", mode = "S", l = 10, b = 10, h = 5 }) {
  const res = await axios.get(`${BASE_URL}/api/kinko/v1/invoice/charges/.json`, {
    params: {
      md:         mode,
      cgm:        Number(weightGrams || 50),
      o_pin:      ORIGIN_PIN,
      d_pin:      destinationPin,
      ss:         "Delivered",
      pt:         paymentType,
      l, b, h,
      ipkg_type:  "flyer",
    },
    headers: { Authorization: `Token ${TOKEN}` },
  });
  return res.data;
}

/**
 * API 8 — Pincode Serviceability
 * GET https://track.delhivery.com/c/api/pin-codes/json/
 */
export async function checkPincodeServiceability(pincode) {
  const res = await axios.get(`${BASE_URL}/c/api/pin-codes/json/`, {
    params: { filter_codes: pincode },
    headers: { Authorization: `Token ${TOKEN}` },
  });
  return res.data;
}

/**
 * API 9 — Create Warehouse / Pickup Location
 * POST https://track.delhivery.com/api/backend/clientwarehouse/create/
 */
export async function createWarehouse(warehouseData) {
  const res = await axios.post(
    `${BASE_URL}/api/backend/clientwarehouse/create/`,
    {
      name:           warehouseData.name    || PICKUP_LOC,
      email:          warehouseData.email   || "",
      phone:          warehouseData.phone   || "",
      address:        warehouseData.address || "",
      city:           warehouseData.city    || "",
      pin:            warehouseData.pin     || ORIGIN_PIN,
      country:        "India",
      return_address: warehouseData.returnAddress || warehouseData.address || "",
      return_pin:     warehouseData.pin     || ORIGIN_PIN,
      return_city:    warehouseData.city    || "",
      return_state:   warehouseData.state   || "",
      return_country: "India",
    },
    { headers: hdrs("application/json") }
  );
  return res.data;
}

export const DELHIVERY_PUBLIC_TRACK_URL = "https://www.delhivery.com/track-v2/package";

/**
 * Extracts human-readable error messages from Delhivery API error responses
 */
export function formatDelhiveryError(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || "Unknown Delhivery error";
  if (typeof data === "string") return data;
  if (data.prepaid) return data.prepaid;
  if (data.message) return data.message;
  if (data.msg) return data.msg;
  if (data.error) return typeof data.error === "string" ? data.error : JSON.stringify(data.error);
  if (Array.isArray(data.packages) && data.packages[0]?.remarks) {
    const remarks = data.packages[0].remarks;
    return Array.isArray(remarks) ? remarks.join(", ") : String(remarks);
  }
  if (typeof data === "object") {
    const values = Object.entries(data)
      .map(([k, v]) => (k === "prepaid" ? String(v) : `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`))
      .filter(Boolean);
    if (values.length > 0) return values.join(" | ");
  }
  return err.message || "Delhivery API request failed";
}
