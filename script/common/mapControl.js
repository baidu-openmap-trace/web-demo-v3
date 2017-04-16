/* globals BMap */
/* globals map */
/* globals BMapLib */
/* globals mapv */
/* globals dataSet */
/* eslint-disable fecs-camelcase */
/**
 * @file 初始化地图样式和组件
 * @author 崔健 cuijian03@baidu.com 2016.08.22
 */

// import ZoomControl from 'zoomControl'
import TrackAction from '../modules/trackcontrol/actions/trackAction';

window.mapControl = {
    /**
     * 初始化地图
     *
     */
    initMap: function() {
        let that = this;
        let infoBoxScript = document.createElement('script');
        infoBoxScript.src = 'http://api.map.baidu.com/library/InfoBox/1.2/src/InfoBox_min.js';
        document.getElementsByTagName('head')[0].appendChild(infoBoxScript);
        let canvasScript = document.createElement('script');
        canvasScript.src = __uri('/static/javascript/CanvasLayer.js');
        document.getElementsByTagName('head')[0].appendChild(canvasScript);
        let mapvScript = document.createElement('script');
        mapvScript.src = 'http://mapv.baidu.com/build/mapv.js';
        document.getElementsByTagName('head')[0].appendChild(mapvScript);
        mapvScript.onload = function () {
            that.initBoundsearch();
        };
        window.map = new BMap.Map("mapContainer", {enableMapClick: false});    // 创建Map实例
        map.centerAndZoom(new BMap.Point(116.404, 39.915), 10);  // 初始化地图,设置中心点坐标和地图级别
        map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
        this.initLocation();
        this.initControl();
        this.initOverlay();
    },

    initBoundsearch() {
        map.addEventListener('zoomend', function () {
            TrackAction.boundsearchentity();
        });
        map.addEventListener('moveend', function () {
            TrackAction.boundsearchentity();
        });
        map.addEventListener('movestart', function () {
        });
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
        this.initTrackPointOverlay();
    },
    /**
     * 添加城市列表控件
     *
     */
    addCityListControl: function() {
        var size = new BMap.Size(360, 72);
        map.addControl(new BMap.CityListControl({
            anchor: BMAP_ANCHOR_TOP_LEFT,
            offset: size
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
            this.defaultOffset = new BMap.Size(15, 90);
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
            this.defaultOffset = new BMap.Size(15, 197);
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
            this.defaultOffset = new BMap.Size(15, 159);
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
            this.defaultOffset = new BMap.Size(15, 235);
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
    },

    /**
     * 初始化轨迹点信息覆盖物
     *
     */
    initTrackPointOverlay() {
        this.trackPointOverlay = function (point, type) {
            this._point = point;
            // this.type = 'trackpoint';
            this.type = type;
        };
        this.trackPointOverlay.prototype = new BMap.Overlay();
        this.trackPointOverlay.prototype.initialize = function (map) {
            let that = this;
            this._map = map;
            let div = this._div = document.createElement('div');
            // div.className = 'trackpointOverlay';
            div.className = this.type;
            let innerDiv = document.createElement('div');
            innerDiv.className = 'trackpoint_in';
            div.appendChild(innerDiv);
            map.getPanes().labelPane.appendChild(div);
            return div;
        };
        this.trackPointOverlay.prototype.draw = function () {
            let map = this._map;
            let pixel = map.pointToOverlayPixel(this._point);
            this._div.style.left = pixel.x - 8 + 'px';
            this._div.style.top  = pixel.y  - 8 + 'px';
        };
    },

    /**
     * 添加轨迹点信息覆盖物
     *
     * @param {Object} point 点
     * @param {string} type 点类型
     */
    addTrackPointOverlay(point, type) {
        let myCompOverlay = new this.trackPointOverlay(point, type);
        map.addOverlay(myCompOverlay);
    },

    /**
    * 删除轨迹点信息覆盖物
    *
    * @param {string} type 类型，分为鼠标浮动和点击两种
    */
    removeTrackPointOverlay(type) {
        let overlays = map.getOverlays();
        let length = overlays.length;
        let trackPointOverlays = [];
        for (let i = 0; i < length; i++) {
            if (overlays[i].type === type) {
                trackPointOverlays.push(overlays[i]);
            }
        }
        for (let j = 0; j < trackPointOverlays.length; j++) {
            map.removeOverlay(trackPointOverlays[j]);
        }
    },

    /**
     * 初始化车辆信息详情和轨迹点详情infobox
     *
     * @param {Object} data 数据
     */
    setMonitorInfoBox(data) {
        let infoContentFrontArr = [
            '<div class="carInfoWindow">',
                '<div class="carInfoHeader' + data.entity_status + '">',
                    '<abbr title="' + data.entity_print + '">',
                    data.entity_print,
                    '</abbr>',
                '</div>',
                '<div class="carInfoContent">'
        ];
        data.infor.map(function (item) {
            let itemPushArr = [
                '<div class="carInfoItem">',
                    '<div class="infoItemTitle">',
                        item[0],
                    '</div>',
                    '<div class="infoItemContent">',
                        item[1],
                    '</div>',
                '</div>'
            ];
            infoContentFrontArr.push(itemPushArr.join(''));
        });
        let infoContentNextArr = [
            '</div>',
            '<div class="infoControl">',
                '<div class="infoZoomIn" id="monitorInfoZoomIn">',
                    '放大',
                '</div>',
            '</div>',
            '</div>'
        ];
        this.monitorInfoBox = new BMapLib.InfoBox(
            map,
            infoContentFrontArr.concat(infoContentNextArr).join(''),
            {
                boxClass: 'carInfoBox',
                // boxStyle:{background:"url('tipbox.gif') no-repeatcenter top",width: "200px"},
                closeIconMargin: '15px 20px 0 0',
                alignBottom: false,
                closeIconUrl: __uri('/static/images/closeinfowindow.png')
            }
        );
        this.monitorInfoBox.addEventListener('close', function (e) {
            TrackAction.closemonitorinfobox();
        });
        this.monitorInfoBox.open(this.entityMarker);
        $('#monitorInfoZoomIn').click(function (e) {
            // this.monitorInfoBox.hide();
            map.zoomIn();
            map.addEventListener('moveend', function () {
                // that.monitorInfoBox.show();
            });
        });
    },

    /**
     * 删除infobox
     *
     */
    removeMonitorInfoBox() {
        map.removeOverlay(this.monitorInfoBox);
        this.monitorInfoBox = null;
    },

    /**
     * 设置设备监控的marker
     *
     * @param {Object} data marker的数据信息
     * @param {number} service_type 服务类型
     */
    setEntityMarker(data, service_type) {
        let that = this;
        let point = new BMap.Point(data.point[0], data.point[1]);
        let iconUrl = '';
        let size;
        let imageSize;
        let status = data.status;
        if (service_type === 1) {
            size = new BMap.Size(41, 34);
            imageSize = new BMap.Size(41, 34);
            switch (status.substring(0, 2)) {
                case '离线':
                    iconUrl = __uri('/static/images/caroffnorth.png');
                    break;
                case '静止':
                    iconUrl = __uri('/static/images/carstaticnorth.png');
                    break;
                default:
                    iconUrl = __uri('/static/images/carrunnorth.png');
                    break;
            }
        } else {
            size = new BMap.Size(22, 27);
            imageSize = new BMap.Size(22, 27);
            switch (status.substring(0, 2)) {
                case '离线':
                    iconUrl = __uri('/static/images/othertypeoffline.png');
                    break;
                case '静止':
                    iconUrl = __uri('/static/images/othertypestatic.png');
                    break;
                default:
                    iconUrl = __uri('/static/images/othertype.png');
                    break;
            }
        }
        let icon = new BMap.Icon(iconUrl, size);
        icon.setImageSize(imageSize);
        this.entityMarker = new BMap.Marker(point, {icon: icon});
        this.entityMarker.setRotation(data.direction);
        this.entityMarker.addEventListener('click', function (e) {
            that.monitorInfoBox.open(that.entityMarker);
        });
        map.addOverlay(this.entityMarker);
        // 如果是定时器触发的，那么不移动地图
        if (!data.interval) {
            map.panTo(point);
        }
    },

    /**
     * 根据entity的类型和状态获取图标
     *
     * @param {number} type service类型
     * @param {Object} data entity的数据
     * @return {string} entity的icon地址
     */
    getEntityIcon(type, data) {
        let img = new Image();
        let iconUrl = '';
        let height = 0;
        let width = 0;
        // console.log(data);
        let status = data.status;
        if (type === 1) {
            height = 41;
            width = 34;
            switch (status) {
                case '离线':
                    iconUrl = __uri('/static/images/caroffnorth.png');
                    break;
                case '静止':
                    iconUrl = __uri('/static/images/carstaticnorth.png');
                    break;
                default:
                    iconUrl = __uri('/static/images/carrunnorth.png');
                    break;
            }
        } else {
            height = 22;
            width = 27;
            switch (status) {
                case '离线':
                    iconUrl = __uri('/static/images/othertypeoffline.png');
                    break;
                case '静止':
                    iconUrl = __uri('/static/images/othertypestatic.png');
                    break;
                default:
                    iconUrl = __uri('/static/images/othertype.png');
                    break;
            }
        }
        img.src = iconUrl;
        img.style.width = width;
        img.style.height = height;
        return img;
    },

    /**
     * 删除设备监控的marker,
     *
     */
    removeEntityMarker() {
        map.removeOverlay(this.entityMarker);
        this.entityMarker = null;
    },

    /**
     * 初始化车辆信息详情和轨迹点详情infobox
     *
     * @param {Object} data 数据
     */
    setTrackInfoBox(data) {
        // console.log(data);
        let infoContentFrontArr = [
            '<div class="carInfoWindow">',
                '<div class="carInfoHeader0">',
                    '<abbr title="' + data.print + '">',
                    data.print,
                    '</abbr>',
                '</div>',
                '<div class="carInfoContent">'
        ];
        data.infor.map(function (item) {
            let itemPushArr = [
                '<div class="carInfoItem">',
                    '<div class="infoItemTitle">',
                        item[0],
                    '</div>',
                    '<div class="infoItemContent">',
                        item[1],
                    '</div>',
                '</div>'
            ];
            infoContentFrontArr.push(itemPushArr.join(''));
        });
        let infoContentNextArr = [
            '</div>',
            '<div class="infoControl">',
                '<div class="infoZoomIn" id="trackInfoZoomIn">',
                    '放大',
                '</div>',
            '</div>',
            '</div>'
        ];
        // return;

        this.trackInfoBox = new BMapLib.InfoBox(
            map,
            infoContentFrontArr.concat(infoContentNextArr).join(''),
            {
                boxClass:'carInfoBox',
                closeIconMargin: '15px 20px 0 0',
                alignBottom: false,
                closeIconUrl: __uri('/static/images/closeinfowindow.png')
            }
        );
        this.trackInfoBox.open(data.point);
        $('#trackInfoZoomIn').click(function (e) {
            // this.trackInfoBox.hide();
            map.zoomIn();
            map.addEventListener('moveend', function () {
                // that.trackInfoBox.show();
            });
        });
        // this.trackInfoBox.addEventListener('close', this.removeTrackPointOverlay('trackpointonOverlay'));
        map.panTo(data.point);
    },

    /**
     * 删除infobox
     *
     */
    removeTrackInfoBox() {
        map.removeOverlay(this.trackInfoBox);
        this.trackInfoBox = null;
    },

    /**
     * 设置boundsearch展示
     *
     * @param {Array} markerArr 展示数据
     * @param {Object} MarkerOption 数据样式
     */
    setBoundSearch(markerArr, MarkerOption) {
        let overlays = map.getOverlays();
        if (window.dataSet && window.mapvLayer && overlays.length !== 0) {

            window.dataSet.set(markerArr);
        } else {
            window.dataSet = new mapv.DataSet(markerArr);
            let options = {

                methods: {
                    click(item) {
                        if (item === null) {
                            return;
                        }
                        TrackAction.selectcar(item.entity_name, item.entity_status, '');
                    }
                },
                size: 20,
                draw: 'icon',
                height: MarkerOption.height,
                width: MarkerOption.width
            };
            window.mapvLayer = new mapv.baiduMapLayer(map, dataSet, options);
        }
    }
}

