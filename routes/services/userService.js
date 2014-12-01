/**
 * Created by chenwen on 14-11-20.
 */
var userDao = require("../dao/userDao");
var util = require("../util/utils");
var Page = require("../domain/page");
var User = require("../domain/User");
/**
 * 登录
 * @param msg
 * @param cb
 */
module.exports.login = function(msg, cb){
    var username = msg.username;
    var password = msg.password;
    userDao.login(username, password, cb);
}
module.exports.findPage = function(msg,cb){
    var conditions = msg.queryParams;
    msg.pageSize = msg.rows;
    msg.pageNumber = msg.page;
    var page = new Page(msg);
    userDao.findPage(conditions,page, cb);
}
/**
 *
 * @param id
 * @param cb
 */
module.exports.get = function(id, cb){
   userDao.findOne({_id:id},null,null,User,cb);
}
/**
 * 根据用户名修改
 * @param username
 * @param obj
 * @param cb
 */
module.exports.update = function(username, obj, cb){
    userDao.update({u:username},obj, cb);
}