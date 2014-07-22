/* tagSele() + tagSeleVal()
 *
 * dependence: tagSele.css
 *
 * usage:  <select id="selector" class="tagSele">... or <select id="selector" multiple="multiple" class="tagSele">...
 *
 * render: <option value="value">text</option>... or <option>value</option>...
 *
 * setter: $('selector').tagSeleVal('vlaue') or $('#selector').tagSeleVal('vlaue1, value2')
 *
 * getter: $('selector').tagSeleVal()
 *
 * author: Zrug, 2014-6-30
 */

$.fn.tagSele = function () {

	var TagSele = function (elem) {
		this.el = elem;
		this.$el = $(elem);
		this.options = [];

		this.makeTagElems = function () {
			var _this = this;
			var isSingle = this.$el.attr('multiple') ? "" : "tagsele-single";

			$(this.el).find('option').each(function () {
				var span = document.createElement("span");
				var obj = $(span).addClass('tagsele-tags tagsele-not-selected ' + isSingle)
					.attr({'value':$(this).attr('value')}).text(this.label);
				_this.aliveTag(obj);
				_this.options.push(obj);
			});
			return _this.options;
		};

		this.makeTagBody = function () {
			var body = document.createElement("div");
			return $(body).addClass('tagsele-body')
					.addClass(this.$el.attr('class'))
					.addClass('field')
					.addClass('field-' + this.$el.attr('fieldId'))
					.html(this.makeTagElems())
					.attr({
						'id': this.$el.attr('fieldId'),
						'fieldId': this.$el.attr('fieldId'),
						'valuetype': this.$el.attr('valuetype')
					});
		};

		this.aliveTag = function (tag) {
			tag.on('click', function () {
				if ($(this).hasClass('tagsele-single')) {
					$(this).toggleClass('tagsele-not-selected').toggleClass('selected')
							.siblings('.selected').toggleClass('tagsele-not-selected').toggleClass('selected');
				} else {
					$(this).toggleClass('tagsele-not-selected').toggleClass('selected');
				}
			});
		};

		this.tagStyle = function () {
			this.$el.after(this.makeTagBody()).remove();
		};
	}

	return this.each(function () {
		var ts = new TagSele(this);
		ts.tagStyle();
	});

};

$.fn.tagSeleVal = function (value) {
	if (value) {
		var hasValue = function (target, value) {
			if (typeof value === 'string' && value.indexOf(',') >= 0) {
				value = value.replace(/, /g, ',');
				var values = value.split(',');
				for (var i=0; i<values.length; i++)
					if (values[i] == target)
						return true;
			} else {
				value = (value === true) ? ('1') : ((value === false) ? ('0') : value);
				return (value == target);
			}
			return false;
		}
		return this.each(function () {
			var tags = $(this).find('.tagsele-tags');
			$(tags).each(function () {
				var v = $(this).attr('value') ? $(this).attr('value') : $(this).text();
				if (hasValue(v, value)) {
					if ( $(this).hasClass('tagsele-single') ) {
						$(this).siblings().removeClass('selected').addClass('tagsele-not-selected');
					}
					$(this).removeClass('tagsele-not-selected').addClass('selected');
				}
			});
		});
	} else {
	    var result = '';
		this.each(function () {
		    $(this).find('.selected').each(function () {
		        result += ($(this).val() ? $(this).val() : $(this).text()) + ',';
		    });
		});
	    return result.replace(/,+$/, '');		
	}
};


