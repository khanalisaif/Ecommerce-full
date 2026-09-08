import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../models/user/User.model.js";
import Order from "../../models/user/Order.model.js";

// @route GET /api/admin/customers
export const getAllCustomers = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 20 } = req.query;
  const baseEmailFilter = { email: { $exists: true, $ne: null } };
  const filter = search
    ? {
        $and: [
          baseEmailFilter,
          {
            $or: [
              { fullName: new RegExp(search, "i") },
              { email: new RegExp(search, "i") },
              { mobileNumber: new RegExp(search, "i") },
            ],
          },
        ],
      }
    : baseEmailFilter;

  const skip = (Number(page) - 1) * Number(limit);
  const [customers, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { customers, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } }, "Customers fetched")
  );
});

// @route GET /api/admin/customers/:id
export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id).select("-password");
  if (!customer) throw new ApiError(404, "Customer not found");

  const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { customer, orders }, "Customer detail fetched"));
});

// @route PUT /api/admin/customers/:id/toggle-active
export const toggleCustomerActive = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id);
  if (!customer) throw new ApiError(404, "Customer not found");

  customer.isActive = !customer.isActive;
  await customer.save();

  res.status(200).json(new ApiResponse(200, { isActive: customer.isActive }, "Customer status updated"));
});

// @route DELETE /api/admin/customers/:id
export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id);
  if (!customer) throw new ApiError(404, "Customer not found");

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, { id: req.params.id }, "Customer deleted successfully"));
});
