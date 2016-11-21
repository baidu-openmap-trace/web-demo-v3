/**
 * @file 初始化地图样式和组件
 * @author 崔健 cuijian03@baidu.com 2016.08.22
 */

// import ZoomControl from 'zoomControl'

window.mapControl = {
    /**
     * 初始化地图
     *
     */
    initMap: function() {
        var script = document.createElement('script');
        script.src = 'http://api.map.baidu.com/library/InfoBox/1.2/src/InfoBox_min.js';
        document.getElementsByTagName('head')[0].appendChild(script);
        var script = document.createElement('script');
        script.src = __uri('/static/javascript/CanvasLayer.js');
        document.getElementsByTagName('head')[0].appendChild(script);
        window.map = new BMap.Map("mapContainer", {enableMapClick: false});    // 创建Map实例
        map.centerAndZoom(new BMap.Point(116.404, 39.915), 14);  // 初始化地图,设置中心点坐标和地图级别
        map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
        this.initLocation();
        this.initControl();
        this.initOverlay();
    },
    mapReady: 0,
    dataReady: 0,
    bigdata: '',
    
    /**
     * 设置大数据
     *
     */
    setBigData: function(data) {
        this.bigdata = data;
        this.dataReady = 1;
        this.drawBigData();
    },
    /**
     * 绘制大数据
     *
     */
    drawBigData: function() {
        if (this.mapReady + this.dataReady === 2){
            // console.log('draw');
            var data = [];
            var timeData = [];
            var bmapPoint = [];
            var projection = new BMap.MercatorProjection();

            this.bigdata = this.bigdata.split("\n");
            for (var i = 0; i < this.bigdata.length; i++) {
                var item = this.bigdata[i].split(',');
                var coordinates = [];
                for (var j = 0; j < item.length; j += 2) {
                    coordinates.push([item[j], item[j + 1]]);
                    var pixel = new BMap.Pixel(item[j], item[j + 1])
                    var point = projection.pointToLngLat(pixel);
                    bmapPoint.push(point);
                    timeData.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [item[j], item[j + 1]]
                        },
                        count: 1,
                        time: j
                    });
                }
                data.push({
                    geometry: {
                        type: 'LineString',
                        coordinates: coordinates
                    },
                    count: 30 * Math.random()
                });
                
            }
            if(bmapPoint.length > 1) {
                datamap.setViewport(bmapPoint);
            }
            var dataSet = new mapv.DataSet(data);

            var options = {
                strokeStyle: 'rgba(53,57,255,0.5)',
                coordType: 'bd09mc',
                // globalCompositeOperation: 'lighter',
                shadowColor: 'rgba(53,57,255,0.2)',
                shadowBlur: 3,
                lineWidth: 3.0,
                draw: 'simple'
            }

            var mapvLayer = new mapv.baiduMapLayer(datamap, dataSet, options);


            var dataSet = new mapv.DataSet(timeData);

            var options = {
                fillStyle: 'rgba(255, 250, 250, 0.2)',
                coordType: 'bd09mc',
                globalCompositeOperation: "lighter",
                size: 1.5,
                animation: {
                    steps: 100,
                    trails: 1,
                    duration: 5,
                },
                draw: 'simple'
            }

            var mapvLayer = new mapv.baiduMapLayer(datamap, dataSet, options);
        } else {
            // console.log('nodraw');
        }
        var currentTime = Math.round(new Date().getTime() / 1000);
        if (currentTime >= 1477238400 && currentTime <= 1478448000) {
            var gobtn = $('#gobtn');
            gobtn.show();
            gobtn.addClass('animated wobble');
            gobtn.css('animation-iteration-count', 3);
        }
    },
    /**
     * 根据浏览器定位确定地图位置
     *
     */
    initLocation: function() {
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                map.panTo(r.point);
            }
            else {
                
            }        
        },
        {
            enableHighAccuracy: true
        });
    },
    /**
     * 添加控件
     *
     */
    initControl: function() {
        this.addCityListControl();
        this.addZoomControl();
        this.initTrafficControl();
        this.addMapTypeControl();
        this.initSpeedControl();
        this.showTrafficControl();
    },
    /**
     * 初始化自定义覆盖物
     *
     */
    initOverlay: function() {
        this.initBehaviorOverlay();
    },
    /**
     * 添加城市列表控件
     *
     */
    addCityListControl: function() {
       var size = new BMap.Size(360, 72);
       map.addControl(new BMap.CityListControl({
           anchor: BMAP_ANCHOR_TOP_LEFT,
           offset: size,
       }));
    },
    /**
    * 添加缩放控件
    *
    */
    addZoomControl: function() {
        /**
         * 自定义缩放控件
         *
         */
        var ZoomControl = function (){
            // 默认停靠位置和偏移量
            this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
            this.defaultOffset = new BMap.Size(15, 70);
        }

        // 通过JavaScript的prototype属性继承于BMap.Control
        ZoomControl.prototype = new BMap.Control();

        // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
        // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
        ZoomControl.prototype.initialize = function(map){
            var zoom = document.createElement("div");
            zoom.className = 'zoom';
            var zoomIn = document.createElement("div");
            zoomIn.className = 'zoomIn';
            var zoomOut = document.createElement("div");
            zoomOut.className = 'zoomOut';
            zoom.appendChild(zoomIn);
            zoom.appendChild(zoomOut);
            zoomIn.onclick = function (e) {
                map.zoomIn();
            };
            zoomOut.onclick = function (e) {
                map.zoomOut();
            }
            // 添加DOM元素到地图中
            map.getContainer().appendChild(zoom);
            // 将DOM元素返回
            return zoom;
        }

        // 创建控件
        var myZoomCtrl = new ZoomControl();
        // 添加到地图当中
        map.addControl(myZoomCtrl);
    },
    /**
    * 添加交通流量控件
    *
    */
    initTrafficControl: function() {
        var trafficLayer;
        /**
         * 自定义交通流量控件
         *
         */
        this.TrafficControl = function (){
            // 默认停靠位置和偏移量
            this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
            this.defaultOffset = new BMap.Size(15, 177);
        }

        // 通过JavaScript的prototype属性继承于BMap.Control
        this.TrafficControl.prototype = new BMap.Control();

        // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
        // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
        this.TrafficControl.prototype.initialize = function(map){
            var traffic = document.createElement("div");
            traffic.className = 'trafficOn';
            traffic.onclick = function (e) {
                if (traffic.className.indexOf('trafficOn') > -1) {
                    trafficLayer = new BMap.TrafficLayer();
                    map.addTileLayer(trafficLayer);
                    traffic.className = traffic.className.replace(/trafficOn/, 'trafficOff');
                } else {
                    map.removeTileLayer(trafficLayer);
                    traffic.className = traffic.className.replace(/trafficOff/, 'trafficOn');
                }
            };
            // 添加DOM元素到地图中
            map.getContainer().appendChild(traffic);
            // 将DOM元素返回
            return traffic;
        }

    },
    /**
    * 添加地图类型控件
    *
    */
    addMapTypeControl: function() {
        /**
         * 自定义交通流量控件
         *
         */
        var MapTypeControl = function (){
            // 默认停靠位置和偏移量
            this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
            this.defaultOffset = new BMap.Size(15, 139);
        }

        // 通过JavaScript的prototype属性继承于BMap.Control
        MapTypeControl.prototype = new BMap.Control();

        // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
        // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
        MapTypeControl.prototype.initialize = function(map){
            var mapType = document.createElement("div");
            mapType.className = 'earth';
            mapType.onclick = function (e) {
                if (mapType.className.indexOf('earth') > -1) {
                    map.setMapType(BMAP_HYBRID_MAP);
                    mapType.className = mapType.className.replace(/earth/, 'normal');
                } else {
                    map.setMapType(BMAP_NORMAL_MAP); 
                    mapType.className = mapType.className.replace(/normal/, 'earth');
                }
            };
            // 添加DOM元素到地图中
            map.getContainer().appendChild(mapType);
            // 将DOM元素返回
            return mapType;
        }

        // 创建控件
        var myMapTypeCtrl = new MapTypeControl();
        // 添加到地图当中
        map.addControl(myMapTypeCtrl);
    },
    /**
    * 初始化速度标识控件
    *
    */
    initSpeedControl: function() {
        /**
         * 自定义速度空间
         *
         */
        this.SpeedControl = function (){
            // 默认停靠位置和偏移量
            this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
            this.defaultOffset = new BMap.Size(15, 215);
        }

        // 通过JavaScript的prototype属性继承于BMap.Control
        this.SpeedControl.prototype = new BMap.Control();

        // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
        // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
        this.SpeedControl.prototype.initialize = function(map){
            var speedControl = document.createElement("div");
            speedControl.className = 'speedControl';
            
            // 添加DOM元素到地图中
            map.getContainer().appendChild(speedControl);
            // 将DOM元素返回
            return speedControl;
        }
    },
    /**
    * 显示速度控件
    *
    */
    showSpeedControl: function() {
         // 创建控件
        this.mySpeedControl = new this.SpeedControl();
        // 添加到地图当中
        map.addControl(this.mySpeedControl);
    },
    /**
    * 删除速度控件
    *
    */
    removeSpeedControl: function() {
        map.removeControl(this.mySpeedControl);
    },
    /**
    * 显示路况控件
    *
    */
    showTrafficControl: function() {
        // 创建控件
        this.myTrafficCtrl = new this.TrafficControl();
        // 添加到地图当中
        map.addControl(this.myTrafficCtrl);
    },
    /**
    * 删除路况控件
    *
    */
    removeTrafficControl: function() {
        map.removeControl(this.myTrafficCtrl);
    },
    /**
    * 添加驾驶行为覆盖物
    *
    */
    addBehaviorOverlay: function(point, type, data) {
        var myCompOverlay = new this.behaviorOverlay(point, type, data);
        map.addOverlay(myCompOverlay);
    },
    /**
    * 删除驾驶行为覆盖物
    *
    */
    removeBehaviorOverlay: function() {
        var overlays = map.getOverlays();
        var length = overlays.length;
        var behaviorOverlays = [];
        for(var i = 0; i < length; i++) {
            if(overlays[i].type === 'behavior') {
                behaviorOverlays.push(overlays[i]);
            }
        }
        for(var j = 0; j < behaviorOverlays.length; j++) {
            map.removeOverlay(behaviorOverlays[j]);
        }
    },
    /**
     *
     * 设置驾驶行为覆盖物可见性
     * @param {array} data 驾驶行为可见配置
     */
    updataBehaviorDisplay: function(data) {
        var overlays = map.getOverlays();
        for (var j = 0; j < overlays.length; j++) {
            switch (overlays[j]._type) {
                case 'behaviorPlace':
                    if(data[3] === '0') {
                        overlays[j].hide();
                    } else {
                        overlays[j].show();
                    }
                break;
                case 'behaviorAccelecation':
                case 'behaviorBreaking':
                    if(data[1] === '0') {
                        overlays[j].hide();
                    } else {
                        overlays[j].show();
                    }
                break;
                case 'behaviorSteering':
                    if(data[2] === '0') {
                        overlays[j].hide();
                    } else {
                        overlays[j].show();
                    }
                break;
                case 'behaviorSpeeking':
                    if(data[0] === '0') {
                        overlays[j].hide();
                    } else {
                        overlays[j].show();
                    }
                break;
            }
            
        }

    },
    /**
     * 初始化驾驶行为覆盖物
     *
     */
    initBehaviorOverlay: function() {
        this.behaviorOverlay = function(point, type, data) {
            this._point = point;
            this._type = type;
            this._data = data;
            this.type = 'behavior';
        }
        this.behaviorOverlay.prototype = new BMap.Overlay();
        this.behaviorOverlay.prototype.initialize = function(map){
            var that = this;
            this._map = map;
            var div = this._div = document.createElement("div");
            div.className = 'behaviorOverlay ' + this._type;
            var text = document.createTextNode(that._data);
            div.appendChild(text);
            
            div.onmouseover = function(){
                switch (that._type) {
                    case 'behaviorPlace':
                        div.style.width = '120px';
                    break;
                    case 'behaviorSpeeking':
                        div.style.width = '142px'
                    break;
                    case 'behaviorSteering':
                    case 'behaviorAccelecation':
                    case 'behaviorBreaking':
                        div.style.width = '65px';
                    break
                }
                
                
                div.style.boxShadow = "0px 3px 3px #bcbcbb";
            }

            div.onmouseout = function(){
                div.style.width = '20px';
                div.style.boxShadow = "";
            }

            map.getPanes().labelPane.appendChild(div);
            
            return div;
        }
        this.behaviorOverlay.prototype.draw = function(){
            var map = this._map;
            var pixel = map.pointToOverlayPixel(this._point);
            this._div.style.left = pixel.x - 10 + "px";
            this._div.style.top  = pixel.y  - 10 + "px";
        }
        // 实现显示方法    
        this.behaviorOverlay.prototype.show = function(){    
         if (this._div){    
           this._div.style.display = "";    
         }    
        }      
        // 实现隐藏方法  
        this.behaviorOverlay.prototype.hide = function(){    
         if (this._div){    
           this._div.style.display = "none";    
         }    
        }
    }
}

