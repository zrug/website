var History = function (opt) {

	this.init = function (opt) {
		this.opt = $.extend({}, opt);
	}
	this.init(opt);
}

History.prototype.loadHistory = function () {
    var el = $(this.opt.el).next('.field');
    if (!el || el.length == 0) {
        el = $($(this.opt.el).next().children()[0]).children('.field');
    }
    var elID = el.attr('fieldId');
    var elText = $(this.opt.el).text();
    console.log('history at: ' + elID + ' by: ' + elText);
    var url = global.serviceUrl + '/Projects/' 
    	+ ($.cookie('token') || global.test_token) + '/history'
    	+ '?projectID=' + this.opt.projectID 
    	+ '&fieldName=' + elID;
    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg && msg.d && msg.d.status && msg.d.status.statusCode == 200) {
                console.log("history GET success");
                console.log(msg.d);
            } else {
                console.log("history GET failed Code:" + msg.d.status.statusCode + ", text:" + msg.d.status.errors);
            }
        },
        error: function (msg) {
            console.log("history GET failed: " + msg.statusText);
        }
    });
}


$(function () {

    $('.btn-history-toggle').on('click', function () {
        if ($(this).hasClass('historyon')) {
            console.log('close history mode');
            $('label').each(function () {
                $(this).removeClass('historying').off('click');
            });
        } else {
            console.log('open history mode');
            $('label').each(function () {

                $(this).addClass('historying').on('click', function () {

                	var history = new History({
                		el: this, 
                		projectID: global.QueryString.projectID
                	});
                	history.loadHistory();

                });
            });
        }
        $(this).toggleClass('historyon');
    });

});
