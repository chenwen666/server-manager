var express = require('express');
var router = express.Router();

var userService = require("./services/userService");
var advertService = require("./services/adverService");

var requestUtils = require("./util/requestUtils");
var SystemConfig = require("../config/SystemConfig");
var log = require("./util/logger");
var Code = require("../config/Code");
var async = require("async");
var fs = require("fs");
var propertyFilter = require("./lib/PropertyFilter");

var User = require("./domain/User");

//var im = require("imagemagick");
var sharp = require("sharp");

/* GET home page. */

router.use(function(req, res, next){
    var user = req.session.user;
    if(!user) return res.redirect("/");
    var tp = user.tp;
    if(tp != User.MERCHANT_AUTHORITY) return res.redirect("/");
    next();
});

router.get('/list', toList);  //广告列表

router.post("/list",propertyFilter,list);

router.get("/add",toAdd);

router.post("/add", add);

router.get("/update",toUpdate);

router.post("/update",update);

router.post("/delete", del);

router.get("/photo/:path",getPhoto);

function getPhoto(req, res, next){
    try{
        var path = req.params.path;
        advertService.getPhoto(path,function(err,data){
            if(err) return next(err);
            res.writeHead(200, {"Content-Type": "image/png"});
            res.end(data,'binary');
        })
    }catch(err){
        log.error("advert.getPhoto.error:"+err.stack);
        next(err);
    }
}
function toList(req, res, next){
    res.render('advertList');
}

function list(req, res, next){
    try{
        var username = req.session.user.u;
        var msg = req.body;
        msg.username = username
        advertService.findPage(msg, function(err,page){
            res.send(page);
        })
    }catch(err){
        log.error(err.stack);
        next(err);
    }
}
function toAdd(req, res, next){
    res.render("addAdvert",{
        message : ""
    });
}
function buffers(path, req, cb){
    async.parallel([function(callback){//原图
        getPhotoBuffer(path,req.body,callback);
    },function(callback){ //中图
        sharp(path).extract(req.body.y1,req.body.x1,req.body.w,req.body.h).resize(256,256).toBuffer(function(err, buffer){//exrtact 参数 top left width height
            callback(err, buffer);
        })
    },function(callback){ //小图
        sharp(path).extract(req.body.y1,req.body.x1,req.body.w,req.body.h).resize(64,64).toBuffer(function(err, buffer){
            callback(err, buffer);
        })
    }],cb)
}
/**
 * 添加广告
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function add(req, res, next){
    try {
        if(!req.session.user) return res.redirect("/");
        var username = req.session.user.u;
        var tmpPath = process.cwd()+"/"+req.files.file.path;
        var suffix = tmpPath.split(".")[1];
        var fileName = requestUtils.generateId(tmpPath);
        async.waterfall([function(callback){
            buffers(tmpPath, req, callback);
        },function(buffers,callback){
            fs.unlinkSync(tmpPath);
            advertService.save({
                u : username,
                c : req.body.content,
                p : fileName, //hash
                pd : buffers[2],    //小图
                zd : buffers[1],
                urd : buffers[0]     //yuantu
            },callback)
        }],function(err,code){
            if(err){
                log.error("adverRoute.add.error:"+err.stack);
                return next(err);
            }
            var message = SystemConfig.OK;
            if(code!=Code.OK){
                message = "商家不存在";
            }
            res.render("addAdvert",{
                message : message
            });
        })
    }catch(err){
        log.error("保存广告错误:"+err.stack);
        res.render("addAdvert",{
            message : "系统错误"
        });
    }
}
function update(req, res, next){
    try {
        if(!req.session.user) return res.redirect("/");
        var tmpPath;
        if(!!req.files.file.path.split(".")[1]){
            tmpPath = process.cwd()+"/"+req.files.file.path;
        }
        var id = req.body.id;
        var photoHash = req.body.p;
        var successCallback = function(message){
            res.render("updateAdvert",{
                message : message,
                advert : {
                    id : id,
                    content : req.body.content,
                    photo : photoHash
                }
            });
        }
        async.waterfall([function(callback){
            if(!!tmpPath){  //如果有文件提交
                buffers(tmpPath, req, callback);
            }else{
                callback(null, null);
            }
        },function(buffers,callback){
            fs.unlinkSync(process.cwd()+"/"+req.files.file.path);
            if(!!tmpPath){  //如果有文件提交
                advertService.update(id,{
                    c : req.body.content,
                    p : photoHash, //hash
                    pd : buffers[2],    //小图
                    zd : buffers[1],
                    urd : buffers[0]     //yuantu
                },callback)
            }else{ //只修改内容
                advertService.setContent(id,{
                    c : req.body.content
                },function(err){
                    if(err){
                        log.error("adverRoute.add.error:"+err.stack);
                        return next(err);
                    }
                    successCallback(SystemConfig.OK);
                });
            }
        }],function(err,code){
            if(err){
                log.error("adverRoute.add.error:"+err.stack);
                return next(err);
            }
            successCallback(SystemConfig.OK);
        })
    }catch(err){
        log.error("修改广告错误:"+err.stack);
        successCallback(SystemConfig.FAIL);
    }

}

function toUpdate(req, res, next){
    var id = req.query.id;
    advertService.get(id,function(err, data){
        if(err){
            return res.render("error",{
                message : SystemConfig.FAIL
            });
        }
        res.render("updateAdvert",{
            advert : data,
            message : ""
        });
    })
}
function setContent(req, res, next){
    try{
        var content = req.body.content;
        var id = req.body._id;
        advertService.setContent(id,{
            c : content
        },function(err){
            res.end();
        })
    }catch(err){
        log.error(err);
        next(err);
    }
}
/**
 * 删除
 * @param req
 * @param res
 * @param next
 */
function del(req, res, next){
    try{
        var ids = JSON.parse(req.body.ids);
        var photos = JSON.parse(req.body.photos);
        advertService.del(ids,photos, function(err){
            if(err){
                log.error(err.stack);
            }
            res.end();
        })
    }catch(err){
        log.error(err.stack);
        next(err);
    }
}

function getReducePath(username,suffix){
    return "uploads/"+username+new Date().getTime()+"."+suffix;
}

function getPhotoBuffer(path, body , cb){  //exrtact 参数 top left width height
    sharp(path).extract(body.y1,body.x1,body.w,body.h).toBuffer(function(err,buffer){
        cb(err, buffer);
    })
}
module.exports = router;