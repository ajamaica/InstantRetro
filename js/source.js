if(!Array.indexOf){
	    Array.prototype.indexOf = function(obj){
	        for(var i=0; i<this.length; i++){
	            if(this[i]==obj){
	                return i;
	            }
	        }
	        return -1;
	    }
	}

(function( $ ){
$.fn.Uploadrr = function( options ) {
	var settings = {
		'simpleFile': false,
		'maxFileSize': -1,
		'progressGIF': 'pr.gif',
		'target': 'upload.php',
		'onComplete': function () {},
		'onError': function () {}
		};
	if ( options ) {
		$.extend( settings, options );
		}
	var internal = {
		'settings': settings,
		current:0,
		totalSize:0,
		totalLoaded:0,
		fileCount:0,
		lastValue:'',
		files: {modern:false, items: []},
		DragDropSupported: (typeof(window.File) == 'object' && typeof(window.FileReader) == 'function' && typeof(window.FileList) == 'object'),
		enableDragDrop: function () {
			defaultFunc = function ( e ) {
				e.stopPropagation();
				e.preventDefault();
				}
			this.fileListDiv[0].addEventListener('dragenter',defaultFunc,false);
			this.fileListDiv[0].addEventListener('dragover',defaultFunc,false);
			this.fileListDiv[0].addEventListener('drop',$.proxy(function ( e ) {
				e.stopPropagation();
				e.preventDefault();
				this.addFile(e.dataTransfer);
				},this),false);
			},
		render: function ( element ) {
			element.addClass( 'uploadBox_fu' );
			fform = $('<form/>');
			this.realDiv =$( '<div/>', { 'class':'real' } );
				this.fileField = $( '<input/>', { 'class':'file', 'name':'file',  'type':'file', 'multiple':'true'} );
				if (this.settings.simpleFile==true) this.fileField.css({'opacity':1}); else {
						this.fakeDiv = $( '<div/>', { 'class':'fake' } );
						this.ftext =  $( '<input/>', { 'type':'text', 'class':'text bev' } ); 
						this.fakeDiv.append( this.ftext );
						this.fakeDiv.append( $( '<input/>', { 'type':'button', 'class':'button bev xx', 'value':'Browse'} ) );
						this.realDiv.append(this.fakeDiv);
					};
				this.realDiv.append( this.fileField );
				fform.append(this.realDiv);
				fform.append($('<br/>'));
					this.fileListDiv = $( '<div/>', { 'class':'fileList bev'});
						this.upInfoDiv = $( '<div/>', { 'class':'upInfo' } ).hide();
							this.totalPro = $( '<div/>', { 'class':'totalPro' } );
							this.filePro = $( '<div/>', { 'class':'filePro' } );
							this.upInfoDiv.append( this.filePro);
							this.upInfoDiv.append($( '<img/>', { 'src':this.settings.progressGIF, 'id':'prImg'} ));
							this.upInfoDiv.append(this.totalPro);
						this.fileListDiv.append( this.upInfoDiv );
						this.info = $( '<div/>', {'class':'info'} ).html('To select files click "BROWSE" '+ (this.DragDropSupported ? 'or drag them into this box.' : '.' )+ (typeof this.settings.allowedExtensions=='object'? '<br>Allowed file types: '+ this.settings.allowedExtensions.join(', '):''));
						this.fileListDiv.append(this.info);
					fform.append( this.fileListDiv );
					this.submit = $('<input/>', { 'type':'button', 'value':'Upload', 'class':$.browser.msie ? 'ib':'button bev'}).css({'width':'auto','position':'relative','padding':'6px 20px'}); 
					fform.append( this.submit );
					element.append( fform );
					temp =function (html) {
						var tmp = document.createElement("div");
						tmp.innerHTML = html;
						return tmp.firstChild;
					};
					this.upFrame = temp('<iframe name="upFrame" src="about:blank" style="display:none"></iframe>');
					document.body.appendChild(this.upFrame);

					element.append( this.upFrame );
					if (this.DragDropSupported) $.proxy(this.enableDragDrop(),this);
					this.fileField.bind('change', $.proxy(this.addFile,this));
					this.submit.bind('click',  $.proxy(this.sendFiles,this));
			},
		checkExt: function ( fileName ) {
			fileExt = fileName.substr(fileName.indexOf('.'), fileName.length).toLowerCase();
			if (typeof this.settings.allowedExtensions=='object') {
				if (this.settings.allowedExtensions.indexOf(fileExt)>-1) return true; else alert(fileName + ' is not allowed.\r\nAllowed file types: '+ this.settings.allowedExtensions.join(', ') );
				} else return true;
		},
		addFile: function ( e ) {
			if (e.files) caller = e; else {
				caller = e.target;
			if (this.lastValue==e.target.value) {return ;}
			}
			
			appendFile = function ( file ) {
				fname = file.fileName ? file.fileName : file.value;
				fname = fname.split('\\');
				fname = fname[fname.length-1];
				fileItem = $('<div/>', {
					"class": "fileItem bev"
				});
				delBtn = $('<div/>', {"class": "delete"}).html('<b>Delete</b>');
				fileItem.append(delBtn);
				
				fileItem.append($('<div/>', {
					"class": "progress",
					"style": "width:0%"
				}));

				fileItem.append($('<i/>', {
					"style": "position:relative;z-index:1;"
				}).html(fname));
				
				this.fileListDiv.append(fileItem);
				
				delBtn.bind('click',{'fileItem':fileItem,'file':file,'fname':fname,'_this':this},function (event) {
								event.data.fileItem.remove();
								removeItem = event.data.file;
								event.data._this.files.items = jQuery.grep(event.data._this.files.items, function(value) {
									return value != removeItem;
								});
								if (event.data._this.files.items.length==[]) event.data._this.info.show();
								if (event.data._this.ftext) event.data._this.ftext.val(event.data.fname + ' deleted.');
								});
						}
				if ((caller.files)&&(new XMLHttpRequest().upload!=null)) {
				this.files.modern=true;
				for (i=0;i<caller.files.length;i++) {
					file = caller.files[i];
							if (this.checkExt (file.fileName))  {
								if (file.fileSize<this.settings.maxFileSize || this.settings.maxFileSize==-1) {
									if (this.info.is(":visible")) {this.info.hide();}
									this.files.items.push(file);
									$.proxy(appendFile,this)(file);
									l = this.files.items.length;
									ct = l==1?' file':' files';
									this.ftext.val(l + ct + ' added.');
								} else alert('Maximum file size: ' + this.settings.maxFileSize+' bytes.');
						};
							}
				} else {
					if (this.checkExt (caller.value)) {
						if (this.info.is(":visible")) {this.info.hide();}
						this.lastValue=caller.value;
						this.files.modern=false;
						this.files.items.push(caller);
						this.fileField = $( '<input/>', { 'class':'file', 'name':'file',  'type':'file', 'multiple':'true'} ).bind('change', $.proxy(this.addFile,this)).css({'opacity':1});
						$(caller).after(this.fileField);
						$(caller).hide();
						$.proxy(appendFile,this)(caller);
						}
					}
		},
		sendFiles: function () {
				if (this.files.items.length<1) {
					this.ftext.val('No files selected.');
					return;
					}
				$('.delete').each(function (item) {
					$(this).hide();
					});
				disable = function ( elm ) {
					elm = $(elm);
					elm.die();
					elm.removeClass('button');
					elm.addClass('disabled');
					}; 
				this.fileField.die();
				disable(this.submit);
				disable(!this.fakeDiv ? this.fileItem: this.fakeDiv.children()[1]);
				if (!(this.upInfoDiv.is(":visible"))) {this.upInfoDiv.slideDown('fast');}
				if (this.files.modern) {
				
					this.tSize( false );
					$.proxy(this.uploadModern,this)( this.files.items[0] );
					
				} else {
					$.proxy(this.tSize,this)( true );
					$.proxy(this.uploadStandart, this)( this.files.items[0] );
								$(this.upFrame).bind('load',$.proxy(function () {
									this.reply= this.upFrame.contentWindow.document.body.innerHTML;
									try { this.reply= $.parseJSON(this.reply);} catch (err) {this.uploadError( 'jsonError' );}; 	
									if (this.reply.success) {
									if (this.nform) this.nform.remove();
									$(this.fileListDiv.children('.fileItem')[this.current].children[1]).css({'width':"100%"});											fname = this.files.items[this.current].value.split('\\');
				fname = fname[fname.length-1];
									$(this.fileListDiv.children('.fileItem')[this.current].children[2]).html($('<a/>',{"href":this.reply.file}).html(fname));
									this.current++;
									if (this.files.items[this.current]) { this.uploadStandart(this.files.items[this.current]);  } else {
											this.allDone();
											if ($.browser.msie) {
												$(this.upFrame).unbind('load');
												this.nform = $('<form/>',{'target':'upFrame','action':'about:blank'}).hide();
												this.fileListDiv.append(this.nform);
												this.nform.submit();	
											}
											}
										} else this.uploadError( 'customError' );
									},this));
					}
			},
		tSize: function ( countOnly ) {
			this.fileCount = this.files.items.length;
			if (countOnly) return;
			$(this.files.items).each($.proxy(function (i) {
				this.totalSize=this.files.items[i].fileSize+this.totalSize;
				},this));
			this.totalSize = (this.totalSize/1024).toFixed();
			},
		uploadProgress: function ( evt ) {
			percent = ((evt.loaded * 100) / evt.total).toFixed();
			loaded = (evt.loaded/1024).toFixed();
			total = (evt.total/1024).toFixed();
			this.filePro.html("Current file: "+percent+"% "+loaded+"KB/"+total+"KB");
			this.totalPro.html('Total: '+(this.current+1)+'/'+this.fileCount+' files '+((this.totalLoaded+evt.loaded)/1024).toFixed()+'/'+this.totalSize+'KB');
			$(this.fileListDiv.children('.fileItem')[this.current].children[1]).css({'width':percent + "%"});
			},
		uploadFinished: function ( evt ) {
			percent = ((evt.loaded * 100) / evt.total).toFixed();
			loaded = (evt.loaded/1024).toFixed();
			total = (evt.total/1024).toFixed();
			this.totalLoaded = this.totalLoaded+evt.total;
			this.filePro.html("Current file: 100% "+total+"KB/"+total+"KB");
			this.totalPro.html('Total: '+(this.current+1)+'/'+this.fileCount+' files '+(this.totalLoaded/1024).toFixed()+'/'+this.totalSize+'KB')
			$(this.fileListDiv.children('.fileItem')[this.current].children[1]).css({'width':"100%"});
				},
		allDone: function () {
			this.upInfoDiv.html('<h2>Uploaded!</h2>').addClass('result').css({backgroundColor:"#CDEB8B"});
			this.settings.onComplete();
				},
		uploadError: function ( errorType ) {
			this.upInfoDiv.html('<h2>Upload Failed</h2>').addClass('result').css({backgroundColor:"#B02B2C",color:'white'});
			$(this.fileListDiv.children('.fileItem')[this.current].children[1]).css({'width': "100%",backgroundColor:"#B02B2C"});
			switch ( errorType ) {
			case 'statusError': response = '<b> Bad Response: '+this.xhr.status+' '+this.xhr.statusText+' </b>'; break;
			case 'customError': response = '<b> Server Error: '+this.reply.details+' </b>'; break;
			case 'jsonError': response = "<b>Server returned invalid JSON response.</b>"; break;
			case 'fileMatchError': response = '<b> The file sent and the file received on the server dont match. </b>'; break;
			default : response = '<b> Upload Failed.</b>'; break;
			}
			this.upInfoDiv.append(response);
			this.settings.onError( response);
				},
		uploadModern: function ( file ) {
			if (file !== null) {
			this.xhr = new XMLHttpRequest();
			this.xhr.upload.addEventListener("progress", $.proxy(this.uploadProgress,this) , false);
			this.xhr.upload.addEventListener("load", $.proxy(this.uploadFinished,this)  , false);
			this.xhr.upload.addEventListener("error", $.proxy(this.uploadError,this), false);  
			this.xhr.open("POST", this.settings.target);
			this.xhr.setRequestHeader("If-Modified-Since", "Mon, 26 Jul 1997 05:00:00 GMT");
			this.xhr.setRequestHeader("Cache-Control", "no-cache");
			this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			this.xhr.setRequestHeader("X-File-Name", file.fileName);
			this.xhr.setRequestHeader("X-File-Size", file.fileSize);
			this.xhr.setRequestHeader("Content-Type", "multipart/form-data");
			this.xhr.onreadystatechange = $.proxy(function ()  {
				if (this.xhr.readyState==4) {
								if (this.xhr.status<400 && this.xhr.status>=200) {
								try { this.reply= $.parseJSON(this.xhr.responseText);} catch (err) {this.uploadError( 'jsonError' );}; 								
				if (this.reply.success) {
							$(this.fileListDiv.children('.fileItem')[this.current].children[2]).html($('<a/>',{"href":this.reply.file}).html(this.reply.file));
							this.current++;
							if (this.files.items[this.current]) {this.uploadModern(this.files.items[this.current]);} else this.allDone();
				} else this.uploadError( 'customError' );
				} else this.uploadError( 'statusError' );
					}
				},this);

			if (file.getAsBinary != undefined) {
				this.xhr.sendAsBinary(file.getAsBinary(file)); //mozilla case
			} else {
				this.xhr.send(file); //webkit case
			}
		}
	},
	uploadStandart: function ( file ) {
		this.filePro.html('Uploading : '+file.value);	
		this.totalPro.html('File '+(this.current+1)+' of '+this.fileCount);
		this.nform = $('<form/>',{'id':'upForm','method':'POST','accept-charset':'UTF-8','target':'upFrame','action':this.settings.target,'enctype':'multipart/form-data','encoding':'multipart/form-data'}).hide();
		this.nform.append(file);
		this.fileListDiv.append(this.nform);
		this.nform.submit();			
		}
	}
	internal.render(this);

}
})( jQuery );
