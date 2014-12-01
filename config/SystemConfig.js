/**
 * Created by ThinkPad on 14-9-10.
 */
module.exports = {
    OK : "操作成功",
    FAIL : "操作失败",
    SIGN_EXPIRE : 120000, //签名过期时间
    DEFAULT_TOKEN_EXPIRE : 24*60*60*1000,  //默认token过期时间为一天
    REDIS_EXPIRE : 24*60*60, //redis过期时间
    SIGN_ERROR : "签名错误",
    SECRET : "" ,//秘钥
 //   MONGOOSE_HOST : "mongodb://192.168.1.33:27017,192.168.1.33:27018/server?replicaSet=MF&readPreference=secondaryPreferred&&slaveOk=true",        //mongoose host
    MONGOOSE_HOST : "192.168.1.100",        //mongoose host
    REDIS_HOST : "192.168.1.100",        //redis host
    REDIS_PORT : 6379,
    MONGOOSE_DATABASE : "server",     //mongoose库名
    REDIS_EXPIRES : 1200,    //redis过期时间一天,单位秒
    DEFAULT_PAGENO: 1,  //默认页码
    DEFAULT_PAGEENTRIES: 10,    //默认一页显示记录数
    TIME_OUT : 10000,   //轮循时间 毫秒
    REDIS_ADVERT_IMAGE_KEY : "advertImage", //广告图片存放redis表名
    REDIS_REDUCE_KEY :"advertReduce" //广告图片压缩
}