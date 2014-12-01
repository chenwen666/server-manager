/**
 * Created by chenwen on 14-11-19.
 */
var conn = require("../database/mongoose");
var mongoose = conn.mongo;
var db = conn.db;

var Schema = mongoose.Schema;

var MerchantSchema = new Schema({
    u : String,   //用户名 对应User表
    p : String // 场景ID 对应Situation表
});

var Merchant = db.model("merchant",MerchantSchema);

module.exports = Merchant;