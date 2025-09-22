const Payment = require('../models/Payment');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Public
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get a single payment by id
// @route   GET /api/payments/:id
// @access  Public
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a payment
// @route   POST /api/payments
// @access  Public
const createPayment = async (req, res) => {
  try {
    console.log('Creating payment with payload:', JSON.stringify(req.body, null, 2));
    
    const payload = { ...req.body };
    // Normalize strings
    ['driverName','route','staffName','role','paymentMethod','notes','category','paymentType']
      .forEach((k) => { if (typeof payload[k] === 'string') payload[k] = payload[k].trim(); });

    console.log('Normalized payload:', JSON.stringify(payload, null, 2));

    const payment = await Payment.create(payload);
    console.log('Payment created successfully:', payment._id);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    console.error('Error creating payment:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({ success: false, error: messages });
    }
    
    if (error.name === 'CastError') {
      console.error('Cast error:', error.message);
      return res.status(400).json({ success: false, error: `Invalid data type: ${error.message}` });
    }
    
    res.status(500).json({ success: false, error: `Server Error: ${error.message}` });
  }
};

// @desc    Update a payment
// @route   PUT /api/payments/:id
// @access  Public
const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update payment status (approve/reject)
// @route   PUT /api/payments/:id/status
// @access  Public
const updatePaymentStatus = async (req, res) => {
  try {
    const { status, approvalNotes } = req.body;
    
    if (!status || !['Approved', 'Rejected', 'Paid'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status must be Approved, Rejected, or Paid' 
      });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        approvalNotes: approvalNotes?.trim() || '',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Public
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment
};


