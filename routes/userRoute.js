var express = require('express');
var router = express.Router();

var userService = require("./services/userService");
var merchantService = require("./services/merchantService");
var User = require("./domain/User");
var auth = require("./auth/auth");
var async = require("async");
var log = require("./util/logger");
var propertyFilter = require("./lib/PropertyFilter");
var Code = require("../config/Code");
/* GET home page. */
router.get('/', toLogin);  //去登录

router.post("/",postLogin);  //提交登陆

router.use("/user",auth.authority(User.MANAGER_AUTHORITY));

router.get("/user/list",toList);
router.post("/user/list",propertyFilter, list);
router.get("/user/update/type",toAuthority);
router.post("/user/update/type",authority);



function toLogin(req, res, next){
    res.render('login', { message: "" });
}
function postLogin(req, res, next){
    userService.login(req.body,callback);
    function callback(err, user){
        if(err) return res.render("login",{
            message : "系统错误"
        });
        if(!user) return res.render("login",{
            message : "用户名或密码不正确"
        })
        var type = user.type || User.USER_AUTHORITY;
        req.session.user = {
            u : req.body.username,
            p : req.body.password,
            tp : type
        }
        if(type === User.USER_AUTHORITY){
            return res.render("login",{
                message : "你没有权限"
            });
        }
        res.render("index",{
            username : req.body.username,
            type : type
        });
    }
}
function toList(req, res){
    res.render("userList");
}
function list(req, res, next){
    try{
        userService.findPage(req.body, function(err,page){
            res.send(page);
        })
    }catch(err){
        next(err);
        log.error(err.stack);
    }
}
function toAuthority(req, res, next){
    try{
        var tp = req.session.user.tp;
        var id = req.query.id;
        userService.get(id, function(err, user){
            if(err) return next(err);
            res.render("setAuthority",{
                message : "",
                type : tp,
                targetType : user.type,
                username : user.username
            });
        })
    }catch(err){
        log.error(err.stack);
        next(err);
    }
}

function authority(req, res, next){
    try{
        var username = req.body.username;
        var type = req.body.type;
        var targetType = req.body.targetType;
        var tp = req.session.user.tp;
        if(targetType>=tp){
            render("你不能修改和你同级以上的用户权限");
            return;
        }
        async.waterfall([function(callback){
            merchantService.updateAndSave(username,req.body.pid,callback);
        },function(code, callback){
            console.log("code:"+code);
            if(code == Code.OK){
                userService.update(username,{tp:+type},function(err){
                    callback(err, Code.OK);
                })
            }else{
                callback(null, code);
            }
        }],function(err, code){
            if(err) return next(err);
            if(code == Code.OK){
                render("操作成功");
            }else{
                render("场景不存在,请输入正确有场景ID");
            }
        })
        function render(msg){
            res.render("setAuthority",{
                username : username,
                type : type,
                targetType : targetType,
                message : msg
            });
        }
    }catch(err){
        log.error(err.stack);
        next(err);
    }
}
module.exports = router;
