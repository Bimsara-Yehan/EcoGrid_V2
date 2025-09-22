
const Customer = require("../Model/CustomerModel");

// List all customers (return new schema fields)
const getAllCustomers = async (req, res) => {
  try {
    // Return all customer fields for analysis, including location
    const customers = await Customer.find().lean();
    return res.status(200).json(customers || []);
  } catch (err) {
    console.error("Error in getAllCustomers:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get customer by id
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("userId fullName phones addresses activeSubscriptionId ecopointsBalance ecopointsTransactions");
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    return res.status(200).json(customer);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Create
const addCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    return res.status(201).json({ customer });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to add customer" });
  }
};

// Update
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    return res.status(200).json({ customer });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    return res.status(200).json({ message: "Customer deleted", customer });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
};


