/**
 * 登录/鉴权日志
 * Created by chenwen on 14-11-18
 */
var conn = require("../database/mongoose");
var mongoose = conn.mongo;
var db = conn.db;

var Schema = mongoose.Schema;

var AdvertSchema = new Schema({
    "u" : String, //用户名
    "c": String, //string 内容
    "p": String, // 图片地焉
    "pid" : String  //场景ID
});
var AdverModel = db.model("advert",AdvertSchema);

module.exports = AdverModel;
