/**
 * Created by ThinkPad on 14-11-19.
 */
function Advert(){

}
Advert.prototype.buildFormDb = function(opts){
    if(!!opts){
        this.id = opts._id;
        this.username = opts.u
        this.content = opts.c;
        this.photo = opts.p;
        this.pid = opts.pid;
    }
}
module.exports = Advert;