import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../models/user/User.model.js";

// @route GET /api/user/addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(new ApiResponse(200, { addresses: user.addresses }, "Addresses fetched"));
});

// @route POST /api/user/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const { type, fullName, mobile, pincode, addressLine, landmark, city, state, addressType, isDefault } = req.body;

  if (!fullName || !mobile || !pincode || !addressLine || !city || !state) {
    throw new ApiError(400, "fullName, mobile, pincode, addressLine, city and state are required");
  }

  const user = await User.findById(req.user._id);

  if (isDefault || user.addresses.length === 0) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  user.addresses.push({
    type: type || "HOME",
    fullName,
    mobile,
    pincode,
    addressLine,
    landmark,
    city,
    state,
    addressType: addressType || "home",
    isDefault: isDefault || user.addresses.length === 0,
  });

  await user.save();
  res.status(201).json(new ApiResponse(201, { addresses: user.addresses }, "Address added"));
});

// @route PUT /api/user/addresses/:addressId
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError(404, "Address not found");

  const fields = ["type", "fullName", "mobile", "pincode", "addressLine", "landmark", "city", "state", "addressType"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) address[f] = req.body[f];
  });

  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
    address.isDefault = true;
  }

  await user.save();
  res.status(200).json(new ApiResponse(200, { addresses: user.addresses }, "Address updated"));
});

// @route DELETE /api/user/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError(404, "Address not found");

  const wasDefault = address.isDefault;
  address.deleteOne();

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.status(200).json(new ApiResponse(200, { addresses: user.addresses }, "Address deleted"));
});

// @route PUT /api/user/addresses/:addressId/set-default
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError(404, "Address not found");

  user.addresses.forEach((a) => (a.isDefault = false));
  address.isDefault = true;

  await user.save();
  res.status(200).json(new ApiResponse(200, { addresses: user.addresses }, "Default address updated"));
});
