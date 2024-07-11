const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
  company: String,
  engineer: String,
  jobCallOut: String,
  action: String,
  date: String,
  timeIn: String,
  timeOut: String,
  phoneNumber: String,
  accessCardNo: String
});

module.exports = mongoose.model('Contractor', contractorSchema);
