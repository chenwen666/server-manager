/**
 * Created by chenwen on 14-9-10.
 */

var conn = require("../database/mongoose.js");
var mongoose = conn.mongo;
var db = conn.db;

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    u : String,   //用户名
    p : String,   //密码
    g : {type:Number,default:0},   //性别
    b : String,     //生日
    im : String, //头像
    n : String,   //昵称
    m : String,  //手机
    em : String, //邮箱
    tp : {type:Number,default:0}, //类型 0普通用户 1 商家, 2 管理员  3超级管理员
    a : String, //地址
    re : String, //注册时间
    rt : {type:String,default:""},   //更新token
    t : {},          //token
    lt : Date,     //最后更新时间
    f : [{
        u: String ,//用户名
        at : String //添加时间
    }],         //好友列表
    l : [{
        u : String,  //用户名
        t : String,  //时间
        m : String,   //附加消息
        tp : Number   //类型
    }],        //申请列表
    h : [{
        u : String, // 用户名
        t : String,  //时间
        s : Number,//状态
        tp : Number, //类型
        li : String  //定位id
    }],        //处理结果列表
    dt : String,  //设备类型
    ms : [{
        u : String,
        m : String,
        t : String
    }],       //消息列表
    ia :{type:Boolean,default:false} //是否激活
});

var User = db.model("user",UserSchema);

module.exports = User;