var Code = require("../../config/Code");
var requestUtils = require("../util/requestUtils");
var userService = require("../services/userService");
var log = require("../util/logger");
var utils = require("../util/utils");
/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
module.exports.authority = function(authority){
    return function(req, res, next){
        var user = req.session.user;
        if (!user) return res.redirect("/");
        var au= user.tp || 0;
        if(au < authority) return res.redirect("/");
        next();
    }
}/**
 * Created by ThinkPad on 14-11-24.
 */
