var PopingView = function (options) {
	this.opt = { css: {} };
	this.template = {
		warningView: function () {
			return $('<div class="warning-view"> \
						    <div class="outer-center"> \
						        <div class="label inner-center"> \
						        </div> \
						    </div> \
						    <div class="clear"></div> \
						</div>');
		},
		errorView: function () {
			return $('<div class="error-view"> \
						    <div class="outer-center"> \
						        <div class="label inner-center"> \
						        </div> \
						    </div> \
						    <div class="clear"></div> \
						</div>');
		}
	};
	this.init = function () {
		this.opt = $.extend({}, options);
	}
	this.init(options);
}

PopingView.prototype.show = function (options, callback) {
	this.el = (this.template[options.view || 'warningView'])();
	this.el.find('.label').text(options.text);
	if (options.css) this.el.css(options.css);
	$(options.parent || '.wrapper').append(this.el);
	var _this = this;
	// console.log('setTimeout');
	window.setTimeout(function () {
		_this.dismiss({}, callback);
	}, options.timeout || 2000);
}

PopingView.prototype.dismiss = function (options, callback) {
	// console.log('dismiss');
	var _this = this;
	this.el.fadeOut(function () {
		_this.el.remove();
		if (callback) {
			(callback)();
		}
	})
}