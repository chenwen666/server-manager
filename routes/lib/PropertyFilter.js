/**
 * 模糊查询过滤
 * Created by chenwen on 14-11-26.
 */
module.exports = function(req, res, next){
    try{
        var msg =  {};
        if(req.url =="GET"){
            msg = req.query;
        }else{
            msg = req.body;
        }
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
        msg.queryParams = opts;
        next();
    }catch(err){
        console.log(err);
        next(err);
    }
}