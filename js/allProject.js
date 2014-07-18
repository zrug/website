global.scrollingLoader = {
    index: 0,
    pageSize: 12,
    identify: 0
};

$(function () {
    console.log('user: ' + $.cookie('userID') + ' token: ' + $.cookie('token') );

    projectCardLoader(global.scrollingLoader.index, global.scrollingLoader.pageSize)

    $(window).scroll(function () {
        // console.log( 'windiow: ' + ($(window).scrollTop() + $(window).height()) + ' content: ' + ($('.content').offset().top + $('.content').height()) );
        if ($(window).scrollTop() + $(window).height() >= 
            $('.content').offset().top + $('.content').height() ) { 

            if ( global.scrollingLoader.identify >= $(window).scrollTop()-100 && global.scrollingLoader.identify <= $(window).scrollTop()+100 ) {
                // console.log('in loading');
            } else {
                global.scrollingLoader.identify = $(window).scrollTop();

                global.scrollingLoader.index += global.scrollingLoader.pageSize;
                projectCardLoader(global.scrollingLoader.index, global.scrollingLoader.pageSize)
            }
        }
    });
});

var projectCardLoader = function (index, pageSize) {

    var makeProjectCards = function (data) {
        var dataToDate = function (data) {
            if (!data) return "";
            var date = eval('new ' + data.replace(/\//g, ''));
            return date.getFullYear() + '-' + (date.getMonth()*1+1) + '-' + date.getDate();
        }
        var card = function (data) {
            var el = $('<dd class="porject-card"> \
                            <p class="gray" id="projectName"></p> \
                            <p class="" id="projectProgress"> \
                                <img src="images/projectCardSection1.png" id="projectSection" /> \
                            </p> \
                            <p class="" id="mapicon"></p> \
                            <p class="blue" id="investment-title">投资额</p> \
                            <p class="gray" id="investment"></p> \
                            <p class="blue" id="areaOfStructure-title">建筑面积</p> \
                            <p class="gray" id="areaOfStructure"></p> \
                            <p class="gray" id="expectedStartTime"></p> \
                            <p class="orange" id="expectedFinishTime"></p> \
                            <div class="fakemap" id="map"> \
                                <img src="images/fakemap.png" /> \
                            </div> \
                            <div class="mappoint" id=""></div> \
                            <p class="blue" id="district"></p> \
                            <p class="gray" id="province_city"></p> \
                        </dd>');

            el.find('#projectName').text(
                data.projectName ?
                ( data.projectName.length < 20 ? data.projectName : (data.projectName.substring(0, 19) + '...') ) : ''
            );
            el.find('#province_city').text(
                data.landAddress ?
                ( data.landAddress.length < 26 ? data.landAddress : (data.landAddress.substring(0, 25) + '...') ) : ''
            );
            el.find('#investment').text('￥' + (data.investment || "").toLocaleString());
            el.find('#areaOfStructure').text((data.areaOfStructure || "").toLocaleString() + '㎡');
            el.find('#expectedStartTime').text(dataToDate(data.expectedStartTime));
            el.find('#expectedFinishTime').text(dataToDate(data.expectedFinishTime));
            el.find('#district').text(data.district);
            el.attr({'ref': data.projectID});
            el.on('click', function () {
                var surl = 'modiProject.html?projectID=' + $(this).attr('ref');
                location.href = surl;
            });
            return el;
        };
        // $('.content dl dd').remove();
        $(data).each(function () {
            $('.content dl').append(card(this));
        });
        $('.endOfPage').show();
    }
    var url = '/Projects/' + ($.cookie('token') || global.test_token) + '?startIndex=' + index + '&pageSize=' + pageSize;
    console.log(global.serviceUrl + url);
    $.ajax({
        url: global.serviceUrl + url,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "Json",
        success: function (msg) {
            console.log(msg.d);
            if (msg.d.status.statusCode == -1) {
                console.log('THE ERROR: ' + msg.d.status.errors);
                // location.href = "login.html";
            }
            makeProjectCards(msg.d.data);
        },
        error: function (msg) {
        },
    })

};
