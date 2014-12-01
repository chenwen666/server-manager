/**
 * Created by chenwen on 14-11-19.
 */
function Merchant(){

}
Merchant.prototype.buildFormDb = function(opts){
    if(!!opts){
        this.username = opts.u;
        this.pid = opts.p;
    }
}
module.exports = Merchant