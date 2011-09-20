/* 
 *  PhotoMosaic starts around line ~#40 
 */


/*
      mustache.js — Logic-less templates in JavaScript
      See http://mustache.github.com/ for more info.
*/
(function(window){var Mustache=function(){var Renderer=function(){};Renderer.prototype={otag:"{{",ctag:"}}",pragmas:{},buffer:[],pragmas_implemented:{"IMPLICIT-ITERATOR":true},context:{},render:function(template,context,partials,in_recursion){if(!in_recursion){this.context=context;this.buffer=[];}
if(!this.includes("",template)){if(in_recursion){return template;}else{this.send(template);return;}}
template=this.render_pragmas(template);var html=this.render_section(template,context,partials);if(in_recursion){return this.render_tags(html,context,partials,in_recursion);}
this.render_tags(html,context,partials,in_recursion);},send:function(line){if(line!=""){this.buffer.push(line);}},render_pragmas:function(template){if(!this.includes("%",template)){return template;}
var that=this;var regex=new RegExp(this.otag+"%([\\w-]+) ?([\\w]+=[\\w]+)?"+
this.ctag);return template.replace(regex,function(match,pragma,options){if(!that.pragmas_implemented[pragma]){throw({message:"This implementation of mustache doesn't understand the '"+
pragma+"' pragma"});}
that.pragmas[pragma]={};if(options){var opts=options.split("=");that.pragmas[pragma][opts[0]]=opts[1];}
return"";});},render_partial:function(name,context,partials){name=this.trim(name);if(!partials||partials[name]===undefined){throw({message:"unknown_partial '"+name+"'"});}
if(typeof(context[name])!="object"){return this.render(partials[name],context,partials,true);}
return this.render(partials[name],context[name],partials,true);},render_section:function(template,context,partials){if(!this.includes("#",template)&&!this.includes("^",template)){return template;}
var that=this;var regex=new RegExp(this.otag+"(\\^|\\#)\\s*(.+)\\s*"+this.ctag+"\n*([\\s\\S]+?)"+this.otag+"\\/\\s*\\2\\s*"+this.ctag+"\\s*","mg");return template.replace(regex,function(match,type,name,content){var value=that.find(name,context);if(type=="^"){if(!value||that.is_array(value)&&value.length===0){return that.render(content,context,partials,true);}else{return"";}}else if(type=="#"){if(that.is_array(value)){return that.map(value,function(row){return that.render(content,that.create_context(row),partials,true);}).join("");}else if(that.is_object(value)){return that.render(content,that.create_context(value),partials,true);}else if(typeof value==="function"){return value.call(context,content,function(text){return that.render(text,context,partials,true);});}else if(value){return that.render(content,context,partials,true);}else{return"";}}});},render_tags:function(template,context,partials,in_recursion){var that=this;var new_regex=function(){return new RegExp(that.otag+"(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?"+
that.ctag+"+","g");};var regex=new_regex();var tag_replace_callback=function(match,operator,name){switch(operator){case"!":return"";case"=":that.set_delimiters(name);regex=new_regex();return"";case">":return that.render_partial(name,context,partials);case"{":return that.find(name,context);default:return that.escape(that.find(name,context));}};var lines=template.split("\n");for(var i=0;i<lines.length;i++){lines[i]=lines[i].replace(regex,tag_replace_callback,this);if(!in_recursion){this.send(lines[i]);}}
if(in_recursion){return lines.join("\n");}},set_delimiters:function(delimiters){var dels=delimiters.split(" ");this.otag=this.escape_regex(dels[0]);this.ctag=this.escape_regex(dels[1]);},escape_regex:function(text){if(!arguments.callee.sRE){var specials=['/','.','*','+','?','|','(',')','[',']','{','}','\\'];arguments.callee.sRE=new RegExp('(\\'+specials.join('|\\')+')','g');}
return text.replace(arguments.callee.sRE,'\\$1');},find:function(name,context){name=this.trim(name);function is_kinda_truthy(bool){return bool===false||bool===0||bool;}
var value;if(is_kinda_truthy(context[name])){value=context[name];}else if(is_kinda_truthy(this.context[name])){value=this.context[name];}
if(typeof value==="function"){return value.apply(context);}
if(value!==undefined){return value;}
return"";},includes:function(needle,haystack){return haystack.indexOf(this.otag+needle)!=-1;},escape:function(s){s=String(s===null?"":s);return s.replace(/&(?!\w+;)|["'<>\\]/g,function(s){switch(s){case "&": return "&amp;";case "\\": return "\\\\";case '"': return '&quot;';case "'": return '&#39;';case "<": return "&lt;";case ">": return "&gt;";default: return s;
}});},create_context:function(_context){if(this.is_object(_context)){return _context;}else{var iterator=".";if(this.pragmas["IMPLICIT-ITERATOR"]){iterator=this.pragmas["IMPLICIT-ITERATOR"].iterator;}
var ctx={};ctx[iterator]=_context;return ctx;}},is_object:function(a){return a&&typeof a=="object";},is_array:function(a){return Object.prototype.toString.call(a)==='[object Array]';},trim:function(s){return s.replace(/^\s*|\s*$/g,"");},map:function(array,fn){if(typeof array.map=="function"){return array.map(fn);}else{var r=[];var l=array.length;for(var i=0;i<l;i++){r.push(fn(array[i]));}
return r;}}};return({name:"mustache.js",version:"0.3.1-dev",to_html:function(template,view,partials,send_fun){var renderer=new Renderer();if(send_fun){renderer.send=send_fun;}
renderer.render(template,view,partials);if(!send_fun){return renderer.buffer.join("\n");}}});}();
window['PhotoMosaic']={};
window['PhotoMosaic'].Mustache=Mustache;
})(window);

/*
    jQuery photoMosaic v1.6
    requires jQuery 1.5+ & Mustache (included above)
*/

(function($) {

    if(typeof console === "undefined") {
        console = {
            log: function(msg) {
                console.errors.push(msg);
            },
            errors: []
        };
    }

    var photoMosaic = function() { };

    $.extend(photoMosaic.prototype, {

        init: function(el, options, i){
            var defaults = {
                input : 'json', // json, html, xml
                gallery : 'PMalbum', // json object, xml file path
                padding : 2,
                columns : 3,
                width : 'auto', // auto (str) or (int) 
                height : 'auto', // auto (str) or (int)
                links : true,
                external_links: false,
                random : false,
                force_order : false,
                auto_columns : false,
                ideal_column_width : 100,
                modal_name : null,
                modal_group : true,
                modal_ready_callback : null
            };
            
            this.opts = $.extend({}, defaults, options);
            this.obj = $(el);
            this.id = (Date.parse(new Date()) + Math.round(Math.random() * 10000));

            this.preload = 'PM_preloadify' + this.id;

            this.images = [];
            this.columns = [];
            
            if(this.opts.width === 'auto') {
                this.opts.width = this.obj.width();
            }
            
            this.autoCols();
            
            this.col_mod = (this.opts.width - (this.opts.padding * (this.opts.columns - 1))) % this.opts.columns;
            this.col_width = ((this.opts.width - this.col_mod) - (this.opts.padding * (this.opts.columns - 1))) / this.opts.columns;

            this.template = ' ' +
                '<div id="photoMosaic_' + this.id + '" class="photoMosaic">' +
                    '{{#columns}}' +
                        '<ol style="float:left; margin:0 {{^last}}{{padding}}px 0 0{{/last}}">' +
                            '{{#images}}' +
                                '<li style="width:{{#width}}{{constraint}}{{/width}}px; height:{{#height}}{{constraint}}{{/height}}px; margin:0 {{^last}}0 {{padding}}px 0{{/last}}">' +
                                    '{{#link}}<a href="{{path}}" {{#external}}target="_blank"{{/external}} {{#modal}}rel="{{modal}}"{{/modal}} {{#caption}}title="{{caption}}"{{/caption}}>{{/link}}' +
                                        '<img src="{{src}}" style="' +
                                                'width:{{#width}}{{adjusted}}{{/width}}px; ' +
                                                'height:{{#height}}{{adjusted}}{{/height}}px; ' +
                                                '{{#adjustment}}{{type}}:-{{value}}px;{{/adjustment}}" ' +
                                            'title="{{caption}}"/>' +
                                    '{{#link}}</a>{{/link}}' +
                                '</li>' +
                            '{{/images}}' +
                        '</ol>' +
                    '{{/columns}}' +
                '</div>';


            // Error Checks
            if ( this.opts.input === 'xml' && this.opts.gallery === '' ) {
                console.log("PhotoMosaic: ERROR: No XML file path specified.");
                return;
            }
            if ( this.opts.input ==='xml' && this.opts.gallery === 'PMalbum' ) {
                console.log('PhotoMosaic: ERROR: No XML file path specified.');
                return;
            }
            if ( this.opts.input === 'json' && this.opts.gallery === '' ) {
                console.log("PhotoMosaic: ERROR: No JSON object defined.");
                return;
            }
            if ( this.opts.input ==='json' && this.opts.gallery === 'PMalbum' ) {
                if ( typeof(PMalbum) !== 'undefined' ) {
                    this.opts.gallery = PMalbum;
                } else {
                    console.log('PhotoMosaic: ERROR: The JSON object "PMalbum" can not be found.');
                    return;
                }
            }
            if ( this.opts.gallery.length - 1 < this.current_album ) {
                console.log('PhotoMosaic: ERROR: "start_album" uses a 0-index (0 = the first album).'
                     + 'No album was found at the specified index ('+ this.current_album +')');
                return;
            }
            
            
            var self = this;
            
            // html -- construct json -- preload -- mosaic -- write
            if ( this.opts.input === 'html' ) {
                this.opts.gallery = this.constructGalleryFromHTML();
                $.when(self.preloadify()).then(function() {
                    self.obj.html( self.makeMosaic() );
                    self.modalCallback();
                });
            }

            // xml -- construct json -- preload -- mosaic -- write
            if ( this.opts.input === 'xml' ){
                $.get(this.opts.gallery, function(data){
                    if ( $(data).find('photos').length > 0 ) {
                        self.opts.gallery = $(data).find('photos');
                        self.opts.gallery = self.constructGalleryFromXML();
                        $.when(self.preloadify()).then(function() {
                            self.obj.html( self.makeMosaic() );
                            self.modalCallback();
                        });
                    } else {
                        console.log('PhotoMosaic: ERROR: The XML either couldn\'t be found or was malformed.');
                        return;
                    }
                });
                
            }

            // json -- preload -- mosaic -- write
            if ( this.opts.input === 'json' ) {
                $.when(this.preloadify()).then(function() {
                    self.obj.html( self.makeMosaic() );
                    self.modalCallback();
                });
            }
        },

        makeMosaic: function() {
            var self = this,
                $preload = $('#' + this.preload),
                i,
                j;

            // get image sizes, set modalhook, & get link paths
            $.each(this.opts.gallery, function(i) {
                var image = {},
                    $img = $preload.find('img[src="'+ this.src +'"]'),
                    modal_text;
                    
                // image sizes
                image.src = this.src;
                image.width = {};
                image.height = {};
                image.padding = self.opts.padding;
                image.caption = this.caption;

                image.width.original = $img.width();
                image.height.original = $img.height();
                image.width.adjusted = self.col_width;
                image.height.adjusted = Math.floor((image.height.original * image.width.adjusted) / image.width.original);

                // modal hooks
                if (self.opts.modal_name) {
                    if (self.opts.modal_group) {
                        modal_text = self.opts.modal_name + '[' + self.id + ']';    
                    } else {
                        modal_text = self.opts.modal_name;
                    }
                    image.modal = modal_text;
                }
                
                // link paths
                if (self.opts.links && this.url) {
                    image.link = true;
                    image.path = this.url;
                    image.external = self.opts.external_links;
                    delete image.modal;
                } else if (self.opts.links) {
                    image.link = true;
                    image.path = this.src;
                    image.external = self.opts.external_links;
                } else {
                    image.link = false;
                }

                self.images.push(image);
            });

            // ERROR CHECK: remove any images that failed to load
            this.images = this.errorCheck(this.images);

            // alt sort images by height (tall, short, tall, short)
            if (!this.opts.force_order) {
                this.images.sort(function(a,b) {
                    if (self.opts.random) {
                        return (0.5 - Math.random());
                    } else {
                        return (a.height.original - b.height.original);
                    }
                });
                this.images.reverse();
            }
            
            var order = [],
                bool = true;
            
            if (!this.opts.force_order) {
                while (this.images.length > 0) {
                    if (bool) {
                        order.push(this.images.shift());
                    } else {
                        order.push(this.images.pop());
                    }
                    bool = !bool;
                }
                this.images = order;
            }

            // deal into columns
            var current_col = 0;

            for (i = 0; i < this.images.length; i++) {
                if (current_col === this.opts.columns) {
                    current_col = 0;
                }

                if (!this.columns[current_col]) {
                    this.columns[current_col] = [];
                }
                this.columns[current_col].push(this.images[i]);

                current_col++;
            }
            
            // unfortunate special-case "force order"
            if (this.opts.force_order) {
                var forced_cols = [];
                for (i = 0; i < this.columns.length; i++) {
                    for (j = 0; j < this.columns[i].length; j++) {
                        if (!forced_cols[i]) {
                            forced_cols[i] = [];
                        }
                        forced_cols[i].push(this.images[0]);
                        this.images.shift();
                    }
                }
                this.columns = forced_cols;
            }
            
            // construct template object &
            // get column heights (img height adjusted for col width)
            var json = {columns:[]},
                col_heights = [];
            
            for (i = 0; i < this.columns.length; i++) {
                var col_height = 0;

                for (j = 0; j < this.columns[i].length; j++) {
                    col_height = col_height + this.columns[i][j].height.adjusted;
                }
                col_height = col_height + (this.columns[i].length - 1) * this.opts.padding;
                col_heights.push(col_height);
                
                json.columns[i] = {};
                json.columns[i].images = this.columns[i];
                json.columns[i].height = col_height;
                json.columns[i].padding = this.opts.padding;
            }
            
            // normalize column heights
            var shortest_col = this.getSmallest(col_heights),
                tallest_col = this.getBiggest(col_heights),
                average_col_height = Math.floor((shortest_col + tallest_col) / 2);

            if (this.opts.height === 'auto') {
                json = this.adjustHeights(json, average_col_height);
            } else {
                json = this.adjustHeights(json, this.opts.height);
            }

            return PhotoMosaic.Mustache.to_html(this.template, json);
        },
        
        adjustHeights: function(json, target_height) {
            json = this.markLastColumn(json);
            
            for (i = 0; i < json.columns.length; i++) {
                json = this.markLastImageInColumn(json, i);
                    
                if(json.columns[i].height > target_height) {
                    json.columns[i] = this.scaleColumnDown(json.columns[i], target_height);
                } else {
                    json.columns[i] = this.scaleColumnUp(json.columns[i], target_height);
                }
            }
            
            return json;
        },
        
        autoCols: function(){
            var max_width = this.opts.width,
                ideal_width = this.opts.ideal_column_width,
                num_images = eval(this.opts.gallery).length,
                cols = 0,
                ratio = {w:4, h:3},
                i = 0;

            if(this.opts.auto_columns) {
                while(cols === 0) {
                    if(num_images <= ((i + ratio.w) * (i + ratio.h))) {
                        cols = i + ratio.w;
                    } else {
                        ++i;
                    }
                }
                this.opts.width = ((cols * ideal_width) >= max_width) ? max_width : cols * ideal_width;
                this.opts.columns = cols;
            }
        },
        
        scaleColumnDown: function(col, height) {
            var count = col.images.length,
                diff = col.height - height,
                mod = diff % count,
                divy = Math.floor(diff / count),
                divy_mod = divy + mod,
                offset = Math.floor(divy / 2),
                offset_mod = Math.floor((divy + mod) / 2),
                largest_image = this.findLargestImage(col.images),
                i;

            for (i = 0; i < count; i++) {
                if(i === largest_image.index) {
                    col.images[i].height.constraint = col.images[i].height.adjusted - divy_mod;
                } else {
                    col.images[i].height.constraint = col.images[i].height.adjusted - divy;
                }
                col.images[i].width.constraint = col.images[i].width.adjusted;
                col.images[i].adjustment = {
                    type : 'top',
                    value : Math.floor((col.images[i].height.adjusted - col.images[i].height.constraint) / 2)
                };
            }
            
            return col;
        },
        
        scaleColumnUp: function(col, height) {
            var count = col.images.length,
                diff = height - col.height,
                mod = diff % count,
                divy = Math.floor(diff / count),
                divy_mod = divy + mod,
                offset = Math.floor(divy / 2),
                offset_mod = Math.floor((divy + mod) / 2),
                smallest_image = this.findSmallestImage(col.images),
                i;
 
            for (i = 0; i < count; i++) {
                if(i === smallest_image.index) {
                    col.images[i].height.constraint = col.images[i].height.adjusted + divy_mod;
                } else {
                    col.images[i].height.constraint = col.images[i].height.adjusted + divy;
                }
                col.images[i].width.constraint = col.images[i].width.adjusted;
                col.images[i].width.adjusted = Math.floor((col.images[i].width.adjusted * col.images[i].height.constraint) / col.images[i].height.adjusted);
                col.images[i].height.adjusted = col.images[i].height.constraint;

                col.images[i].adjustment = {
                    type : 'left',
                    value : Math.floor((col.images[i].width.adjusted - col.images[i].width.constraint) / 2)
                };
            }

            return col;
        },
        
        getSmallest: function(list) {
            var smallest = 0,
                i;
                
            for (i = 0; i < list.length; i++) {
                if (smallest === 0) {
                    smallest = list[i];
                } else if (list[i] < smallest) {
                    smallest = list[i];    
                }
            }

            return smallest;
        },
        
        getBiggest: function(list) {
            var biggest = 0,
                i;

            for (i = 0; i < list.length; i++) {
                if (list[i] > biggest) {
                    biggest = list[i];
                }
            }

            return biggest;
        },

        findSmallestImage: function(images) {
            var smallest_height = 0,
                index_of_smallest = 0,
                i;
                
            for (i = 0; i < images.length; i++) {
                if(smallest_height === 0) {
                    smallest_height = images[i].height.adjusted;
                } else if(images[i].height.adjusted < smallest_height) {
                    smallest_height = images[i].height.adjusted;
                    index_of_smallest = i;
                }
            }
            
            return { 
                height : smallest_height,
                index : index_of_smallest
            };
        },

        findLargestImage: function(images) {
            var largest_height = 0,
                index_of_largest = 0,
                i;
                
            for (i = 0; i < images.length; i++) {
                if(images[i].height.adjusted > largest_height) {
                    largest_height = images[i].height.adjusted;
                    index_of_largest = i;
                }
            }
            
            return { 
                height : largest_height,
                index : index_of_largest
            };
        },
        
        markLastColumn: function(json) {
            json.columns[json.columns.length - 1].last = true;
            return json;
        },
        
        markLastImageInColumn: function(json, i) {
            json.columns[i].images[json.columns[i].images.length - 1].last = true;
            return json;
        },
        
        errorCheck: function(images){
            var to_delete = [];
            
            $.each(images, function(i) {
                if(isNaN(this.height.adjusted)){
                    to_delete.push(i);
                }
            });
            
            $.each(to_delete, function(i){
                console.log('PhotoMosaic: ERROR: The following image failed to load and was skipped.\n' + images[to_delete[i]].src);
                var rest = images.slice( to_delete[i] + 1 );
                images.length = to_delete[i];
                images.push.apply(images, rest);
            });
            
            return images;
        },
        
        preloadify: function(){
            var deferred = $.Deferred(),
                promises = [],
                $images = $('<div>').attr({
                    'id': this.preload,
                    'class' : 'PM_preloadify'
                });

            $.each(this.opts.gallery, function(i) {
                var dfd = $.Deferred(),
                    $item = $('<img>').error(dfd.resolve).load(dfd.resolve).attr({src : this.src});
                $images.append($item);
                promises.push(dfd);
            });
            
            $.when.apply(null, promises).done(deferred.resolve, $('body').append($images));
            
            return deferred.promise(); 
        },
        
        constructGalleryFromHTML: function(){
            var gallery = [],
                $images = this.obj.find('img'),
                i;

            for (i = 0; i < $images.length; i++) {
                var image = {};

                image.src = ($images.eq(i).parent('a').length > 0 && this.opts.links) ? $images.eq(i).parent('a').attr('href') : $images.eq(i).attr('src');
                image.caption = $images.eq(i).attr('title');

                gallery.push(image);
            } 

            return gallery;
        },

        constructGalleryFromXML: function(){
            var gallery = [];
            
            this.opts.gallery.find('photo').each(function(i){
                var photo = {},
                    data = $(this);
                
                photo.caption = data.children('title').text();
                photo.src = data.children('src').text();
                photo.url = data.children('url').text();
                
                gallery.push(photo);
            });
            
            return gallery;
        },
        
        modalCallback: function() {
            var $node = this.obj.children().eq(0);
            if($.isFunction(this.opts.modal_ready_callback)){
                this.opts.modal_ready_callback.apply(this, [$node]);
            }
        }

    });

    $.fn.photoMosaic = function(options) {
        this.each(function(i) {
            if (!this.photoMosaic) {
                this.photoMosaic = new photoMosaic();
                this.photoMosaic.init(this, options, i);
            }
        });
        return this;
    };
})(jQuery);