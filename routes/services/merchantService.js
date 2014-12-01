/**
 * Created by ThinkPad on 14-11-24.
 */
var merchantDao = require("../dao/merchantDao");
var Code = require("../../config/Code");
var situationDao = require("../dao/situationDao");

var async = require("async");
/**
 * 不存在则添加
 * @param obj
 * @param cb
 */
module.exports.updateAndSave = function(username, pid, cb){
    async.waterfall([function(callback){
        situationDao.findOne({id:pid},null,null,null,callback)
    },function(situaction, callback){
        if(!situaction){
            return callback(null, Code.SITUATION.NOT_EXIST);
        }
        merchantDao.updateAndSave({u:username}, {p:pid}, function(err){
            callback(err, Code.OK);
        });
    }],cb)
}