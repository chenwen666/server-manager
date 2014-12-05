/**
 * Created by chenwen on 14-11-20.
 */
var advertDao = require("../dao/adverDao");
var Advert = require("../domain/Advert");
var merchantDao = require("../dao/merchantDao");
var Code = require("../../config/Code");
var util = require("../util/utils");
var async = require("async");

var SystemConfig = require("../../config/SystemConfig");

var Page = require("../domain/page");
/**
 * 分页
 * @param msg
 * @param cb
 */
module.exports.findPage = function(msg, cb){
    var conditions = msg.queryParams;
    conditions.u = msg.username;
    msg.pageSize = msg.rows;
    msg.pageNumber = msg.page;
    var page = new Page(msg);
    advertDao.findPage(conditions,page, cb);
}
/**
 * 保存广告
 * @param obj
 * @param cb
 */
module.exports.save = function(obj ,cb){
    async.waterfall([function(callback){
        merchantDao.get(obj.u,callback);
    },function(merchant, callback){
        if(!merchant) return callback(null,Code.MERCHANT.NOT_EXIST);
        obj.pid = merchant.pid;
        advertDao.save(obj, back);
        function back(err){
            if(err){
                return callback(err,Code.SYSTEM_ERROR);
            }
            callback(null, Code.OK);
        }
    },function(code,callback){
        if(code != Code.OK) return callback(null, code);
        redisSetPhotoData(obj, callback);
    }],cb)
}

function redisSetPhotoData(obj, cb){
    async.parallel([function(callback){
        advertDao.hset(SystemConfig.REDIS_REDUCE_KEY,obj.p,obj.pd, function(err){
            if(err){
                log.error("advertService.redisSetPhotoData.error:"+err.stack);
                return callback(err,Code.SYSTEM_ERROR);
            }
            callback(null,Code.OK);
        });
    },function(callback){
        advertDao.hset(SystemConfig.REDIS_ADVERT_IMAGE_KEY,obj.p,obj.urd, function(err){
            if(err) {
                log.error("advertService.redisSetPhotoData.error:"+err.stack);
                return callback(err,Code.SYSTEM_ERROR);
            }
            callback(null,Code.OK);
        });
    },function(callback){
        advertDao.hset(SystemConfig.REDIS_MIDDLE_KEY,obj.p,obj.zd, function(err){
            if(err) {
                log.error("advertService.redisSetPhotoData.error:"+err.stack);
                return callback(err,Code.SYSTEM_ERROR);
            }
            callback(null,Code.OK);
        });
    }],function(err){
        if(err) return cb(err, Code.SYSTEM_ERROR);
        cb(err, Code.OK);
    })
}
/**
 * 根据ID获取广告
 * @param id
 * @param cb
 */
module.exports.get = function(id, cb){
    advertDao.findOne({_id:id},null,null,Advert,cb);
}
/**
 * 修改
 * @param id
 * @param obj
 * @param cb
 */
module.exports.update = function(id,obj,cb){
    async.parallel([function(callback){
        advertDao.update({_id:id},obj,callback);
    },function(callback){
        redisSetPhotoData(obj, callback)
    }],cb)
}
/**
 * 修改内容
 * @param id
 * @param obj
 * @param cb
 */
module.exports.setContent = function(id, obj, cb){
    advertDao.update({_id:id},obj,cb);
}
/**
 * 获取图片数据
 * @param path
 * @param cb
 */
module.exports.getPhoto = function(path, cb){
    advertDao.hget(SystemConfig.REDIS_ADVERT_IMAGE_KEY,path,cb);
}

module.exports.del = function(ids,photos, cb){
    var conditions = {"_id":{"$in":ids}};
    async.parallel([function(callback){
        advertDao.remove(conditions, callback);
    },function(callback){
        for(var i= 0,l=photos.length;i<l;i++){
            advertDao.hdel(SystemConfig.REDIS_ADVERT_IMAGE_KEY,photos[i],function(err){//删除原图
                if(err) log.error("advertService.del.err:"+err.stack);
            })
            advertDao.hdel(SystemConfig.REDIS_MIDDLE_KEY,photos[i],function(err){ //删除中图
                if(err) log.error("advertService.del.err:"+err.stack);
            })
            advertDao.hdel(SystemConfig.REDIS_REDUCE_KEY,photos[i],function(err){ //删除小图
                if(err) log.error("advertService.del.err:"+err.stack);
            })
        }
        callback(null);
    }],cb)
}