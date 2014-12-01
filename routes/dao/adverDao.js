/**
 * Created by chenwen on 14-11-20.
 */


var AggregateDao = require("../lib/AggregateDao");
var AdvertModel = require("../model/AdvertModel");
var Advert = require("../domain/Advert");

module.exports = new (AggregateDao.extend({
    model : AdvertModel,
    methods : {
        findPage : function(conditions,page, cb){
            this.page(page,conditions,null,null,Advert,cb);
        }
    }
}))()