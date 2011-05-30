var isBig = true;

var updateTweets = function (query)
{
    $.get('/scripts/twitter.php', {query:query}, function (response) {
        var target = $('#tweets');
        for (var i in response.results) {
            var tweet = response.results[i].text;
            tweet = tweet.replace(/(http:\/\/\S+)/g,"<a href='$1' target='_blank'>$1</a>");
            tweet = tweet.replace(/@(\w+)/g,"<a href='http://twitter.com/#!/$1' target='_blank'>$1</a>");
            target.append('<li class="clearfix"><img src="'+response.results[i].profile_image_url+'" alt="" class="fleft" /><span><a href="http://twitter.com/#!/'+response.results[i].from_user+'" class="user" target="_blank"><strong>' + response.results[i].from_user + '</strong></a>: '+tweet+'</span></li>');
        }
        
        setTimeout("updateTweets('" + response.refresh_url + "')",30000);
    }, 'json');
}

var showApply = function (path)
{
    if (isBig) {
        $('*').removeClass('big');
        $('#content article').hide();
        var section = $('#uploadForm').parent('section');
        section.empty();
        section.append('<div class="loader">Loading</div>');

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

            $.get('/js/controls.html', function (r) {
                section.append(r);
            });
        }
        isBig = false;
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

var updateVintageJS = function (el, value) {
	
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
				updateVintageJS($(this));
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
			var key=response.key;
			if (Modernizr.localstorage) {
				var value=new Array();
				if(localStorage.getItem("photos_instant")){
					value= JSON.parse(localStorage.getItem("photos_instant"));
				}
				value.push(key);
				localStorage.setItem("photos_instant", JSON.stringify(value));
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
	
	
   $('.uploadify label, .uploadify input[type=submit]').hide();
    $('#file_upload').uploadify({
        uploader: '/js/uploadify.swf',
        script: '/upload/',
        cancelImg: '/img/cancel.png',
        folder: '/uploads/tmp/',
        auto: true,
        buttonImg: '/images/add.jpg',
        multi: false,
        wmode: 'opaque',
        height: 180,
        width: 180,
        fileExt: '*.jpg;*.gif;*.png;*.jpeg',
        fileDesc: 'JPEG Images',
        queueID: 'uploadqueue',
        onComplete: function (event, ID, fileObj, response, data) {
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
            updateVintageJS($(this));
          }
    });
    
    $('#content article,#content.big').hide();
    $('#nav a').not(':first').click(function(e) {
        e.preventDefault();
        var link = $(this);
        
        if (!$('#content').is('.big')) {
           $('#content').css('left',link.position().left-200);
        }
        
        var obj = $($(this).attr('href'));
        if (obj.is(':visible')) {
            obj.hide();
            $('#content').hide();
        } else {
            $('#content').show();
            $('#content article').hide();
            obj.show();
        }
    });
    
    
    
    
});