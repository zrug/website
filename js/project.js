// "/Projects/AddProject"

var Project = function (options) {
    this.opt = $.extend({}, options);
    this.content = $('.content');
    this.inModify = false;

    this.init = function (options) {

        if (options && options.projectID) {
            console.log('init project data with id: ' + options.projectID);

            this.initSectionNav(options.projectID);

            var url = "/Projects/" + global.getToken() + "?projectID=" + options.projectID;
            var _this = this;

            $.ajax({
                url: global.serviceUrl + url,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (msg) {
                    console.log(msg.d);
                    if (msg.d && msg.d.status) {

                        if (msg.d.status.statusCode == 200) {
                            console.log("project GET success");
                            _this.fillContentFromJsonData(msg.d.data[0]);
                            _this.whichStage(msg.d.data[0]);
                        }

                    } else {
                        console.log("project GET failed Code:" + msg.d.status.statusCode + ", text:" + msg.d.status.errors);
                    }

                },
                error: function (msg) {
                    console.log("project GET failed: " + msg.statusText);
                }
            });

        } else {
            console.log('new project');
            this.whichStage();
        }
    }
    this.init(options);
};

Project.prototype.modify = function () {
    this.inModify = true;
    console.log('modify ing project');
}
Project.prototype.dateToData = function (date, time) {
    if (date) {
        time = time || '00:00:00';
        var value = (new Date(date + ' ' + time)).valueOf();
        if (isNaN(value)) {
            return '-1';
        } else {
            return '/Date(' + value + '+0800)/';
        }
    } else {
        return undefined;
    }
}
Project.prototype.dataToDate = function (data) {
    var v = eval('new ' + data.replace(/\//g, ''));
    return {
        'date': v.Format("yyyy/MM/dd"),
        'time': v.Format("hh:mm:ss")
    }
}

Project.prototype.addProjectToServer = function (data, successfunc, errorfunc) {
    var url = '/Projects/';
    var action = 'ADD';
    var _this = this;
    if (this.inModify) {
        action = 'MODIFY';
        if (!data.data) data.data = {};
        data.data.projectID = this.opt.projectID;
    }
    console.log(action + ' projectToServer url:' + url);

    var dataStringify = JSON.stringify(data);
    console.log(dataStringify);

    $.ajax({
        url: global.serviceUrl + url,
        type: (this.inModify) ? "PUT" : "POST",
        contentType: "application/json; charset=utf-8",
        data: dataStringify,
        dataType: "Json",
        success: function (msg) {
            console.log("project post success");
            console.log(msg);
            if (msg && msg.d && msg.d.data[0] && msg.d.status && msg.d.status.statusCode == 200) {
                if (_this.contacts) {
                    _this.contacts.postToServer({
                        projectID: (msg.d.data[0].projectID || _this.opt.projectID),
                        projectName: data.projectName
                    });
                }
                if (_this.photos) {
                    _this.photos.postToServer({
                        projectID: (msg.d.data[0].projectID || _this.opt.projectID)
                    });
                }
                alert('项目信息保存成功');
                // location.href = 'modiProject.html?projectID='+msg.d.data[0].projectID;
                location.href = global.inTests ? '#':'allProject.html';

            } else {

            }

        },
        error: function (msg) {
            _this.inSave = false;
            if (errorfunc)
                errorfunc();
        }
    });
};

Project.prototype.fillContentFromJsonData = function (data) {
    if (!data) return;
// console.log('fillContentFromJsonData');
    // console.log(data);

    this.data = data;
    var _this = this;
    this.content.find(".field").each(function () {

        // fill value to field one by one
        var valuetype = $(this).attr('valuetype');
        var fieldid = $(this).attr('fieldId');
        var $els = $('.field-' + fieldid);
        var value = data[fieldid];

        $(this).data('originalValue', value);
        if (value != undefined) {
            $els.each(function () {
                $el = $(this);

                switch (valuetype) {
                    case 'string':
                        if ($el.hasClass('tagSele')) {
                            $el.tagSeleVal(value);
                        } else {
                            $el.val(value);
                            if ($el.find('option').length > 0) {
                                $el.removeClass('gray').change();
                            }
                        }
                        break;
                    case 'number':
                        $el.val(value);
                        break;
                    case 'bool':
                        // TODO: bool T or F -> string 0 or 1
                        value = (value) ? '1' : '0';
                        if ($el.hasClass('tagSele')) {
                            $el.tagSeleVal(value);
                        } else {
                            $el.val(value);
                        }
                        break;
                    case 'date':
                        var conv = _this.dataToDate(value);
                        if ($el[0].tagName == 'DIV') {
                            $el.text(conv.date).data('time', conv.time);
                        } else {
                            $el.val(conv.date).data('time', conv.time);
                        }
                        break;
                }
            });

        }

    });
    // console.log('longitude:' + data.longitude + ', latitude:' + data.latitude);
    if (data.longitude && data.latitude) {
        var point = {
            longitude: data.longitude,
            latitude: data.latitude
        };
        $('.btn-openmap').data('geo', point);
    }

}

Project.prototype.getJsonDataFromContent = function (pageContent) {
    var data = {}, _this = this;
    var validate = true;

    pageContent.find(".field").each(function () {

        // checking field values one by one
        var $el = $(this), value;
        var valuetype = $el.attr('valuetype');
        var fieldid = $el.attr('fieldId');
        _this.canPass($el);

        var originalValue = $el.data('originalValue');

        switch (valuetype) {
            case 'string':
                if ($el.hasClass('tagSele')) {
                    value = $el.tagSeleVal();
                } else {
                    value = $el.val();
                }
                if (value && value.length > 0) {
                    if (originalValue != value)
                        data[fieldid] = value;
                }
                break;
            case 'number':
                value = $el.val();
                if (value && value.length > 0) {
                    if (isNaN(value)) {
                        validate = false;
                        _this.canNotPass($el);
                    } else {
                        if (originalValue != value)
                            data[fieldid] = value;
                    }
                }
                break;
            case 'bool':
                if ($el.hasClass('tagSele')) {
                    value = $el.tagSeleVal();
                } else {
                    value = $el.val();
                }
                if (value && value.length > 0) {
                    if (originalValue != value)
                        data[fieldid] = value;
                }
                break;
            case 'date':
                value = _this.dateToData($el.val(), $el.data('time'));
                if (value === '-1') {
                    validate = false;
                    _this.canNotPass($el);
                } else {
                    if (value) {
                        if (originalValue != value)
                            data[fieldid] = value;
                    }
                }
                break;
        }
    });
// console.log($('.btn-openmap').data('geo'));

    if ($('.btn-openmap').data('geo')) {
        var point = $('.btn-openmap').data('geo');
        data['longitude'] = point.longitude;
        data['latitude'] = point.latitude;
    }

    return {
        data: data,
        validate: validate
    };
}
Project.prototype.boolValidate = function (value1, value2) {
    var parse = function (v) {
        return ( v==1 || v=='1' || v==true || v=='true');
    }
    return (parse(value1) == parse(value2));
}

Project.prototype.canNotPass = function ($el) {
    $el.addClass('red-border');
}

Project.prototype.canPass = function ($el) {
    $el.removeClass('red-border');
}

Project.prototype.initSectionNav = function (projectID) {
    // $('.append_ProjectId').each(function () {
    //     var href = $(this).attr('href');
    //     $(this).attr({'href': href + '?projectID=' + projectID});
    // });
}
Project.prototype.whichStage = function (data) {
    var progress = 1;
    if (data) {
        if (data.landName ||
                data.landAddress ||
                data.city ||
                data.district ||
                data.province ||
                data.area ||
                data.plotRatio ||
                data.latitude ||
                data.longitude ||
                data.usage ||
                data.projectName ||
                data.description ||
                data.expectedStartTime ||
                data.investment ||
                data.areaOfStructure ||
                data.storeyHeight ||
                data.foreignInvestment ||
                data.ownerType
        ) {
            progress = 1;            
        }
        if (data.mainDesignStage ||
                data.expectedFinishTime ||
                data.expectedConstructionTime ||
                data.propertyAirCondition ||
                data.propertyElevator ||
                data.propertyExternalWallMeterial ||
                data.propertyHeating ||
                data.propertyStealStructure
            ) {
            progress = 2;
        }
        if (data.actualStartTime ||
                data.fireControl ||
                data.green
            ) {
            progress = 3;
        }
        if (data.decorationProgress ||
                data.decorationSituation ||
                data.electroweakInstallation
            ) {
            progress = 4;
        }

    }
    // progress = 1;
    $('.progress-bar-body').addClass('percent' + ((progress-1)*20));
    for (var i = 1; i <= progress; i++) {
        $('.stages-code.stage' + i).addClass('active');
    }
}

Project.prototype.doSave = function () {
    $('.btn-save').off('click').removeClass('active');
    var result = project.getJsonDataFromContent( project.content );
    if (result.validate) {
        var _this = this;
        // save project
        project.addProjectToServer({
            "data":result.data,
            "token": ($.cookie('token') || global.test_token)
        });
    } else {
        console.log('validate is false');
        var pop = new PopingView();
        pop.show({
            view: "errorView",
            parent: '.wrapper',
            text: "数据格式填写错误，已用红色标出，请修改！",
            timeout: 4000,
            css: {
                top: '760px',
                left: '106px'
            }
        }, function () {
            $('.btn-save').addClass('active').on('click', project.doSave);
        });
    }
}

Project.prototype.install = function (key, obj) {
    this[key] = obj;
}


$(function () {

    // 初始化控件
    stateSelectorInit("province", "city", "district");

    // 初始化项目信息
    project = new Project({
        projectID: global.QueryString.projectID
    });

    // 加载基础联系人控件
    if (typeof ContactsRows === "function") {
        project.contacts = new ContactsRows({
            view: $('.contact-section'),
            projectID: global.QueryString.projectID
        });
    }
    // 加载照片控件
    if (typeof PhotosRows === "function") {
        project.photos = new PhotosRows({
            view: $('.photo-section'),
            projectID: global.QueryString.projectID
        });
    }

    // 转select为多选
    $('.tagSele').tagSele();

    // 初始化selectmenu样式
    $('.selectmenu').selectmenu();

    $('.btn-openmap').mapapi();

    // select 未选择时为灰色
    // $('select').on('change', function () {
    //     $(this).removeClass('gray').addClass('black');
    // });
    // select 不为灰色
    $('select').removeClass('gray');

    // 绑定Sheets
    $('.content-trigger').on('click', function () {
        var $this = $(this);
        $this.addClass('active').siblings().removeClass('active');
        $( $this.attr('ref') + '.' + $this.attr('page') ).show().siblings().hide();
    });

    // 绑定Pages
    $('.page-trigger').on('click', function () {
        var progress = $(this).attr('index')*1;
        $(this).parent().addClass('active').siblings('.stages-name').removeClass('active');
        $('.page-wrapper').hide();
        $('.page-wrapper-'+progress).show();
    });
    $('.page-trigger:first').click();

    // 保存及发布
    $('.btn-save').disableSelection().on('click', project.doSave);

    // 某些字段具有联动修改功能
    $('.field').each(function () {
        var $this = $(this);
        if ($this.attr('twins')) {
            var twinsId = $this.attr('twins');
            $this.on('change', function () {
                $('.field-' + twinsId).each(function () {
                    if ($(this)[0].tagName == 'DIV') {
                        $(this).text($this.val());
                    } else {
                        $(this).val($this.val());
                    }
                });
            })
        }
    });

    // 启动日历插件
    $('.datepicker').datepicker({
        showButtonPanel: true,
        changeMonth: true,
        changeYear: true,
        showOptions: { direction: "down" }
    });

});






