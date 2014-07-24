$.fn.mapapi = function () {

	var MapAPI = function (elem) {
		this.$el = $(elem);
		// this.geo = {
		// 	longitude: 121.480486,	// 经度
		// 	latitude: 31.236193	// 纬度
		// };

		this.setGeo = function (point) {
			// console.log('setGeo: lng['+(point.longitude || point.lng)+'] lat['+(point.latitude || point.lat)+']');
			this.geo = {
		    	longitude: (point.longitude || point.lng),
		    	latitude: (point.latitude || point.lat)
		    };
		    this.$el.data('geo', this.geo);
		}

		this.search = function (map, address) {
		    // console.log("BMap Search: " + address);

		    var myGeo = new BMap.Geocoder();
			// 将地址解析结果显示在地图上,并调整地图视野
			var _this = this;
			myGeo.getPoint(address, function(point){
			  if (point) {
			    map.centerAndZoom(point, 16);
			    _this.setGeo(point);
			    map.addOverlay(new BMap.Marker(point));
			  } else {
				alert('百度地图找不到这个地址');
			  }
			}, $('#district').val());

		}
		this.locate = function (map, point) {
		    // console.log("BMap Geo: " + point.longitude + ", " + point.latitude);
		    var pp = new BMap.Point(point.longitude, point.latitude);
	        map.centerAndZoom(pp, 15);
	        map.addOverlay(new BMap.Marker(pp));
		}
		this.initMap = function (map) {
			// console.log("BMap init at shanghai");
	        map.centerAndZoom(new BMap.Point(121.480486, 31.236193), 15);
		}

		this.map = function () {
			var _this = this;

			this.$el.on('click', function () {
				if (_this.$el.data('geo')) {
					_this.setGeo(_this.$el.data('geo'));
				}

				_this.$input = $('.' + _this.$el.attr('ref'));
				_this.address = _this.$input.val();
				_this.origAddr = _this.$input.data('originalValue');

			    $("#map-container").show();
			    $("#map-container .icon-remove").on('click', function () {
			    	$("#map-container").hide();
			    	$(this).off('click');
			    });
				var map = new BMap.Map("map");            // 创建Map实例

				map.addControl(new BMap.NavigationControl({
					type: BMAP_NAVIGATION_CONTROL_ZOOM
				}));
				// console.log('origAddr:' + _this.origAddr + ', address:' + _this.address);
				// console.log('geo:' + _this.geo);

			    var address = $('#district').val() + ' ' + $('#city').val() + ' ' + _this.address;

				if (_this.address != _this.origAddr && _this.address != '') {
					_this.search(map, address);

				} else if (_this.geo) {
					_this.locate(map, _this.geo);

				} else if (_this.address) {
					_this.search(map, address);

				} else {
					_this.initMap(map);

				}


				map.addEventListener("click", function(e){
				    var pt = e.point;

					var gc = new BMap.Geocoder();
				    gc.getLocation(pt, function(rs){
				        var addComp = rs.addressComponents;
				    	if (confirm('确定使用该地址作为项目地块地址吗：\n' + 
				    			addComp.province + ', ' + addComp.city + ', ' + addComp.district + ', ' + 
				    			addComp.street + ', ' + addComp.streetNumber)) {

					        $('#district').val(addComp.province);
					        $('#district').change();
					        $('#province').val(addComp.city);
					        $('#province').change();
					        $('#city').val(addComp.district);
					        $('#city').change();
					        _this.$input.val(addComp.street + ", " + addComp.streetNumber);

						    _this.setGeo(pt);
						    $("#map-container").hide();
				    	}

				    });
				});

			});

		}
	}

	return this.each(function () {
		var el = new MapAPI(this);
		el.map();
	});

};
