/*
 * Created by chenwen on 14-11-7.
 */
var inherits = require("util").inherits;
var redis = require("../database/redis");
var async = require('async');
var log = require("../util/logger");
function AggregateDao(options) {

}
Object.defineProperties(AggregateDao.prototype,{
    save : {
        writable : true,
        value : function(opts,cb){
            var model = new this._model(opts);
            model.save(function(err){
                if(err) log.error("dao.save.error:"+err.stack+"\n"+JSON.stringify(opts));
                cb.apply(null,arguments);
            });
        }
    },
    /**
     * 删除
     */
    removeByKey : {
        writable : true,
        value:function(key , value, cb){
            var obj = {};
            if(!!value){
                obj[key] = value;
            }else{
                obj = key;
            }
            this._model.remove(key,cb);
        }
    },
    /**
     * 找一条记录 返回obj
     * conditions  筛选
     * fileds 要查找的字段           字符串或者对象
     * options 其他参数
     * domain  构建对象需要的类
     */
    findOne : {
        writable : true,
        value:function(conditions,fileds,options,domain, cb){
            var self = this;
            this._model.findOne(conditions,fileds,options,function(err, data){
                if(err){
                    log.error("dao.findOne.error:"+err.stack);
                    return cb(err,null);
                }
                data = self.buildObject(data, domain);
                cb(err, data);
            })
        }
    },
    /**
     * 找一条记录 返回obj
     * conditions  筛选
     * fileds 要查找的字段           字符串或者对象
     * options 其他参数
     * domain  构建对象需要的类
     */
    findOneLean : {
        writable : true,
        value:function(conditions,fileds,options,domain, cb){
            var self = this;
            this._model.findOne(conditions,fileds,options).lean(false).exec(function(err, data){
                if(err){
                    log.error("dao.save.findOneLean:"+err.stack);
                    return cb(err,null);
                }
                data = self.buildObject(data, domain);
                cb(err, data);
            })
        }
    },
    /**
     * 查询一条或者多条记录 返回包含多个对象的数组
     *conditions
     * fileds 返回的字段  obj 或者 String
     * options 其他参数,如排序 {sort:{key :1}}
     * domain  构建对象需要的类
     */
    find : {
        writable : true,
        value : function(conditions,fileds,options,domain, cb){
            var self = this;
            this._model.find(conditions,fileds,options,function(err, data){
                if(err) {
                    log.error("dao.find.error:"+err.stack);
                    return cb(err, null);
                }
                if(!data) return cb(err, []);
                if(!!domain){
                    self.forEach(data, domain);
                }
                cb(null, data);
            });
        }
    },
    /**
     * 返回子文档(子文档是个数组) 如 用户表里面有个好友列表
     *conditions
     * key 子文档的键
     * options 其他参数
     * domain  构建对象需要的类
     */
    findSingleDocumentOfList : {
        writable : true,
        value : function(conditions, key,options,domain, cb){
            var self = this;
            this._model.findOne(conditions, key,options,function(err, data){
                if(err){
                    log.error("dao.findSingleDocumentOfList.error:"+err.stack);
                    return cb(err, []);
                }
                if(!data) return cb(err,[]);
                var docs = data[key];
                if(!!docs && !!domain){
                    self.forEach(docs, domain);
                }
                cb(null, docs);
            })
        }
    },
    /**
     * 返回子文档(子文档是个对象)
     *conditions
     * key 子文档的键
     * options 其他参数
     * domain  构建对象需要的类
     */
    findSingleField : {
        writable: true,
        value : function(conditions, key, options, cb){
            this._model.findOne(conditions,key,options,function(err, data){
                if(err){
                    log.error("dao.findSingleField.error:"+err.stack);
                    return cb(err,null);
                }
                if(!data) return cb(err, null);
                cb(null, data[key]);
            })
        }
    },
    remove : {
        writable: true,
        value : function(conditions, cb){
            this._model.remove(conditions, function(err){
                if(err){
                    log.error("dao.remove.error:"+err.stack);
                }
                cb(err);
            });
        }
    },
    /**
     * 构建多个对象
     * array 原数组
     * domain 构建对象的类
     */
    forEach : {
        value : function(array,domain){
            for(var i = 0,l = array.length; i < l; i++){
                array[i] = this.buildObject(array[i],domain)
            }
        }
    },
    /**
     * 查询并修改
     * conditions 查询条件
     * update 更新内容
     * options 其他参数 如{select:{key:1}}
     */
    findOneAndUpdate : {
        writable: true,
        value : function(conditions, update, options, cb){
            if(!cb) cb = options;
            this._model.findOneAndUpdate(conditions, update, options, function(err){
                if(err){
                    log.error("dao.findOneAndUpdate.error:"+err.stack);
                }
                cb.apply(null,arguments);
            });
        }
    },
    /**
     * 修改
     * conditions 条件
     * update 更新内容
     * options 其他参数
     */
    update : {
        writable : true,
        value : function(conditions, update, options, cb){
            if(!cb) cb = options;
            this._model.update(conditions, update, options, function(err){
                if(err){
                    log.error("dao.update.error:"+err.stack);
                }
                cb.apply(null,arguments);
            });
        }
    },
    buildObject : {
        writable : true,
        value : function(data, domain){
            if(!data) return;
            if(!domain) return data;
            var d = new domain();
            d.buildFormDb(data);
            return d;
        }
    },
    page : {
        writable: true,
        value : function(page, conditions,fields,sortsArgs,Domain,cb){
            var self = this;
            async.parallel([function(callback){
                self._model.find(conditions,{id:1},function(err,data){
                    if(err) return callback(err);
                    if(!!data){
                        page.setTotal(data.length);
                    }
                    callback(null);
                });
            },function(callback){
                var query = self._model.find(conditions,fields);
                query.sort(sortsArgs);
                query.skip((page.pageNumber-1)*page.pageSize).limit(page.pageSize);
                query.exec(function(err, list){
                    if(err) return callback(err);
                    if(!!list && !!Domain){
                        for(var i= 0,l=list.length;i<l;i++){
                            list[i] = self.buildObject(list[i],Domain);
                        }
                    }
                    page.setRows(list);
                    callback(null, page);
                })
            }],function(err){
                cb(err, page);
            });
        }
    },
    hset : {
        writable:false,
        value : function(key,pro,value, cb){
            redis.hset(key,pro, value, function(err){
                if(err){
                    log.error("aggregateDao.hset.error:"+err.stack);
                }
                cb.apply(null,arguments);
            });
        }
    },
    hget : {
        writable:false,
        value : function(key,pro, cb){
            redis.hget(key,pro, function(err,data){
                if(err){
                    log.error("aggregateDao.hget.error:"+err.stack);
                }
                cb(err, data);
            });
        }
    },
    hdel : {
        value : function(key, pro, cb){
            redis.hdel(key, pro, function(err){
                if(err){
                    log.error("aggregateDao.hdel.error:"+err.stack);
                }
                cb.apply(null, arguments);
            });
        }
    }
})

AggregateDao.extend = function(option){
    option = option || {};
    var Class = function(data){
        AggregateDao.call(this,data);
        this.super = AggregateDao.prototype;   //方法重载
        this.super._model = this._model;
    }

    var model = option.model;
    inherits(Class, AggregateDao);  //继承

    Object.defineProperty(Class.prototype,"_model",{
        get : function(){
            return model;
        }
    })
    option.methods = option.methods || {};
    for(var key in option.methods){
        Class.prototype[key] = option.methods[key];
    }
    return Class;
}

module.exports = AggregateDao;