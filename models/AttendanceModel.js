
'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var AttendanceSchema = new Schema({
  email: {
    type: String,
    Required: 'Kindly enter your email address'
  },
  fullname: {
    type: String,
    Required: 'Kindly enter your fullname'
  },
  att_id: {
    type: String,
    default: 'ATT0000001'
  },
  year: {
    type: Number
  },
  month: {
    type: Number
  },
  day: {
    type: Number
  },
  time: {
    type: String
  },
  gradepoint: {
    type: Number
  },
  Created_date: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
