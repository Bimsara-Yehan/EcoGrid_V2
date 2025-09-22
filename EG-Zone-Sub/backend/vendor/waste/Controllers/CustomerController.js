
const Customer = require("../Model/CustomerModel");

// List all customers (return new schema fields)
const getAllCustomers = async (req, res) => {
  try {
  // Return all customer fields for analysis, including location
  const customers = await Customer.find().lean();
  return res.status(200).json({ success: true, data: customers || [] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Server error" } });
  }
};

// Get customer by id
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("userId fullName phones addresses activeSubscriptionId ecopointsBalance ecopointsTransactions");
    if (!customer) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Customer not found" } });
    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Server error" } });
  }
};

// Create
const addCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    return res.status(201).json({ success: true, data: { customer }, message: "Customer created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: { code: "CREATE_FAILED", message: "Failed to add customer" } });
  }
};

// Update
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Customer not found" } });
    return res.status(200).json({ success: true, data: { customer }, message: "Customer updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Server error" } });
  }
};

// Delete
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Customer not found" } });
    return res.status(200).json({ success: true, data: { customer }, message: "Customer deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Server error" } });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
};


