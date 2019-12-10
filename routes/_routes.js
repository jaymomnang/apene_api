'use strict';
module.exports = function(app) {
  var todoList = require('../controllers/todoListController');
  var user = require('../controllers/userController');
  var course = require('../controllers/CoursesController');
  var grade = require('../controllers/GradesController');
  var attendance = require('../controllers/AttendanceController');
  var settings = require('../controllers/AppSettingController');

  // todoList Routes
  app.route('/tasks')
    .get(todoList.list_all_tasks)
    .post(todoList.create_task);

  app.route('/tasks/:taskId')
    .get(todoList.get_task)
    .put(todoList.update_task)
    .delete(todoList.remove_task);

  app.route('/task/removeall')
    .delete(todoList.removeall);

  // Users Routes
  app.route('/login')
    .get(user.get_users)
    .post(user.add_new_user);

  app.route('/login/:email/:pwd')
    .get(user.authenticate)
    .put(user.update_user_prof)
    .delete(user.delete_user);

  app.route('/login/:email')
    .delete(user.removeUser);

  // Courses Routes
  app.route('/course')
    .get(course.list_all_courses)
    .post(course.create_course);

  app.route('/course/:course')
    .get(course.get_course)
    .put(course.update_course)
    .delete(course.delete_course);

  app.route('/course/:Id/:true')
    .delete(course.remove_course);

  // Grades Routes
  app.route('/grades')
    .get(grade.list_all_grades)
    .post(grade.create_grade);

  app.route('/grade/:grade')
    .get(grade.get_grade)
    .put(grade.update_grade)
    .delete(grade.delete_grade);

  // Attendance Routes
  app.route('/attendance')
    .get(attendance.list_all_attendance)
    .post(attendance.add_attendance);

  app.route('/attendance/getlast')
    .get(attendance.get_last_attendance);

  app.route('/attendance/:att_id')
    .delete(attendance.remove_attendance);

  app.route('/attendance/:email/:att_id')
      .get(attendance.get_attendance)
      .put(attendance.update_attendance)
      .delete(attendance.delete_attendance);

  app.route('/attendance/:email')
    .get(attendance.get_user_attendance);

  app.route('/settings')
    .get(settings.get_settings)
    .post(settings.add_setting);

  app.route('/settings/:settingId')
    .put(settings.update_setting)
    .delete(settings.remove_setting);


};
