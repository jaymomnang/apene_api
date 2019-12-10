
'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var GradeSchema = new Schema({
  grade: {
    type: String,
    default: 'GP-0000001'
  },
  email: {
    type: String,
    Required: 'Kindly enter the email address'
  },
  fullname: {
    type: String,
    Required: 'Kindly enter the your fullname'
  },
  courses: {
    course: {
      type: String,
      Required: 'Kindly enter the course code'
    },
    description: {
      type: String,
      Required: 'Kindly enter the course description'
    },
    grade_point: {
      type: Number
    },
    AttendancePoint: {
      type: Number
    }
  },
  Created_date: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Grades', GradeSchema);
