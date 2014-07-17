
// global variables, not save, will remove later
var lists = [], obj = {};

var PhotosRows = function (options) {
	this.list = [];
	this.category = [];

	this.postToServer = function (options) {
		var _this = this;
		$(this.category).each(function (i, o) {
			if (_this.list[this])
				options.category = this;
				_this.list[this].postToServer(options);
		});
	}
	this.dropPhoto = function (options) {
		// console.log('PhotosRows dropPhoto');
		// console.log(options);
		var _this = this;
		if (_this.list[options.category]) {
			_this.list[options.category].dropPhoto(options);
		}
	}

	this.init = function (options) {
		this.opt = $.extend({}, options);
		var projectID = this.opt.projectID;
		var _this = this;

		$('.photos').each(function () {
			var category = $(this).attr('fieldId');
			var photosRow = new PhotosRow({
				'view': _this.opt.view,
				'category': category
			});
			_this.list[category] = photosRow;
			_this.category.push(category);
			$(this).append(photosRow.el);

			if (projectID) {
				var url = '/ProjectImgs/' + ($.cookie('token') || global.test_token) + '?projectID=' + projectID + '&category=' + category;
				// console.log(global.serviceUrl + url);
	            $.ajax({
	                url: global.serviceUrl + url,
	                type: "GET",
	                contentType: "application/json; charset=utf-8",
	                dataType: "json",
	                success: function (msg) {
	                    if (msg.d && msg.d.status && msg.d.status.statusCode == 200) {
	                        // console.log("photos GET success at: " + category);
	                        // console.log(msg.d.data);
	                        _this.list[category].fillData(msg.d.data);
	                    } else {
	                        // console.log("photos GET failed at: " + category + " Code:" + msg.d.status.statusCode + ", text:" + msg.d.status.errors);
	                    }
	                },
	                error: function (msg) {
			            console.log('photos GET error: ' + msg.statusText);
	                }
				});

			}
		});

		// make image uploader
		if (_this.category.length > 0) {

			var readMultipleFiles = function (evt) {
				var category = $(this).attr('ref');
			    //Retrieve all the files from the FileList object
			    var files = evt.target.files; 
			    		
			    if (files) {
			        for (var i = 0; i < files.length; i++) {

			        	if (files[i].type != 'image/jpeg') {
					        var pop = new PopingView();
					        pop.show({ text: files[i].name+" 文件类型错误，请上传JPG格式的文件！", parent: '.wrapper', view: "errorView", timeout: 4000, css: {top: '60px'} });
			        		continue;
			        	}
			        	if (files[i].size > 200000) {
					        var pop = new PopingView();
					        pop.show({ text: files[i].name+" 文件过大，请上传200K以内的文件！", parent: '.wrapper', view: "errorView", timeout: 4000, css: {top: '60px'} });
			        		continue;
			        	}
		        		// console.log('FileUpload:' +files[i].name+' will be uploaded ...');

			            (function (i) {
			                var reader = new FileReader();
			                reader.onload = function (event) {
			                    obj = {
			                        "edited": true,
			                        "category": category,
		                            "imgContent": event.target.result,
		                            "file": files[i]
			                    };
			                    project.photos.dropPhoto(obj);
			                };
			                reader.readAsDataURL(files[i]);
			            })(i);
			        }
			    } else {
					console.log("Failed to load files"); 
			    }
			}
		    $('.attach').hover(function () {
		        $(this).find('.cmps').addClass('cmps-hover');
		    }, function () {
		        $(this).find('.cmps').removeClass('cmps-hover');
		    }).on('click', function () {
				
  				var trigger = $(this).find('input:file')[0];
  				trigger.addEventListener('change', readMultipleFiles, false);
  		        trigger.click();

		    });

		    var ignoreDrag = function(e) {
		        var event = typeof e.originalEvent != 'undefined' ? e.originalEvent : e;
		        if (event.stopPropagation) {
		            event.stopPropagation();
		        }
		        if (event.preventDefault) {
		            event.preventDefault();
		        }
		    };
		    $('.dragtrigger').on("dragover", function () {
		        $(this).find('.holder').height($(this).find('.photos').outerHeight()+30).show();
		        return false;
		    }).on("dragenter", function () {
		    	// console.log('dragenter');
		        $(this).find('.holder').height($(this).find('.photos').outerHeight()+30).show();
		        return false;
		    });

		    $('.holder').on("dragleave", function () {
		        $('.holder').hide();
		        return false;
		    }).on("drop", function (e) {
		        var category = $(this).attr("ref");

		        // ensure that we listen out for the window event
		        // e = e || window.event;
		        e = (e&&e.originalEvent?e.originalEvent:window.event) || e;
		        // console.log(e);
		        ignoreDrag(e);
		        // And that for the fix to work we accept `e.files`
		        var files = (e.files || e.dataTransfer.files);
		        // console.log(files);

		        for (var i = 0; i < files.length; i++) {

		        	if (files[i].type != 'image/jpeg') {
				        var pop = new PopingView();
				        pop.show({ text: files[i].name+" 文件类型错误，请上传JPG格式的文件！", parent: '.wrapper', view: "errorView", timeout: 4000, css: {top: '60px'} });
		        		continue;
		        	}
		        	if (files[i].size > 200000) {
				        var pop = new PopingView();
				        pop.show({ text: files[i].name+" 文件过大，请上传200K以内的文件！", parent: '.wrapper', view: "errorView", timeout: 4000, css: {top: '60px'} });
		        		continue;
		        	}
	        		console.log('FileUpload:' +files[i].name+' will be uploaded ...');

		             (function (i) {
		                var reader = new FileReader();
		                reader.onload = function (event) {
		                    obj = {
		                        "edited": true,
		                        "category": category,
	                            "imgContent": event.target.result,
	                            "file": files[i]
		                    };
		                    // lists.push(obj);
		                    project.photos.dropPhoto(obj);
		                };
		                reader.readAsDataURL(files[i]);
		            })(i);
		        }

		        $('.holder').hide();
		        return false;
		    });		
		}
	};
	this.init(options);
	// console.log(this);
}

var PhotosRow = function (options) {
	var _this = this;
	this.refresh = function () {
		return $(this.list).each(function () {
			this.refresh();
		});
	}
	this.postToServer = function (options) {
		$(this.list).each(function () {
			this.postToServer(options);
		});
	}
	this.fillData = function (data) {

		for (var i=data.length-1; i>=0; i--) {
			// console.log(data[i]);
			var obj = data[i];
			obj.edited = false;
			this.dropPhoto(obj);
		}
	}
	this.dropPhoto = function (options) {
		options.view = this.opt.view;
		var photo = new Photo(options);
		this.el.prepend(photo.el);
		this.list.push(photo);
	}
	this.init = function (options) {
		this.opt = $.extend({}, options);
		this.list = [];
		this.el = $('<div class="c"><div class="clear"></div></div>');
	}
	this.init(options);
	// console.log(this);
}

var Photo = function (options) {

	this.template = {
		photo: function (data) {
			if (data.imgContent) {
				return $('<div class="thumb"><img src="data:image/jpeg;base64,'+ (data.imgContent.replace('data:image/jpeg;base64,','') || 'js/dropfile/test1.png') +'" /></div>');
			} else {
				return $('<div class="thumb" ref="'+data.url+'"><img src="data:image/jpeg;base64,'+ (data.imgCompressionContent.replace('data:image/jpeg;base64,','') || 'js/dropfile/test1.png') +'" /></div>')
			}
		},
	};
	this.postToServer = function (options) {
		var url = global.serviceUrl + '/ProjectImgs/';
		if (this.data && this.edited) {
			console.log('postPhotoToServer url:' + url + ', projectID:' + options.projectID + ', category:' + this.category );

			// console.log(options);
			dataStringify = JSON.stringify({
				"data" : { 
			  		"imgName": this.data.file.name, 
			  		"imgContent": this.data.imgContent.replace('data:image/jpeg;base64,',''), 
			  		"category": this.category, 
			  		"projectID": options.projectID 
				},
				"token" : ($.cookie('token') || global.test_token)
			});
			console.log(dataStringify);

		    $.ajax({
		        url: url,
		        type: "POST",
		        contentType: "application/json; charset=utf-8",
		        data: dataStringify,
		        dataType: "json",
		        success: function (msg) {
		        	console.log('photo POST success');
		            console.log(msg);
		        },
		        error: function (msg) {
		            console.log('photo POST error: ' + msg.statusText);
		        }
		    });

		}
	}
	this.isEdited = function () {
		return this.edited;
	}
	this.fillData = function (data) {
		var _this = this;
		// console.log('photo fillData:');
		// console.log(data);
		this.data = data;
		this.el = this.template.photo(this.data);
<<<<<<< HEAD
<<<<<<< HEAD

		console.log(this.el);

=======
=======
>>>>>>> FETCH_HEAD
		this.el.on('click', function () {
			var img = _this.el.clone();
			_this.opt.view.html(img);
		});
<<<<<<< HEAD
>>>>>>> FETCH_HEAD
=======
>>>>>>> FETCH_HEAD
		return this;
	}
	this.init = function (options) {
		this.opt = options;
		this.category = options.category;
		this.id = global.uuid();
		this.fillData(options);
		this.edited = options.edited;
	}
	this.init(options);
	// console.log(this);
}










