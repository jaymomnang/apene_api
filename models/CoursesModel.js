
'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var CourseSchema = new Schema({
  course: {
    type: String,
    Required: 'Kindly enter the course code'
  },
  description: {
    type: String,
    Required: 'Kindly enter the course description'
  },
  max_grade_point: {
    type: Number
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

module.exports = mongoose.model('Courses', CourseSchema);
