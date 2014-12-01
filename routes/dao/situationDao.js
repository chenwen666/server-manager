/**
 * Created by chenwen on 14-11-24.
 */
var Situation = require("../model/SituationModel");
var AggregateDao = require("../lib/AggregateDao");
var async = require("async");

var situationDao = {};

module.exports =new (AggregateDao.extend({
    model : Situation,
    methods : {

    }
}))();