'use strict';
var mongoose = require('mongoose'),
    async = require('async'),
    Task = mongoose.model('Tasks');

exports.list_all_tasks = function(req, res) {
  Task.find({}, function(err, task) {
    if (err)
      res.send(err);
      res.json(task);
  });
};

//Create students tasks.
exports.create_task = function(req, res) {

  if (req.body.course == undefined){
    Task.find({}, function(err, task) {
      if (err) res.send(err);
      res.json(task);
    });
  }else{

  var _instruct = req.body.description;
  var _duedate = req.body.duedate;
  var _course = req.body.course;
  var _details;
  if (_details != undefined){
  _details = _course.split("/");
  }
  var students = req.body.students;
  var i = 0;
  var _max = 0;
  if (students != undefined){
    students.length;
  }
  var listItems = [];

  Task.findOne({}, 'taskid').sort({taskid: -1}).exec(function(error, data){
    if (error) res.send(error)

    var taskid = 'TSK0000000';
    if (data != null){
        taskid = data.taskid;
    }

    for (i == 0; i < _max; i++) {

      var new_task = new Task(req.body);

      //course assignment
      new_task.courses.course = _details[0];
      new_task.courses.description = _details[1];
      new_task.courses.gradepoint = _details[2];
      //student assignment
      var _student = students[i].split("/");
      new_task.email = _student[0];
      new_task.firstname = _student[1];
      new_task.lastname = _student[2];
      new_task.description = _instruct;
      new_task.duedate = _duedate;
      new_task.taskid = getNewtaskId(taskid);

      taskid = new_task.taskid;
      listItems[i] = new_task;

    };

    var idx = 0;
    async.each(listItems, function(listItem, next) {

      listItem.position = idx;
      listItem.save(function(err, results) {
        idx++;
        // the next() function is called when you
        // want to move to the next item in the array
        next();
      });
    }, function(err) {
      // all data has been updated do whatever you want
      Task.find({}, function(err, task) {
        if (err) res.send(err);
        res.json(task);
      });
    });

  });
}
};

exports.get_task = function(req, res) {
  Task.findById(req.params.taskId, function(err, task) {
    if (err)
      res.send(err);
      res.json(task);
  });
};

exports.update_task = function(req, res) {
  Task.findOneAndUpdate({taskid: req.params.taskId}, req.body, {new: true}, function(err, task) {
    if (err)
      res.send(err);
      res.json(task);
  });
};

exports.delete_task = function(req, res) {
  Task.findOneAndUpdate({taskid: req.params.taskId}, req.body, {new: true}, function(err, task) {
    if (err)
      res.send(err);
      res.json({ message: 'Task successfully deactivated' });
  });
};

exports.remove_task = function(req, res) {
  Task.remove({taskid: req.params.taskId}, function(err, user) {
    if (err) res.send(err);
     res.json({ message: 'Task successfully removed' });
 });
};

exports.removeall = function(req, res) {
  Task.remove({}, function(err, user) {
    if (err) res.send(err);
     res.json({ message: 'Tasks successfully removed' });
 });
};

//internally generated numbers for attendance records.
var getNewtaskId = function(currentID){
      var pos = Number(currentID.substring(3,10)) + 1;
      var nxt = "TSK000000";
      switch(pos.toString().length) {
          case 2:
              nxt = "TSK00000" + pos.toString();
              break;
          case 3:
              nxt = "TSK0000" + pos.toString();
              break;
          case 4:
              nxt = "TSK000" + pos.toString();
              break;
          case 5:
              nxt = "TSK00" + pos.toString();
              break;
          case 6:
              nxt = "TSK0" + pos.toString();
              break;
          case 7:
              nxt = "TSK" + pos.toString();
              break;
          default:
              nxt = nxt + pos.toString();
    }
    return nxt;
};
