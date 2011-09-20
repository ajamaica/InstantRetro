var huge = true;

var showApply = function (path)
{
    if (huge) {
        $('*').removeClass('big');
        $('#content article').hide();
        var section = $('#uploadForm').parent().parent().parent().parent('section');
        section.slideUp('slow',function(){
        });
        
        var image = new Image();
        image.src = path;
		
        image.onload = function () {
            this.onload=null;
            var img = $(this).addClass('theImage').hide().data('vintageSource',this.src);
			$(this).addClass('theImage').attr('id','theImage')
			
            var height = this.height - 441 + 120;
            
            section.empty();

            $('body').css('background-position','50% ' + height + 'px');

            section.append(img);
            img.fadeIn('slow');
            var randomnumber=Math.floor(Math.random()*101);
            
            $.get('/js/controls.html?'+randomnumber, function (r) {
                section.append(r);
                section.slideDown('slow');
            });
        }
        huge = false;
    }
};

$("#theImage").load(function(){
	alert();
	nude.load('theImage');
	nude.scan(function(result){ alert();
	 
  	});
})

var vintageDefaults = {
    vignette: {black:0,white:0},
    noise: false,
    screen: false,
    desaturate: false,
    allowMultiEffect: true,
    mime: 'image/jpeg',
    viewFinder: false,
    curves: false,
    blur: false,
    callback: function () {
        $('#saveImage').removeClass('disabled');
    }
};

var vintage = function (el, value) {
	
    if (el.is('.vignette-dark')) {
           vintageDefaults.vignette.black = value/100 || 0;
    }
    else if (el.is('.vignette-light')) {
           vintageDefaults.vignette.white = value/100 || 0;
    }
    else if (el.is('.curves')) {
        vintageDefaults.curves = (vintageDefaults.curves === false) ? true : false;
    }
    else if (el.is('.eff')) {
		
		if((vintageDefaults.viewFinder === false)){
			vintageDefaults.viewFinder=''+el.attr('rel');
		}else{
			if(vintageDefaults.viewFinder===''+el.attr('rel')){
				vintageDefaults.viewFinder=false;
			}else{
				vintageDefaults.viewFinder=''+el.attr('rel');
				$('.eff').removeClass('on').addClass('off');
				el.removeClass('off').addClass('on');
				vintage($(this));
			}
		}
    
	}else if (el.is('.screenlayer')) {
		vintageDefaults.screen = (vintageDefaults.screen === false) ? {red: 227,green: 12,blue: 169,strength: 0.15} : false;
    }
	else if (el.is('.desaturate')) {
        vintageDefaults.desaturate = value/100 || false;
    } else if (el.is('.blur')) {
        vintageDefaults.blur = (vintageDefaults.blur === false) ? 1 : false;
    }
    var img = $('.theImage');
    img.vintage(vintageDefaults);
};

var saveImage = function (hash,obj) {
    obj.addClass('disabled').text('Saving...');

    var public = 0;
    if ($('.switch.public').is('.on')) {
        public = 1;
    }
    
    $.ajax({
        type: 'POST',
        url: '/save/',
        dataType: 'json',
        cache: false,
        data: {
			privacy: $('input:checkbox:checked').val(),
			title: $('#label').val(),
            filename: tmpFile,
            hash: hash,
            imageData: $('.theImage').attr('src'),
            public: public
        },
        error: function () {
            alert('An error occured. Pleas try again.');
            obj.removeClass('disabled').text('Save image');
        },
        success: function (response) {
            woopraTracker.pushEvent({name:'Photo Save', file: response.key});
			var key=response.key;
			if (Modernizr.localstorage) {
				var value=new Array();
				if(localStorage.getItem("photos_instant")){
					value= JSON.parse(localStorage.getItem("photos_instant"));
				}
				value.push(key);
				localStorage.setItem("photos_instant", JSON.stringify(value));
			}
			if(FB.getSession() != null) {
                var body = 'This is my latest Photo made by Instant Photo. Make your own!';
          			if($('#label').val()!=''){
          				body=$('#label').val();
          			}
          			FB.init({appId: '192870917425715', status: true, cookie: true,xfbml: true});
          			FB.api('/me/feed', 'post', { message: body, link:'http://www.instantretro.com/view/'+key, picture:'http://www.instantretro.com/thumb/'+key ,name: 'My vintage Photo' });
            }
            window.location = "/view/"+key;
        }
        
    });
}
$('.downImage').live('click', function (e) {
	window.open($('.sig').attr('href'));
});

var tmpFile;

$(function () {
    
    
      $('img.pics-home').imgscale({ 
            parent : '.box', 
            fade : 1000 
      });
      $('.picture img').imgscale({ 
        parent : '.picture', 
        fade : 1000 
      }); 
      $('.picture img').imgscale({ 
          parent : '.picture', 
          fade : 1000 
        });
     
   $('.uploadify label, .uploadify input[type=submit]').hide();
    $('#file_upload').uploadify({
        uploader: '/js/uploadify.swf',
        script: '/upload2/',
        cancelImg: '/img/cancel.png',
        folder: '/uploads/tmp/',
        auto: true,
        buttonImg: '/images/upload.gif',
        multi: false,
        wmode: 'opaque',
        height: 62,
        width: 227,
        fileExt: '*.jpg;*.gif;*.png;*.jpeg;*.JPG',
        fileDesc: 'JPEG Images',
        queueID: 'uploadqueue',
        onComplete: function (event, ID, fileObj, response, data) {
            woopraTracker.pushEvent({name:'Photo Uploaded', file: response});
            if (response !== null && response !== undefined) {
                tmpFile = response;
                showApply(response);
				
            }
        }
    });


    $('.switch').live('click', function (e) {
        e.preventDefault();
        if ($(this).is('.on')) {
            $(this).removeClass('on').addClass('off');
        } else {
            $(this).removeClass('off').addClass('on');
        }
        if (!$(this).is('.public')) {
            vintage($(this));
          }
    });
    
    $('#content article,#content.big').hide();

    $('.delete').live('click', function (e) {
        $.post('/delete/', { key : $(this).attr('rel') } , function(data) {
            window.location.reload();
        });
    });
    
    
    
});