/**
 * Created by chenwen on 14-11-19.
 */

var AggregateDao = require("../lib/AggregateDao");
var MerchantModel = require("../model/MerchantModel");
var Merchant = require("../domain/Merchant");
var log = require("../util/logger");

module.exports = new (AggregateDao.extend({
    model : MerchantModel,
    methods : {
        insert : function(obj, cb){
            this.save(obj,cb);
        },
        get : function(username, cb){
            this.findOne({u:username},{a:0},null,Merchant,cb);
        },
        updateAndSave : function(conditions, options, cb){
            this.update(conditions,options,{upsert :true},cb)
        }
    }
}))();