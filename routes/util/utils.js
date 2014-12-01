/**
 * 公共方法
 * Created by chenwen on 14-9-10.
 */
/**
 * 验证必须参数 返回提示消息,如果必须参数都不为空,返回空字符串
 * @param msg
 * @param args
 */
module.exports.validateParameters = function(msg, obj){
    try{
        var args = [];
        if(!(obj instanceof Array)){
            for(var key in obj){
                if(obj[key]){
                 args.push(key);
                }
            }
        }else{
            args = obj;
        }
        var content='';
        for(var i = 0; i<args.length; i++){
            if(!msg[args[i]]){
                content +=args[i]+" ";
            }
        }
        if(content) content += " is require";
        return content;
    }catch(e){
        console.log(e.stack);
    }

}
/**
 * 将时间转换为 yyyy/mm/dd hh:mm:ss格式
 * @param date
 */
module.exports.parseTime = function(date){
    var str = "";
    if(date!="null" && date!="undefined"){
        if(typeof  date == "string") date = new Date(date);
        if(!!date){
            var year = date.getFullYear();
            var month = getFullNumber(date.getMonth());
            var day = getFullNumber(date.getDate());
            var hourse = getFullNumber(date.getHours());
            var min = getFullNumber(date.getMinutes());
            var second = getFullNumber(date.getSeconds());
            str = year+"/"+month+"/"+day+" "+hourse+":"+min+":"+second;
        }
    }
    return  str;
}
function getFullNumber(number){
    if(typeof number == "number"){
        number = number>9?number+"": "0"+number;
    }
    return number;
}
/**
 *
 * @param array   数组
 * @param proName  要判断数组中的对象的属性名
 * @param name
 */
module.exports.isExistOfArray =  function(array, proName,name){
    for(var i= 0,l=array.length;i<l;i++){
        if(!!array[i] && array[i][proName] == name){
            return true;
        }
    }
    return false;
}
/**
 * 属性继承
 * @param o
 * @param t
 */
module.exports.inherits = function(o,t){
    for(var key in t){
        o[key] = t[key];
    }
    return o;
}
/**
 * 拆解分页查询条件参数
 * @param msg
 */
module.exports.filterProperty = function(msg){
    var self = this;
    var opts = {};
    for(var pro in msg){
        if(Object.hasOwnProperty.call(msg, pro)){
            var words = pro.split("_");
            if(!!words[2] && !!msg[pro] && msg[pro]!="all"){
                if(!opts[words[2]]) opts[words[2]]= {};
            }
            if(words.length === 3){
                var sort = words[1];
                if(!!msg[pro] && msg[pro]!="all") {
                    if (sort == "LIKE") {
                        opts[words[2]] = new RegExp(msg[pro]);
                    }
                    if (sort == "LT") {
                        opts[words[2]].$lt = msg[pro];
                    }
                    if (sort == "GT") {
                        opts[words[2]].$gt = msg[pro];
                    }
                    if (sort == "LTE") {
                        opts[words[2]].$lte = msg[pro];
                    }
                    if (sort == "GTE") {
                        opts[words[2]].$gte = msg[pro];
                    }
                    if(sort == "EQ"){
                        opts[words[2]] = msg[pro];
                    }
                    if(sort == "EQI"){
                        opts[words[2]] =  +msg[pro];
                    }
                }
            }
        }
    }
    return opts;
}