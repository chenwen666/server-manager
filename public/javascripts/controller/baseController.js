/**
 * Created by chenwen on 2014/7/20.
 */
function jumpPage(id,url){
    document.getElementById(id).src = url;
}

function switchPage(width, height, url){
    var offsetWidth = document.body.offsetWidth;
    var offsetHeight = document.body.offsetHeight;
    var top = (height-offsetHeight)/2;
    var left = (offsetWidth-width)/2+100;
    window.open(url,'newwindow','height='+height+',width='+width+',top='+top+',left='+left+',toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no');
//    $('#table').datagrid("reload");
}

function openDialog(url){
    document.getElementById("diaIframe").src = url;
    $('#dialog').window('open');
}
function cancel(){
    $('#dialog').window('close');
    $("#table").datagrid("reload");
}

function toUpdate(url){
    var row = $("#table").datagrid("getSelections");
    if(row.length ==0){
        alert("请选择一行记录");
        return;
    }
    if(row.length>1){
        alert("只能选择一行记录");
        return;
    }
    row = row[0];
    var id = row.id;
    url = url+"?id="+id;
    openDialog(url);
}

function toDelete(url){
    var row = $("#table").datagrid("getSelections");
    if(row.length ==0){
        alert("你没有选择任何记录");
        return;
    }
    var photos = [];
    var array = [];
    for(var i=0;i<row.length;i++){
        array[i] = row[i].id;
        photos[i] = row[i].photo;
    }
    var length = row.length;
    if(window.confirm("你选中了"+length+"项,删除后不可恢复,确定要删除这"+length+"项吗?")){
        $.ajax({
            type : "POST",
            url : url,
            data : {
                ids : JSON.stringify(array),
                photos : JSON.stringify(photos)
            },
            success : function(){
                $("#table").datagrid("reload");
            }
        })
    }
}
