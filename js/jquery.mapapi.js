$.fn.mapapi = function () {

	var MapAPI = function (elem) {
		this.$el = $(elem);
		// this.geo = {
		// 	longitude: 121.480486,	// 经度
		// 	latitude: 31.236193	// 纬度
		// };

		this.setGeo = function (point) {
			this.geo = {
		    	longitude: point.lng,
		    	latitude: point.lat
		    };
		    this.$el.data('geo', this.geo);
		}

		this.map = function () {
			var _this = this;
			this.$el.on('click', function () {
				_this.$el.data('geo', _this.geo);
				_this.$input = $('.' + _this.$el.attr('ref'));
				_this.address = _this.$input.val();

				var map = new BMap.Map("map-container");            // 创建Map实例

				map.addControl(new BMap.NavigationControl({
					type: BMAP_NAVIGATION_CONTROL_ZOOM
				}));

				if (_this.address) {

				    var address = $('#district').val() + ' ' + $('#city').val() + ' ' + _this.address;
				    console.log("BMap Search: " + address);

				    var myGeo = new BMap.Geocoder();
					// 将地址解析结果显示在地图上,并调整地图视野
					myGeo.getPoint(address, function(point){
					  if (point) {
					  	$("#map-container").show();
					    map.centerAndZoom(point, 16);
					    _this.setGeo(point);
					    map.addOverlay(new BMap.Marker(point));
					  } else {
					  	if (_this.geo) {
					        map.centerAndZoom(new BMap.Point(_this.geo.longitude, _this.geo.latitude), 15); 
						    $("#map-container").show();
						} else {
							alert('百度地图找不到这个地址');
						}
					  }
					}, $('#district').val());

				} else if (_this.geo) {
			        map.centerAndZoom(new BMap.Point(_this.geo.longitude, _this.geo.latitude), 15); 
				    $("#map-container").show();
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
