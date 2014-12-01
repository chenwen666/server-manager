/**
 * Created by chenwen on 14-11-20.
 */

var AggregateDao = require("../lib/AggregateDao");
var UserModel = require("../model/UserModel");
var User = require("../domain/User");

module.exports = new (AggregateDao.extend({
    model : UserModel,
    methods : {
        login : function(username, password,cb){
            this.findOne({u:username,p:password},{tp:1},null,User,cb);
        },
        findPage : function(conditions,page, cb){
            this.page(page,conditions,null,null,User,cb);
        }
    }
}))()