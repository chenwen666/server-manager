/**
 *
 * HTML5 Image uploader with Jcrop
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2012, Script Tutorials
 * http://www.script-tutorials.com/
 */

// convert bytes into friendly format
var number = 0; //缩放基数
var reduceNumber = 0;
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

// check for selected crop region
function checkForm() {
    if (parseInt($('#w').val())) return true;
    $('#error').html('请选择图片').show();
    return false;
};

// update info by cropping (onChange and onSelect events handler)
function updateInfo(e) {
    $('#x1').val(Math.ceil(e.x*number));
    $('#y1').val(Math.ceil(e.y*number));
    $('#x2').val(Math.ceil(e.x2*number));
    $('#y2').val(Math.ceil(e.y2*number));
    $('#w').val(Math.ceil(e.w*number));
    $('#h').val(Math.ceil(e.h*number));
    $("#reduce").css({
//        width: Math.round(e.w*number) + 'px',
//        height: Math.round(e.h*number) + 'px',
        marginLeft: '-' + Math.round(e.x*number/reduceNumber) + 'px',
        marginTop: '-' + Math.round(e.y*number/reduceNumber) + 'px'
    });
};

// clear info by cropping (onRelease event handler)
function clearInfo() {
    $('.info #w').val('');
    $('.info #h').val('');
};
var jcrop_api, boundx, boundy;
function fileSelectHandler() {
    $("#preview").removeClass("preview");
    // get selected file
    var oFile = $('#file')[0].files[0];
//    delete  $('#image_file')[0].files[0];
    // hide all errors
    $('.error').hide();
    // check for image type (jpg and png are allowed)
    var rFilter = /^(image\/jpeg|image\/png)$/i;
    if (! rFilter.test(oFile.type)) {
        $('.error').html('格式不支持').show();
        return;
    }

    // check for file size
    if (oFile.size > 400 * 1024) {
        $('.error').html('图片不能超过400kb,请重新选择图片').show();
        return;
    }

    // preview element
    var oImage = document.getElementById('preview');
    var rImage = document.getElementById("reduce");
    // prepare HTML5 FileReader
    var oReader = new FileReader();
    oReader.onload = function(e) {
        // e.target.result contains the DataURL which we can use as a source of the image
        oImage.src = e.target.result;
        oImage.onload = function () { // onload event handler
            width = oImage.width;
            height = oImage.height;
            if(width<512 || height<512){
                oImage.src = "";
                $('.error').html('图片最小尺寸为512*512,请选择合格的图片').show();
                return;
            }
            if(!!jcrop_api){
                jcrop_api.setImage(e.target.result)
            }
            rImage.src = e.target.result;
            // display step 2
            $('.step2').fadeIn(500);
            $("#preview").css("width",400);
            $("#reduce").css("width",Math.ceil(width/2.84444));
            number = width/oImage.width;
            reduceNumber = width/rImage.width;
            var selectWidth = 512/number;
            var left = (oImage.width-selectWidth)/2;
            var top = (oImage.height-selectWidth)/2;

            // display some basic image info
            var sResultFileSize = bytesToSize(oFile.size);
            $('#filesize').val(sResultFileSize);
//            $('#filetype').val(oFile.type);
//            $('#filedim').val(oImage.naturalWidth + ' x ' + oImage.naturalHeight);

            // Create variables (in this scope) to hold the Jcrop API and image size


            // destroy Jcrop if it is existed
            if (typeof jcrop_api != 'undefined')
                jcrop_api.destroy();

            // initialize Jcrop
            $('#preview').Jcrop({
                minSize: [32, 32], // min crop size
                allowSelect : false,
                aspectRatio : 1, // keep aspect ratio 1:1
                bgFade: true, // use fade effect
                boxWidth:400,
                bgOpacity: .3, // fade opacity
                onChange: updateInfo,
                onSelect: updateInfo,
                onRelease: clearInfo,
                allowResize : false,
                setSelect : [left,top,512/number+left,512/number+top]

            }, function(){
                // use the Jcrop API to get the real image size
                var bounds = this.getBounds();
                boundx = bounds[0];
                boundy = bounds[1];

                // Store the Jcrop API in the jcrop_api variable
                jcrop_api = this;
            });
        };
    };

    // read selected file as DataURL
    oReader.readAsDataURL(oFile);
}

