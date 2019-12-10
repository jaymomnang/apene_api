'use strict';
var mongoose = require('mongoose'),
  AppSetting = mongoose.model('AppSetting'),
  Attendance = mongoose.model('Attendance');

exports.list_all_attendance = function(req, res) {
  Attendance.find({}, function(err, attendance) {
    if (err)
      res.send(err);
      res.json(attendance);
  });
};

exports.add_attendance = function(req, res) {
  var new_attendance = new Attendance(req.body);
  //check if data exists already.
  var grade = new_attendance.gradepoint;
  if (grade < 8){
    grade = 8;
  }else if (grade > 13){
    grade = 13;
  }

  AppSetting.find({setting: grade.toString()},  function(err, data) {
    if (err) return arr;
    new_attendance.gradepoint = data[0].value;
    Attendance.find({email: new_attendance.email, year: new_attendance.year, month: new_attendance.month, day: new_attendance.day}, 'att_id email', function(err, data) {
      if (err) return err;
      if (data.length == 0){

        //get tha last attendance id
        Attendance.findOne({}, 'att_id').sort({att_id: -1}).exec(function(err, attendance) {
          if (err) return err;

          //get the next attendance number and save
          var attId = 'ATT0000000';

          if (attendance != null){
              attId = attendance.att_id;
          }

          new_attendance.att_id =  getNewAttendanceId(attId);
          new_attendance.save(function(err, attendance) {
            if (err)
              res.send(err);
              res.json(attendance);
          });

        });
      }else{
        res.json({ message: 'attendance already recorded' });
      }
    });
  });

};

exports.get_attendance = function(req, res) {
  Attendance.find({email: req.params.email, att_id: req.params.att_id}, function(err, attendance) {
    if (err)
      res.send(err);
      res.json(attendance);
  });
};

exports.get_user_attendance = function(req, res) {
  Attendance.find({email: req.params.email}, function(err, attendance) {
    if (err)
      res.send(err);
      res.json(attendance);
  });
};

exports.get_single_attendance = function(req, res){
  Attendance.findOne({email: req.params.email, time: req.params.time}, function(err, attendance) {
    if (err)
      res.send(err);
      res.json(attendance);
  });
}


exports.get_last_attendance = function(req, res) {
  Attendance.findOne({}).sort({att_id: -1}).exec(function(err, attendance) {
    if (err)
      res.send(err);
      res.json(attendance);
  });
};

exports.update_attendance = function(req, res) {
  Attendance.findOneAndUpdate({email: req.params.email, att_id: req.params.att_id}, req.body, {new: true}, function(err, attendance) {
    if (err)
      res.send(err);
      res.json(attendance);
  });
};

exports.delete_attendance = function(req, res) {
  Attendance.findOneAndUpdate({email: req.params.email, att_id: req.params.att_id}, req.body, {new: true}, function(err, attendance) {
    if (err)
      res.send(err);
      res.json({message: 'Attendance successfully deactivated'});
  });
};


exports.remove_attendance = function(req, res) {
  Attendance.remove({att_id: req.params.att_id}, function(err, user) {
    if (err)
     res.send(err);
     res.json({ message: 'attendance successfully removed' });
  });
};

//internally generated numbers for attendance records.
var getNewAttendanceId = function(currentID){
      var pos = Number(currentID.substring(3,10)) + 1;
      var nxt = "ATT000000";
      switch(pos.toString().length) {
          case 2:
              nxt = "ATT00000" + pos.toString();
              break;
          case 3:
              nxt = "ATT0000" + pos.toString();
              break;
          case 4:
              nxt = "ATT000" + pos.toString();
              break;
          case 5:
              nxt = "ATT00" + pos.toString();
              break;
          case 6:
              nxt = "ATT0" + pos.toString();
              break;
          case 7:
              nxt = "ATT" + pos.toString();
              break;
          default:
              nxt = nxt + pos.toString();
    }
    return nxt;
};
