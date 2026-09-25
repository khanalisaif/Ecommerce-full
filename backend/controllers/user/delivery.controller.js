import axios from "axios";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

const DELHIVERY_TOKEN       = process.env.DELHIVERY_TOKEN;
const DELHIVERY_BASE_URL    = process.env.DELHIVERY_BASE_URL    || "https://track.delhivery.com";
const DELHIVERY_ORIGIN_PIN  = process.env.DELHIVERY_ORIGIN_PINCODE || "110092";
const DELHIVERY_PICKUP_LOC  = process.env.DELHIVERY_PICKUP_LOCATION || "DIGIVAHAN";

const delhiveryHeaders = () => ({
  Authorization: `Token ${DELHIVERY_TOKEN}`,
  "Content-Type": "application/json",
  Accept: "application/json",
});

/**
 * GET /api/user/delivery/tat
 * Query: pincode (destination), weight (grams), mode (S|E), payment_type (Prepaid|COD)
 *
 * Returns: { tat, expectedDate, charges }
 */
export const getDeliveryInfo = asyncHandler(async (req, res) => {
  if (!DELHIVERY_TOKEN) {
    throw new ApiError(503, "Delivery service not configured");
  }

  const {
    pincode,
    weight = 50,           // grams, default 50g
    mode   = "S",          // S = Surface, E = Express
    payment_type = "Prepaid",
  } = req.query;

  if (!pincode || String(pincode).length !== 6 || isNaN(Number(pincode))) {
    throw new ApiError(400, "Valid 6-digit pincode is required");
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const pickupDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Run TAT + charges in parallel
  const [tatRes, chargesRes] = await Promise.allSettled([
    axios.get(`${DELHIVERY_BASE_URL}/api/dc/expected_tat`, {
      params: {
        origin_pin:            DELHIVERY_ORIGIN_PIN,
        destination_pin:       pincode,
        mot:                   mode,
        pdt:                   "B2C",
        expected_pickup_date:  pickupDateTime,
      },
      headers: delhiveryHeaders(),
      timeout: 8000,
    }),
    axios.get(`${DELHIVERY_BASE_URL}/api/kinko/v1/invoice/charges/.json`, {
      params: {
        md:         mode,
        cgm:        Number(weight),
        o_pin:      DELHIVERY_ORIGIN_PIN,
        d_pin:      pincode,
        ss:         "Delivered",
        pt:         payment_type,
        l:          10,
        b:          10,
        h:          5,
        ipkg_type:  "flyer",
      },
      headers: delhiveryHeaders(),
      timeout: 8000,
    }),
  ]);

  // TAT
  let tatDays        = null;
  let expectedDate   = null;
  let deliveryDate   = null;

  if (tatRes.status === "fulfilled") {
    const raw = tatRes.value?.data;
    // Delhivery returns: { success: true, data: { tat: 4, expected_delivery_date: "2026-09-29" } }
    const tatObj = raw?.data && typeof raw.data === "object" ? raw.data : (Array.isArray(raw) ? raw[0] : raw);

    if (tatObj?.expected_delivery_date) {
      deliveryDate = tatObj.expected_delivery_date;
    } else if (raw?.expected_delivery_date) {
      deliveryDate = raw.expected_delivery_date;
    }

    if (tatObj?.tat !== undefined && tatObj?.tat !== null) {
      tatDays = Number(tatObj.tat);
    } else if (raw?.tat !== undefined && raw?.tat !== null) {
      tatDays = Number(raw.tat);
    }

    if (deliveryDate) {
      // Parse the date string from Delhivery (e.g. "2026-09-29")
      const d = new Date(deliveryDate);
      if (!isNaN(d.getTime())) {
        expectedDate = d.toLocaleDateString("en-IN", {
          weekday: "long",
          day:     "numeric",
          month:   "long",
        });
        tatDays = Math.max(1, Math.ceil((d - now) / (1000 * 60 * 60 * 24)));
      }
    } else if (tatDays !== null && !isNaN(tatDays)) {
      const d = new Date();
      d.setDate(d.getDate() + tatDays);
      expectedDate = d.toLocaleDateString("en-IN", {
        weekday: "long",
        day:     "numeric",
        month:   "long",
      });
      deliveryDate = d.toISOString().slice(0, 10);
    }
  }

  // Charges
  let shippingCharge = null;
  let hasCOD = true;
  if (chargesRes.status === "fulfilled") {
    const chargesData = chargesRes.value?.data;
    const charges = Array.isArray(chargesData) ? chargesData[0] : chargesData;
    shippingCharge = charges?.total_amount ?? charges?.freight ?? null;
  }

  // Pincode serviceability
  const isServiceable = tatRes.status === "fulfilled" || chargesRes.status === "fulfilled";

  res.status(200).json(
    new ApiResponse(200, {
      isServiceable,
      pincode: String(pincode),
      tatDays,
      expectedDate,
      deliveryDate,
      hasCOD,
      shippingCharge, // returned for admin / internal calculation
      originPincode: DELHIVERY_ORIGIN_PIN,
      pickupLocation: DELHIVERY_PICKUP_LOC,
    }, "Delivery info fetched")
  );
});

/**
 * GET /api/user/delivery/serviceability
 * Query: pincode
 */
export const checkPincodeServiceability = asyncHandler(async (req, res) => {
  if (!DELHIVERY_TOKEN) {
    throw new ApiError(503, "Delivery service not configured");
  }

  const { pincode } = req.query;
  if (!pincode || String(pincode).length !== 6 || isNaN(Number(pincode))) {
    throw new ApiError(400, "Valid 6-digit pincode is required");
  }

  const response = await axios.get(`${DELHIVERY_BASE_URL}/c/api/pin-codes/json/`, {
    params: { filter_codes: pincode },
    headers: delhiveryHeaders(),
    timeout: 8000,
  });

  const results = response.data?.delivery_codes || [];
  const found   = results[0];

  res.status(200).json(
    new ApiResponse(200, {
      pincode: String(pincode),
      isServiceable: results.length > 0,
      hasCOD:     found?.postal_code?.cod  === "Y",
      hasPrepaid: found?.postal_code?.pre_paid === "Y",
      district:   found?.postal_code?.district || "",
      stateName:  found?.postal_code?.state_code || "",
    }, "Pincode serviceability fetched")
  );
});
