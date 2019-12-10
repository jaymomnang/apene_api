'use strict';
var mongoose = require('mongoose'),
  crypt = require('crypto'),
  User = mongoose.model('Users');
const secret = '#M0r1ng4C0r3';

var getHash = function(pwd){
  const hash = crypt.createHmac('sha256', secret)
                     .update(pwd)
                     .digest('hex');
  return hash;
}


exports.get_users = function(req, res) {
  User.find({}, 'email firstname lastname role isActive', function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

exports.add_new_user = function(req, res) {
  var new_user = new User(req.body);
  var pwd = getHash(new_user.pwd);
  new_user.pwd = pwd;
  new_user.save(function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

exports.authenticate = function(req, res) {
  var password = getHash(req.params.pwd);
  User.find({email: req.params.email, pwd: password}, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

exports.update_user_prof = function(req, res) {
  User.findOneAndUpdate({email: req.params.email}, req.body, {new: true}, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

exports.delete_user = function(req, res) {
  User.findOneAndUpdate({email: req.params.email}, req.body, {new: true}, function(err, user) {
    if (err)
      res.send(err);
      res.json({message: 'User deactivated successfully'});
  });
};

exports.removeUser = function(req, res) {
  User.remove({email: req.params.email}, function(err, user) {
    if (err)
     res.send(err);
     res.json({ message: 'User successfully removed' });
 });
};
