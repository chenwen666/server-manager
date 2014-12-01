/**
 * Created by chenwen on 14-11-24.
 */
/**
 * Created by chenwen on 14-9-17.
 */
var situationDao = require("../dao/situationDao");
var SystemConfig = require("../../config/SystemConfig");

var aysnc = require("async");

module.exports.findById = function(id, cb){
    situationDao.findOne({id:id},{id:1},null,null,cb);
}