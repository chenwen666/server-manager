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

router.post("/update/content",setContent);

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

function add(req, res, next){
    try {
        if(!req.session.user) return res.redirect("/");
        var username = req.session.user.u;
        var tmpPath = req.files.file.path;
        var fileName = requestUtils.generateId(tmpPath);
        var data = fs.readFileSync(tmpPath);
        var buff = new Buffer(data,'base64');
        fs.unlinkSync(tmpPath);
        advertService.save({
            u : username,
            c : req.body.content,
            p : fileName,
            d : buff
        },function(err){
            if(err) return next(err);
            res.end();
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
        var username = req.session.user.u;
        var tmpPath = req.files.file.path;
        var oldpath = req.body.oldpath.split(".")[0];
        var id = req.body._id;
        var data = fs.readFileSync(tmpPath);
        var buff=new Buffer(data,'base64');
        var obj = {
            c : req.body.content,
            d : data
        }
        advertService.update(id,oldpath,obj, function(err){
            res.end();
        });
    }catch(err){
        log.error("保存广告错误:"+err.stack);
        res.render("addAdvert",{
            message : "系统错误"
        });
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
module.exports = router;
