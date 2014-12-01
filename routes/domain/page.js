/**
 * 分页
 * @param opts
 * @constructor
 */

var SystemConfig = require('../../config/SystemConfig');
var DEFAULT_PAGENO = SystemConfig.DEFAULT_PAGENO;
var DEFAULT_PAGEENTRIES = SystemConfig.DEFAULT_PAGEENTRIES;

var Page = function(opts) {
    if(!!opts) {
        this.pageNumber = opts.pageNumber;    //当前页
        this.pageSize = opts.pageSize;              //一页显示记录数
	    if(opts.autoCount != null && opts.autoCount != undefined && opts.autoCount != '') {  //不为空且为true
		    this.autoCount = opts.autoCount;
	    }
	    this.fields = opts.fields;  //字段列表
    }
	if(!this.pageNumber || this.pageNumber < 1) {
		this.pageNumber = DEFAULT_PAGENO;
	}
	if(!this.pageSize || this.pageSize < 1) {
		this.pageSize = DEFAULT_PAGEENTRIES;
	}
	this.rows = new Array();   //内容
	this.total = 0;         //记录总数
}

/**
 * Expose 'Entity' constructor
 */

module.exports = Page;



/**
 * 获取一页显示的记录数
 * @returns {*}
 */
Page.prototype.getpageSize = function() {
    if(!this.pageSize || this.pageSize < 1) {
        return DEFAULT_PAGEENTRIES;
    }
    return this.pageSize;
};

/**
 * 获取当前页码
 * @returns {*}
 */
Page.prototype.getPageNo = function() {
    if(!this.pageNumber || this.pageNumber  < 1) {
        this.pageNumber  = DEFAULT_PAGENO;
    }
    var totalPages = this.totalPages;
    if(totalPages && this.pageNumber  > totalPages) {
	    this.pageNumber = totalPages;
    }
    return this.pageNumber;
};

/**
 * 获取记录总数
 * @param totalElements
 */
Page.prototype.getTotal= function() {
    return this.total;
}

/**
 * 设置记录总数
 * @param total
 */
Page.prototype.setTotal= function(total) {
    this.total = total;
}

/**
 * 设置记录
 * @param rows
 */
Page.prototype.setRows = function(rows) {
    this.rows = rows;
}

/**
 * 设置总页数
 */
Page.prototype.setTotalPages= function() {
    var totalPages = 0;
    if(this.pageNumber) {
	    totalPages = this.pageNumber;
        if(totalPages < 0) {
	        totalPages = 0;
        } else if(totalPages > 0) {
	        totalPages = Math.ceil(this.total/this.pageSize);
        }
    }
    this.totalPages = totalPages;
}
