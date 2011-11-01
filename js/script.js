var image;
var orginal;
function run(imagesrc) {
    
            $('.gallery').hide();
            
            $("div.modal-bg").show();
            $("div.modal-bg").fadeTo("slow", .8);
            var span = document.getElementById('myspan');

            var int = setInterval(function() {
                if ((span.innerHTML += '.').length == 4) 
                    span.innerHTML = '';
                //clearInterval( int ); // at some point, clear the setInterval
            }, 100);
            
            var b = $("section");
            b.addClass('edit');
            b.empty();
                
            var img = new Image;
            img.src = imagesrc;
            orginal=imagesrc;
            b.append('<canvas id="caman" class="theImage"/>');
         

            
            
            img.onload = function () {
                
                 image = Caman(img.src, "#caman", function () {
                    b.prepend('<img style="display:none;" id="vintagejs" src="'+image.toBase64()+'" />');
                    
                    var d = Math.floor(Math.random() * 101);
                    $.get("/js/controls.html?" + d, function (a) {
                            b.prepend(a);
                            $('.preset-button').live('click', function () {
                                
                               
                                
                            		var filter = $(this).attr('id').split('-')[1];

                            		$('.active-preset').removeClass('active-preset');
                            		$(this).addClass('active-preset');
                                    inits.effect=filter;
                            		render(filter);
                            	});

                            	function render(filter) {
                            	     $("div.modal-bg").show();
                                        $("div.modal-bg").fadeTo("slow", .8);
                                        var span = document.getElementById('myspan');

                                        var int = setInterval(function() {
                                            if ((span.innerHTML += '.').length == 4) 
                                                span.innerHTML = '';
                                            //clearInterval( int ); // at some point, clear the setInterval
                                        }, 100);
                                     
                            		image.revert(function () {
                            			image[filter]().render(function () {
                            			$("div.modal-bg").hide();
                            				$('#vintagejs').attr('src',image.toBase64());
                            			});
                            		});
                            	}
                            $("div.modal-bg").hide();	
                    });
                    
                    b.append($('#cont').html());
                    
                });
                this.onload = null;
                
                
            }
    };

var inits = {
    vignette: {
        black: 0,
        white: 0
    },
    effect: false,
    noise: false,
    screen: false,
    desaturate: false,
    allowMultiEffect: true,
    mime: "image/jpeg",
    viewFinder: false,
    curves: false,
    blur: false,
    callback: function () {
		
         image = Caman($('#vintagejs').attr('src'), "#caman", function () {});
    }
};
function vintage(a, b) {
    image.revert(function () {
        if(inits.effect != false){
            image[filter]().render(function () {
    		$("div.modal-bg").hide();
    			$('#vintagejs').attr('src',image.toBase64());
    		});
    		
    		if (a.is(".vignette-dark")) {
                inits.vignette.black = b / 100 || 0
            } else if (a.is(".vignette-light")) {
                inits.vignette.white = b / 100 || 0
            } else if (a.is(".eff")) {
                if (inits.viewFinder === false) {
                    inits.viewFinder = "" + a.attr("rel")
                } else {
                    if (inits.viewFinder === "" + a.attr("rel")) {
                        inits.viewFinder = false
                    } else {
                        inits.viewFinder = "" + a.attr("rel");
                        $(".eff").removeClass("on").addClass("off");
                        a.removeClass("off").addClass("on");
                        vintage($(this))
                    }
                }
            } else if (a.is(".screenlayer")) {
                inits.screen = inits.screen === false ? {
                    red: 227,
                    green: 12,
                    blue: 169,
                    strength: .15
                } : false
            } else if (a.is(".desaturate")) {
                inits.desaturate = b / 100 || false
            }
            
        }else if (a.is(".vignette-dark")) {
            inits.vignette.black = b / 100 || 0
        } else if (a.is(".vignette-light")) {
            inits.vignette.white = b / 100 || 0
        } else if (a.is(".eff")) {
            if (inits.viewFinder === false) {
                inits.viewFinder = "" + a.attr("rel")
            } else {
                if (inits.viewFinder === "" + a.attr("rel")) {
                    inits.viewFinder = false
                } else {
                    inits.viewFinder = "" + a.attr("rel");
                    $(".eff").removeClass("on").addClass("off");
                    a.removeClass("off").addClass("on");
                    vintage($(this))
                }
            }
        } else if (a.is(".screenlayer")) {
            inits.screen = inits.screen === false ? {
                red: 227,
                green: 12,
                blue: 169,
                strength: .15
            } : false
        } else if (a.is(".desaturate")) {
            inits.desaturate = b / 100 || false
        }
        
		
	});
  
    var c = $("#vintagejs");
    c.vintage(inits);
        
    };
    
    
var saveImage = function (a, b) {
        b.addClass("disabled").text("Saving...");
        var c = 0;
        if ($(".switch.public").is(".on")) {
            c = 1
        }
        $.ajax({
            type: "POST",
            url: "/save/",
            dataType: "json",
            cache: false,
            data: {
                privacy: $("input:checkbox:checked").val(),
                title: $("#label").val(),
                filename: backup,
                hash: a,
                imageData: image.toBase64(),
                "public": c
            },
            error: function () {
                alert("An error occured. Pleas try again.");
                b.removeClass("disabled").text("Save image")
            },
            success: function (a) {
                
                woopraTracker.pushEvent({
                    name: "Photo Save",
                    file: a.key
                });
                var b = a.key;
                
                if (FB.getSession() != null) {
                    var d = "This is my latest Photo made by Instant Photo. Make your own!";
                    if ($("#label").val() != "") {
                        d = $("#label").val()
                    }
                    FB.init({
                        appId: "192870917425715",
                        status: true,
                        cookie: true,
                        xfbml: true
                    });
                    FB.api("/me/feed", "post", {
                        message: d,
                        link: "http://www.instantretro.com/view/" + b,
                        picture: "http://www.instantretro.com/thumb/" + b,
                        name: "My vintage Photo"
                    })
                }
                window.location = "/view/" + b
            }
        })
    };
$(".downImage").live("click", function (a) {
    window.open($(".sig").attr("href"))
});

var backup;
$(document).ready(function() {
    
    $("#webcam").live("click", function (a) {
        
        var canvas = document.getElementById("canvas");

        	if (canvas.getContext) {
        		ctx = document.getElementById("canvas").getContext("2d");
        		ctx.clearRect(0, 0, 320, 240);

        	
        	}

        $("#pic").show();
        $("#webcam").webcam({
                width: 320,
                height: 240,
                mode: "callback",
                swffile: "/js/webcam/jscam_canvas_only.swf",
                onTick: function(remain) {

                		
                	},

                	onSave: function(data) {

                		var col = data.split(";");
                		var img = image;

                		if (false == filter_on) {

                			for(var i = 0; i < 320; i++) {
                				var tmp = parseInt(col[i]);
                				img.data[pos + 0] = (tmp >> 16) & 0xff;
                				img.data[pos + 1] = (tmp >> 8) & 0xff;
                				img.data[pos + 2] = tmp & 0xff;
                				img.data[pos + 3] = 0xff;
                				pos+= 4;
                			}

                		} else {

                			var id = filter_id;
                			var r,g,b;
                			var r1 = Math.floor(Math.random() * 255);
                			var r2 = Math.floor(Math.random() * 255);
                			var r3 = Math.floor(Math.random() * 255);

                			for(var i = 0; i < 320; i++) {
                				var tmp = parseInt(col[i]);

                				/* Copied some xcolor methods here to be faster than calling all methods inside of xcolor and to not serve complete library with every req */

                				if (id == 0) {
                					r = (tmp >> 16) & 0xff;
                					g = 0xff;
                					b = 0xff;
                				} else if (id == 1) {
                					r = 0xff;
                					g = (tmp >> 8) & 0xff;
                					b = 0xff;
                				} else if (id == 2) {
                					r = 0xff;
                					g = 0xff;
                					b = tmp & 0xff;
                				} else if (id == 3) {
                					r = 0xff ^ ((tmp >> 16) & 0xff);
                					g = 0xff ^ ((tmp >> 8) & 0xff);
                					b = 0xff ^ (tmp & 0xff);
                				} else if (id == 4) {

                					r = (tmp >> 16) & 0xff;
                					g = (tmp >> 8) & 0xff;
                					b = tmp & 0xff;
                					var v = Math.min(Math.floor(.35 + 13 * (r + g + b) / 60), 255);
                					r = v;
                					g = v;
                					b = v;
                				} else if (id == 5) {
                					r = (tmp >> 16) & 0xff;
                					g = (tmp >> 8) & 0xff;
                					b = tmp & 0xff;
                					if ((r+= 32) < 0) r = 0;
                					if ((g+= 32) < 0) g = 0;
                					if ((b+= 32) < 0) b = 0;
                				} else if (id == 6) {
                					r = (tmp >> 16) & 0xff;
                					g = (tmp >> 8) & 0xff;
                					b = tmp & 0xff;
                					if ((r-= 32) < 0) r = 0;
                					if ((g-= 32) < 0) g = 0;
                					if ((b-= 32) < 0) b = 0;
                				} else if (id == 7) {
                					r = (tmp >> 16) & 0xff;
                					g = (tmp >> 8) & 0xff;
                					b = tmp & 0xff;
                					r = Math.floor(r / 255 * r1);
                					g = Math.floor(g / 255 * r2);
                					b = Math.floor(b / 255 * r3);
                				}

                				img.data[pos + 0] = r;
                				img.data[pos + 1] = g;
                				img.data[pos + 2] = b;
                				img.data[pos + 3] = 0xff;
                				pos+= 4;
                			}
                		}

                		if (pos >= 0x4B000) {
                			ctx.putImageData(img, 0, 0);
                			pos = 0;
                		}
                	},

                	onCapture: function () {
                		webcam.save();

                		
                	},

                	debug: function (type, string) {
                		jQuery("#status").html(type + ": " + string);
                	},

                	onLoad: function () {}
                
        });
    });
    $("#reset").live("click", function (a) {
        $("div.modal-bg").show();
            $("div.modal-bg").fadeTo("slow", .8);
            var span = document.getElementById('myspan');

            var int = setInterval(function() {
                if ((span.innerHTML += '.').length == 4) 
                    span.innerHTML = '';
                //clearInterval( int ); // at some point, clear the setInterval
            }, 100);
        image = Caman(backup, "#caman", function () {
            $("div.modal-bg").hide();
    		$('#vintagejs').attr('src',image.toBase64());
        });
    });
    $("img.pics-home").imgscale({
        parent: ".box",
        fade: 1e3
    });
    $(".picture img").imgscale({
        parent: ".picture",
        fade: 1e3
    });
    $(".picture img").imgscale({
        parent: ".picture",
        fade: 1e3
    });
    $(".uploadify label, .uploadify input[type=submit]").hide();
    $("#file_upload").uploadify({
        uploader: "/js/uploadify.swf",
        script: "/upload2/",
        cancelImg: "/img/cancel.png",
        folder: "/uploads/tmp/",
        auto: true,
        buttonImg: "/images/upload.gif",
        multi: false,
        wmode: "opaque",
        height: 62,
        width: 227,
        fileExt: "*.jpg;*.gif;*.png;*.jpeg;*.JPG",
        fileDesc: "JPEG Images",
        queueID: "uploadqueue",
        onComplete: function (a, b, c, d, e) {
            if (d !== null && d !== undefined) {
                backup = d;
                run(d)
            }
        }
    });

    $("#avatar_upload").uploadify({
        uploader: "/js/uploadify.swf",
        script: "/settings/",
        cancelImg: "/img/cancel.png",
        folder: "/uploads/tmp/",
        auto: true,
        buttonImg: "/images/upload.gif",
        multi: false,
        wmode: "opaque",
        height: 62,
        width: 227,
        scriptData  : {'key':$('#key').val()},
        fileExt: "*.jpg;*.gif;*.png;*.jpeg;*.JPG",
        fileDesc: "JPEG Images",
        queueID: "uploadqueue",
        onComplete: function (a, b, c, d, e) {
            if (d !== null && d !== undefined) {
                backup = d;
                window.location.reload();
            }
        }
    });
    $(".switch").live("click", function (a) {
        a.preventDefault();
        if ($(this).is(".on")) {
            $(this).removeClass("on").addClass("off")
        } else {
            $(this).removeClass("off").addClass("on")
        }
        if (!$(this).is(".public")) {
            vintage($(this))
        }
    });
    if (typeof FB != 'undefined') {
        FB.Event.subscribe('edge.create', function(url) {
            woopraTracker.pushEvent({name: 'Facebook Like', url: url});
        });
    }
    
    $("#content article,#content.big").hide();
    $(".delete").live("click", function (a) {
        $.post("/delete/", {
            key: $(this).attr("rel")
        }, function (a) {
            window.location.reload()
        })
    });
})