const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan: { type: String, enum: ['basic', 'pro'] },
  amount: Number,
  razorpayPaymentId: String,
  razorpayOrderId: String,
  razorpaySignature: String,
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);

