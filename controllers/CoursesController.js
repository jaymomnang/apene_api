'use strict';
var mongoose = require('mongoose'),
  Course = mongoose.model('Courses');

exports.list_all_courses = function(req, res) {
  Course.find({}, function(err, course) {
    if (err)
      res.send(err);
      res.json(course);
  });
};

exports.create_course = function(req, res) {
  var new_course = new Course(req.body);
  new_course.save(function(err, course) {
    if (err) res.send(err);

    Course.find({}, function(err, course) {
      if (err) res.send(err);
      res.json(course);
    });
  });
};

exports.get_course = function(req, res) {
  Course.findById(req.params.course, function(err, course) {
    if (err)
      res.send(err);
      res.json(course);
  });
};

exports.update_course = function(req, res) {
  Course.findOneAndUpdate({course: req.params.course}, req.body, {new: true}, function(err, course) {
    if (err) res.send(err);
    res.json(course);
  });
};

exports.delete_course = function(req, res) {
   Course.findOneAndUpdate({course: req.params.course}, req.body, {new: true}, function(err, course) {
     if (err) res.send(err);
     Course.find({}, function(err, course) {
       if (err) res.send(err);
       res.json(course);
     });
  });
};

exports.remove_course = function(req, res) {
   Course.remove({_id: req.params.Id}, function(err, course) {
    if (err) res.send(err);
      res.json({ message: 'Course successfully removed' });
  });
};
