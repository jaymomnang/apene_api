'use strict';
var mongoose = require('mongoose'),
  AppSetting = mongoose.model('AppSetting');

exports.get_settings = function(req, res) {
  AppSetting.find({}, function(err, appSetting) {
    if (err) res.send(err);
    res.json(appSetting);
  });
};

exports.add_setting = function(req, res) {
  var new_setting = new AppSetting(req.body);
  new_setting.save(function(err, appSetting) {
    if (err) res.send(err);
    res.json(appSetting);
  });
};

exports.update_setting = function(req, res) {
  AppSetting.findOneAndUpdate({_settingId: req.params.settingId}, req.body, {new: true}, function(err, appSetting) {
    if (err) res.send(err);
    res.json(appSetting);
  });
};

exports.delete_setting = function(req, res) {
  AppSetting.findOneAndUpdate({_settingId: req.params.settingId}, req.body, {new: true}, function(err, appSetting) {
    if (err)
      res.send(err);
      res.json({message: 'User deactivated successfully'});
  });
};

exports.remove_setting = function(req, res) {
  AppSetting.remove({_settingId: req.params.settingId}, function(err, appSetting) {
    if (err)
     res.send(err);
     res.json({ message: 'User successfully removed' });
 });
};
