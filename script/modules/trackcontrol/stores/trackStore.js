/**
 * @file 轨迹管理台Reflux Store
 * @author 崔健 cuijian03@baidu.com 2016.08.23
 */

import TrackAction from '../actions/trackAction'
import Urls from '../../../common/urls'
import Commonfun from '../../../common/commonfun'

var TrackStore = Reflux.createStore({
    listenables: [TrackAction],
    init: function() {
    },
    data: {
        // service名称
        service_name: '',
        // sercice类型
        service_type: 0,
        // 当前全部页码
        currentAllPage: 0,
        // 当前在线页码
        currentOnlinePage: 0,
        // 当前离线页码
        currentOfflinePage: 0,
        // 当前全部适配view entity数据
        allEntities: [],
        // 当前在线适配view entity数据
        onlineEntities: [],
        // 当前离线适配view entity数据
        offlineEntities: [],
        // 当前全部完整entity数据
        allCompleteEntities: [],
        // 当前在线完整entity数据
        onlineCompleteEntities: [],
        // 当前离线完整entity数据
        offlineCompleteEntities: [],
        // 当前检索关键字
        searchQuery: '',
        // 轨迹查询检索当前关键字
        searchQueryTrack: '',
        // 当前service自定义字段描述
        column: [],
        // 当前service自定字段key
        column_key: [],
        // // 当前地图中选中车辆
        selectCar: {},
        // 当前track列表
        trackList: [],
        // 当前track页码
        currentTrackPageIndex: 0,
        // 当前选中开始时间
        start_time: 0,
        // 当前结束时间
        end_time: 0,
        // 当前时间往前十分钟，作为检测在线离线时间
        onlineTime:  Math.ceil(new Date().getTime() / 1000) - 600,
        // 异步加载轨迹总长计数
        tracklistloadedConunt: 0,
        // 异步加载的选中的轨迹排序数据
        trackRouteSortData: [],
        // 实际返回给view的轨迹数据
        trackRoutePointData: [],
        // 实际返回过滤掉00点 
        trackRouteNoZero: [],
        //标记正在轨迹检索 0未检索 1正在检索
        trackSearching: 0,
        //标记正在停留点检索 0未检索 1正在检索
        staypointSearching: 0,
        //标记正在轨迹分析检索 0未检索 1正在检索
        analysisbehaviorSearching: 0,
        // 异步加载的选中的轨迹数据计数
        trackRouteDataCount: 0,
        // 当前选中的轨迹
        selectTrack: '',
        // 异步加载的停留点排序数据
        trackStayRouteSortData: [],
        // 实际返回给view的停留点数据
        trackStayRoutePointData: [],
        // 异步加载的停留点数据计数
        trackStayRouteDataCount: 0,
        // 轨迹纠偏状态对象
        trackProcess: {
            is_processed: '0',
            need_denoise: '1',
            need_vacuate: '1',
            need_mapmatch: '0',
            transport_mode: '1'
        },
        transport_mode: [
            'driving',
            'riding',
            'walking'
        ],
        // 异步加载的驾驶分析排序数据
        trackBehaviorSortData: [],
        // 实际返回给view的驾驶分析数据
        trackBehaviorPointData: {
            harsh_acceleration: [],
            harsh_breaking: [],
            harsh_steering: [],
            speeding: []
        },
        // 异步加载的驾驶分析数据计数
        trackBehaviorDataCount: 0,
        // 标记当前是否正在检索 0在检索 1否
        searchingAll: 0,
        searchingOnline: 0,
        searchingOffline: 0,
        selectCompleteEntities: [],
        // 按bound查找entity
        boundsEntity: [],
        // bound检索计数
        boundsEntityCount: 0,
        // 当前显示bound检索类型
        // 用户在切换全部，在线，离线时进行修改，bounds检索对应状态下的entity
        boundsType: 'all',
        // 是否开启范围检索
        switchBounds: false,
        // 当前的管理项，分为实时监控和轨迹查询
        managetab: 0,
        // boundsearch的时间戳
        boundsearchTimestamp: 0,
        // 三种类型的entity的total
        entityTotal: {
            all: 0,
            online: 0,
            offline: 0
        }
    },
    /**
     * 响应Action switchtab，变更页签
     *
     * @param {number} index 要变更到的tab
     */
    onSwitchmanagetab: function(index) {
        this.data.managetab = index;
        this.trigger('switchmanagetab', index);
    },
    onGetservicename: function() {
        this.trigger('servicename', '示例DEMO');
        // 车辆行业0，
        this.trigger('servicetype', 0);
    },
    /**
     * 响应Action switchmonitortab，变更实时监控中的列表
     *
     * @param {number} index 要变更到的tab
     */
    onSwitchmonitortab: function(index) {
        let that = this;
        switch (index) {
            case 0:
                that.data.boundsType = 'all';
                break;
            case 1:
                that.data.boundsType = 'online';
                break;
            case 2:
                that.data.boundsType = 'offline';
                break;
        }
        this.trigger('switchmonitortab', index);
        this.onBoundsearchentity();
    },
    /**
     * 响应Action searchallentity，查询所有entity
     *
     * @param {number} index页码
     */
    onSearchallentity: function(index) {
        this.updateOnlineTime();
        var that = this;
        if (that.data.searchingAll === 1) {
            return;
        }
        that.data.searchingAll = 1;
        index = index || that.data.currentAllPage;
        that.data.currentAllPage = index;
        that.data.allEntities = [];
        that.data.allCompleteEntities = [];
        var params = {
            'query': that.data.searchQuery,
            'page_index': index,
            'page_size': 10,
        };

        Urls.jsonp(Urls.searchEntity, params, function(data) {
            if (data.status === 0) {
                that.setAllEntities(data);
                that.setallCompleteEntities(data);
                that.data.entityTotal.all = data.total;
                this.trigger('totalall', data.total);
                var allpage = Math.ceil(data.total / 10);
                this.trigger('totalallpage', allpage);
                that.data.searchingAll = 0;
            } else {
                that.setAllEntities([]);
                that.setallCompleteEntities([]);
                this.trigger('totalall', 0);
                // this.trigger('totalallpage', 0);
                this.trigger('initallpage');
                that.data.searchingAll = 0;
            }
        }.bind(this));
    },
    /**
     * 响应Action searchofflineentity，查询所有entity
     *
     * @param {number} index页码
     */
    onSearchofflineentity: function(index) {
        var that = this;
        if (that.data.searchingOffline === 1) {
            return;
        }
        that.data.searchingOffline = 1;
        index = index || that.data.currentOfflinePage;
        that.data.currentOfflinePage = index;
        that.data.offlineEntities = [];
        that.data.offlineCompleteEntities = [];
        var params = {
            'filter': 'inactive_time:' + that.data.onlineTime,
            'query': that.data.searchQuery,
            'page_index': index,
            'page_size': 10,
        };
        Urls.jsonp(Urls.searchEntity, params, function(data) {
            if (data.status === 0) {
                that.setOfflineEntities(data);
                that.setOfflineCompleteEntities(data);
                that.data.entityTotal.offline = data.total;
                this.trigger('totaloffline', data.total);
                this.trigger('totalofflinepage', Math.ceil(data.total / 10));
                that.data.searchingOffline = 0;
            } else {
                that.setOfflineEntities([]);
                that.setOfflineCompleteEntities([]);
                this.trigger('totaloffline', 0);
                this.trigger('totalofflinepage', 0);
                this.trigger('initofflinepage');
                that.data.searchingOffline = 0;
            }
        }.bind(this));
    },
    /**
     * 响应Action searchofflineentity，查询所有entity
     *
     * @param {number} index页码
     */
    onSearchonlineentity: function(index) {
        var that = this;
        if (that.data.searchingOnline === 1) {
            return;
        }
        that.data.searchingOnline = 1;
        index = index || that.data.currentOnlinePage;
        that.data.currentOnlinePage = index;
        that.data.onlineEntities = [];
        that.data.onlineCompleteEntities = [];
        var params = {
            'filter': 'active_time:' + that.data.onlineTime,
            'query': that.data.searchQuery,
            'page_index': index,
            'page_size': 10,
        };
        Urls.jsonp(Urls.searchEntity, params, function(data) {
            if (data.status === 0) {
                that.setOnlineEntities(data);
                that.setonlineCompleteEntities(data);
                that.data.entityTotal.online = data.total;
                this.trigger('totalonline', data.total);
                this.trigger('totalonlinepage', Math.ceil(data.total / 10));
                that.data.searchingOnline = 0;
            } else {
                that.setOnlineEntities([]);
                that.setonlineCompleteEntities([]);
                this.trigger('totalonline', 0);
                this.trigger('totalonlinepage', 0);
                this.trigger('initonlinepage');
                that.data.searchingOnline = 0;
            }
        }.bind(this));
    },
    /**
     * 响应Action listcolumn 同时Store内部调用，查询当前service_id的自定义字段
     *
     */
    onListcolumn: function() {
        var that = this;
        var params = {
        };
        Urls.jsonp(Urls.columnsList, params, function(data) {
            if (data.status === 0) {
                data.columns.map(function(item) {
                    that.data.column.push(item.column_desc !== '' ? item.column_desc : item.column_key);
                    that.data.column_key.push(item.column_key);
                });
                this.trigger('listcolumn');
            }

        }.bind(this));
    },

    /**
     * 响应Action switchboundsearch 控制是否默认进行boundsearch
     *
     * @param {boolean} data 是否进行boundsearch
     */
    onSwitchboundsearch(data) {
        this.data.switchBounds = data;
        this.onBoundsearchentity();
    },

    /**
     * 响应Action boundsearchentity 返回当前地图区域的entity
     *
     * @param {boolean} display 如果传false那么则直接返回空数据
     */
    onBoundsearchentity(display) {
        let that = this;
        let time = new Date();
        that.data.boundsearchTimestamp = time.getTime();
        let inTimestamp = that.data.boundsearchTimestamp;
        let inBoundsEntity = [];
        let inBoundsEntityCount = 0;
        let total = 0;
        const boundsLimit = 400000;
        let bounds = map.getBounds();
        let center = bounds.getCenter();
        let northEast = bounds.getNorthEast();
        let southWest = bounds.getSouthWest();
        let page_size = map.getZoom() * 10;
        const width = 3;
        const height = 3;
        let boundsDistance = map.getDistance(northEast, southWest);
        if (!this.data.switchBounds || display === false || this.data.managetab === 1) {
            that.trigger('boundsearchDec', '当前视野设备数量');
            that.trigger('boundsearchentitytotal', 0);
            that.trigger('boundsearchentity', []);
            return;
        }
        
        let boundsArr = [];

        // 把屏幕分为 width * height 个区域，分别调用boundsearch加载车辆数据
        let lngLatToPoint = function (lnglat) {
            return map.getMapType().getProjection().lngLatToPoint(lnglat);
        };
        let pointToLngLat = function (point) {
            return map.getMapType().getProjection().pointToLngLat(point);
        };
        let pixelNorthEast = lngLatToPoint(northEast);
        let pixelSouthWest = lngLatToPoint(southWest);
        let widthUnit = (pixelNorthEast.x - pixelSouthWest.x) / width;
        let heightUnit = (pixelNorthEast.y - pixelSouthWest.y) / height;
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let leftButtom = pointToLngLat(new BMap.Pixel(pixelSouthWest.x + widthUnit * i, pixelSouthWest.y + heightUnit * j));
                let rightTop = pointToLngLat(new BMap.Pixel(pixelSouthWest.x + widthUnit * (i + 1), pixelSouthWest.y + heightUnit * (j + 1)));
                boundsArr.push(leftButtom.lat + ',' + leftButtom.lng + ';' + rightTop.lat + ',' + rightTop.lng);
            }
        }
        let filter = '';
        switch (that.data.boundsType) {
            case 'all':
                filter = '';
                break;
            case 'online':
                filter = 'active_time:' + that.data.onlineTime;
                break;
            case 'offline':
                filter = 'inactive_time:' + that.data.onlineTime;
                break;
        }

        let getBoundsearchResultTable = function () {
            boundsArr.map(function (item, index) {
                let params = {
                    'bounds': item,
                    'filter': filter,
                    'page_size': page_size
                };
                Urls.jsonp(Urls.boundsearchEntity, params, function (data) {
                    if (data.status === 0) {
                        data.entities.map(function (eitem, eindex) {
                            let status = '';
                            let entity_status = 0;
                            if (Commonfun.getOnlineStatus(eitem.latest_location.loc_time) === 0) {
                                eitem.latest_location.speed = eitem.latest_location.speed || 0;
                                status = Commonfun.getSpeed(eitem.latest_location.speed);
                                entity_status = status === '静止' ? 1 : 0;
                            } else {
                                entity_status = 2;
                                status = '离线';
                            }
                            inBoundsEntity.push({
                                entity_name: eitem.entity_name,
                                point: [eitem.latest_location.longitude, eitem.latest_location.latitude],
                                direction: eitem.latest_location.direction,
                                status: status,
                                entity_status: entity_status
                            });


                        });
                        total = total + data.total;
                    }
                    if (++inBoundsEntityCount === width * height && inTimestamp === that.data.boundsearchTimestamp) {
                        that.trigger('boundsearchentity', inBoundsEntity);
                        that.trigger('boundsearchDec', '当前视野设备数量');
                        that.trigger('boundsearchentitytotal', total);
                    }
                });
            });
        };
        let getBoundsearchResultOnce = function (page_index) {
            let temp = southWest.lat + ',' + southWest.lng + ';' + northEast.lat + ',' + northEast.lng;
            let params = {
                'bounds': temp,
                'filter': filter,
                'page_index': page_index,
                'page_size': 1000
            };
            Urls.jsonp(Urls.boundsearchEntity, params, function (data) {
                if (inTimestamp !== that.data.boundsearchTimestamp) {
                    return;
                }
                if (data.status === 3003) {
                    that.trigger('boundsearchDec', '当前视野设备数量');
                    that.trigger('boundsearchentitytotal', 0);
                    that.trigger('boundsearchentity', []);
                    return;
                }
                if (data.status === 0) {
                    that.trigger('boundsearchDec', '当前视野设备数量');
                    that.trigger('boundsearchentitytotal', data.total);
                    if (data.total > 5000) {
                        getBoundsearchResultTable();
                        return;
                    }
                    data.entities.map(function (eitem, eindex) {
                        let status = '';
                        let entity_status = 0;
                        if (Commonfun.getOnlineStatus(eitem.latest_location.loc_time) === 0) {
                            eitem.latest_location.speed = eitem.latest_location.speed || 0;
                            status = Commonfun.getSpeed(eitem.latest_location.speed);
                            entity_status = status === '静止' ? 1 : 0;
                        } else {
                            entity_status = 2;
                            status = '离线';
                        }
                        inBoundsEntity.push({
                            entity_name: eitem.entity_name,
                            point: [eitem.latest_location.longitude, eitem.latest_location.latitude],
                            direction: eitem.latest_location.direction,
                            status: status,
                            entity_status: entity_status
                        });
                    });
                    if (inBoundsEntity.length !== data.total) {
                        getBoundsearchResultOnce(page_index + 1);
                    } else {
                        that.trigger('boundsearchentity', inBoundsEntity);
                    }
                }
            });
        };
        // 划分成width * height 区域后仍然超过后端检索距离限制，则调用search检索
        if (boundsDistance > width * boundsLimit) {
            let tempData = [];
            let tempCount = 0;
            let tempTotal = that.data.entityTotal[that.data.boundsType];
            let page = Math.ceil(tempTotal / (map.getZoom() * 20));
            // return;
            let j = page >= 3 ? 3 : page;
            for (let i = 0; i < j; i = i + 1) {
                let page_index = Math.ceil(i * 0.5 * page) + 1;
                let params = {
                    'filter': filter,
                    'page_index': page_index,
                    'page_size': map.getZoom() * 20,
                    'sortby': 'loc_time:desc'
                };
                Urls.jsonp(Urls.searchEntity, params, function (data) {
                    if (inTimestamp !== that.data.boundsearchTimestamp) {
                        return;
                    }
                    if (data.status === 0) {
                        data.entities.map(function (eitem, eindex) {
                            let status = '';
                            let entity_status = 0;
                            if (Commonfun.getOnlineStatus(eitem.latest_location.loc_time) === 0) {
                                eitem.latest_location.speed = eitem.latest_location.speed || 0;
                                status = Commonfun.getSpeed(eitem.latest_location.speed);
                                entity_status = status === '静止' ? 1 : 0;
                            } else {
                                entity_status = 2;
                                status = '离线';
                            }
                            tempData.push({
                                entity_name: eitem.entity_name,
                                point: [eitem.latest_location.longitude, eitem.latest_location.latitude],
                                direction: eitem.latest_location.direction,
                                status: status,
                                entity_status: entity_status
                            });
                        });
                        if (++tempCount === j) {
                            that.trigger('boundsearchDec', '当前类型设备数量');
                            that.trigger('boundsearchentitytotal', data.total);
                            that.trigger('boundsearchentity', tempData);
                        }
                    }
                });
            }
            return;
        }
        if (boundsDistance < boundsLimit) {
            getBoundsearchResultOnce(1);
        } else {
            getBoundsearchResultTable();
        }
    },

    /**
     * 响应Action selectallcar 返回选中车辆具体信息
     *
     */
    onSelectcar: function(entity_name, entity_status, entity_id) {
        var that = this;
        if(that.data.selectCar.entity_name === undefined && entity_name === undefined) {
            return;
        }
        let interval = false;
        if (that.data.selectCar.entity_name !== undefined && entity_name === undefined) {
            interval = true;
        }
        entity_name = entity_name || that.data.selectCar.entity_name;
        entity_status = entity_status !== undefined ? entity_status : that.data.selectCar.entity_status;
        that.data.selectCompleteEntities = [];
        var params = {
            'query': entity_name,
            'page_index': 1,
        };

        Urls.jsonp(Urls.searchEntity, params, function(data) {
            if (data.status === 0) {
                data.entities.map(function(item, index) {
                    if (item.entity_name === entity_name) {
                        var point = data.entities[0].latest_location;
                        var paramsGeo = {
                            location: point.latitude + ',' + point.longitude,
                            output: 'json'
                        };
                        Urls.jsonp(Urls.getAddress, paramsGeo, function(dataGeo) {
                            var temp = [];
                            that.data.column_key.map(function(keyitem, index) {
                                if (keyitem === '_provider') {
                                    
                                } else {
                                    temp[index] = [that.data.column[index] + ':', item[keyitem] !== undefined ? item[keyitem] : '无'];
                                }
                            });
                            temp = temp.filter(function(item) {
                                return item;
                            });
                            var lnglat = item.latest_location.longitude.toFixed(6) + ',' + item.latest_location.latitude.toFixed(6);
                            var address = '地址未解析成功';
                            if (dataGeo.result.formatted_address !== '') {
                                address = dataGeo.result.formatted_address;
                            } else {
                                address = dataGeo.result.addressComponent.city + ', ' + location_desc.result.addressComponent.country;
                            }
                            that.data.selectCompleteEntities[index] = {
                                point: [item.latest_location.longitude, item.latest_location.latitude],
                                direction:item.latest_location.direction,
                                status: Commonfun.getInfoWindowStatus(item.latest_location.speed, item.latest_location.loc_time, item.latest_location.direction),
                                infor: [
                                    ['状态:', Commonfun.getInfoWindowStatus(item.latest_location.speed, item.latest_location.loc_time, item.latest_location.direction)],
                                    ['地址:', address],
                                    ['定位:', lnglat],
                                    ['时间:', Commonfun.getLocalTime(item.latest_location.loc_time)]
                                ].concat(temp)
                            };
                            that.data.selectCarStartDatetime = Commonfun.getStartTime(new Date(item.latest_location.loc_time * 1000));
                            // 从localstorage中获取应该显示到列表中的字段，entitydesc或者entityname
                            let entityOption = localStorage['entityOption' + that.data.serviceId];
                            if (entityOption === 'byname' || entityOption === undefined) {
                                that.data.selectCompleteEntities[index]['entity_print'] = item.entity_name;
                                if (!!item.entity_desc) {
                                    that.data.selectCompleteEntities[index]['infor'].unshift(['描述', item.entity_desc]);
                                }
                            } else if (entityOption === 'bydesc') {
                                that.data.selectCompleteEntities[index]['entity_print'] = item.entity_desc ? item.entity_desc : '无';
                                that.data.selectCompleteEntities[index]['infor'].unshift(['名称', item.entity_name]);
                            }
                            that.data.selectCompleteEntities[index]['entity_name'] = item.entity_name;
                            that.data.selectCompleteEntities[index].entity_status = entity_status;
                            that.data.selectCar = that.data.selectCompleteEntities[index];
                            // 对计时器触发的entity选中进行识别，添加标识，方便view层做处理
                            that.data.selectCompleteEntities[index].interval = interval;
                            that.trigger('selectcardata',that.data.selectCompleteEntities[index]);
                        });
                    }  
                });
               
            } else {
                
            }
        }.bind(this));
    },

    /**
     * 响应Action closemonitorinfobox 关闭实时监控中的infobox
     *
     */
    onClosemonitorinfobox() {
        this.data.selectCar.entity_name = undefined;
    },

    /**
     * 响应Action hideselectcar 返回选中车辆具体信息
     *
     */
    onHideselectcar: function() {
        this.trigger('hideselectcar');
    },
    /**
     * Store内部，根据查询结果设置entity格式
     *
     * @param {array} data entity数据
     */
    setAllEntities: function(data) {
        var that = this;
        var descIndex = 0;
        if (data.length === 0) {
            return;
        }
        data.entities.map(function (item, index) {
            var desc = '';
            if (Commonfun.getOnlineStatus(item.latest_location.loc_time) === 0) {
                item.latest_location.speed = item.latest_location.speed || 0;
                desc = Commonfun.getSpeed(item.latest_location.speed);
                descIndex = desc === '静止' ? 1 : 0;
            } else {
                desc = '离线';
                descIndex = 2;
            }
            that.data.allEntities[index] = [
                // item.entity_desc ? item.entity_desc : item.entity_name,
                item.entity_name,
                desc,
                descIndex,
                '',
                item.entity_desc ? item.entity_desc : '无'
            ];
            // 为managerdemo添加特殊识别字段entity_id
            if (!!item.entity_id) {
                that.data.allEntities[index][3] = item.entity_id;
            }
            // 从localstorage中获取应该显示到列表中的字段，entitydesc或者entityname
            let entityOption = localStorage['entityOption' + that.data.serviceId];
            if (entityOption === 'byname' || entityOption === undefined) {
                that.data.allEntities[index][5] = item.entity_name;
            } else if (entityOption === 'bydesc') {
                that.data.allEntities[index][5] = item.entity_desc ? item.entity_desc : '无';
            }
        });
    },
    /**
     * Store内部，根据查询结果设置完整entity格式
     *
     * @param {array} data entity数据
     */
    setallCompleteEntities: function(data) {
        // that.data.allCompleteEntities = data.entities;
        var that = this;
        if (data.length === 0) {
            that.trigger('alllist', that.data.allEntities);
            return;
        }
        that.data.allSize = data.size;
        that.trigger('alllist', that.data.allEntities);
    },
    /**
     * Store内部，根据查询结果设置entity格式
     *
     * @param {array} data entity数据
     */
    setOfflineEntities: function(data) {
        var that = this;
        if (data.length === 0) {
            return;
        }
        var descIndex = 0;
        data.entities.map(function (item, index) {
            var desc = '';
            if (Commonfun.getOnlineStatus(item.latest_location.loc_time) === 0) {
                item.latest_location.speed = item.latest_location.speed || 0;
                desc = Commonfun.getSpeed(item.latest_location.speed);
                descIndex = desc === '静止' ? 1 : 0;
            } else {
                desc = '离线';
                descIndex = 2;
            }
            that.data.offlineEntities[index] = [
                // item.entity_desc ? item.entity_desc : item.entity_name,
                item.entity_name,
                desc,
                descIndex,
                '',
                item.entity_desc ? item.entity_desc : '无'

            ];
            // 为managerdemo添加特殊识别字段entity_id
            if (!!item.entity_id) {
                that.data.offlineEntities[index][3] = item.entity_id;
            }
            // 从localstorage中获取应该显示到列表中的字段，entitydesc或者entityname
            let entityOption = localStorage['entityOption' + that.data.serviceId];
            if (entityOption === 'byname' || entityOption === undefined) {
                that.data.offlineEntities[index][5] = item.entity_name;
            } else if (entityOption === 'bydesc') {
                that.data.offlineEntities[index][5] = item.entity_desc ? item.entity_desc : '无';
            }
        });
    },
    /**
     * Store内部，根据查询结果设置离线entity格式
     *
     * @param {array} data entity数据
     */
    setOfflineCompleteEntities: function(data) {
        // that.data.allCompleteEntities = data.entities;
        var that = this;
        if (data.length === 0) {
            that.trigger('offlinelist', that.data.offlineEntities);
            return;
        }
        that.data.offlineSize = data.size;
        that.trigger('offlinelist', that.data.offlineEntities);
    },
    /**
     * Store内部，根据查询结果设置entity格式
     *
     * @param {array} data entity数据
     */
    setOnlineEntities: function(data) {
        var that = this;
        if (data.length === 0) {
            return;
        }
        var descIndex = 0;
        data.entities.map(function (item, index) {
            var desc = '';
            if (Commonfun.getOnlineStatus(item.latest_location.loc_time) === 0) {
                item.latest_location.speed = item.latest_location.speed || 0;
                desc = Commonfun.getSpeed(item.latest_location.speed);
                descIndex = desc === '静止' ? 1 : 0;
            } else {
                desc = '离线';
                descIndex = 2;
            }
            that.data.onlineEntities[index] = [
                // item.entity_desc ? item.entity_desc : item.entity_name,
                item.entity_name,
                desc,
                descIndex,
                '',
                item.entity_desc ? item.entity_desc : '无'
            ];
            // 为managerdemo添加特殊识别字段entity_id
            if (!!item.entity_id) {
                that.data.onlineEntities[index][3] = item.entity_id;
            }
            // 从localstorage中获取应该显示到列表中的字段，entitydesc或者entityname
            let entityOption = localStorage['entityOption' + that.data.serviceId];
            if (entityOption === 'byname' || entityOption === undefined) {
                that.data.onlineEntities[index][5] = item.entity_name;
            } else if (entityOption === 'bydesc') {
                that.data.onlineEntities[index][5] = item.entity_desc ? item.entity_desc : '无';
            }
        });
    },
    /**
     * Store内部，根据查询结果设置离线entity格式
     *
     * @param {array} data entity数据
     */
    setonlineCompleteEntities: function(data) {
        // that.data.allCompleteEntities = data.entities;
        var that = this;
        if (data.length === 0) {
            that.trigger('onlinelist', that.data.onlineEntities);
            return;
        }
        that.data.onlineSize = data.size;
        that.trigger('onlinelist', that.data.onlineEntities);
    },
    /**
     * 响应Action tracklist，查询所有tracklist
     *
     * @param {number} index页码
     */
    onTracklist: function(index) {
        // this.trigger('tracklist', []);
        var that = this;
        index = index || that.data.currentTrackPageIndex;
        that.data.currentTrackPageIndex = index;
        that.data.trackList = [];
        var params = {
            'query': that.data.searchQueryTrack,
            'page_size': 10,
            'page_index': index 
        };
        Urls.jsonp(Urls.searchEntity, params, function(data) {
            if(data.status === 0) {
                that.setTracklist(data);
                this.trigger('tracklist', that.getTracklist());
                this.trigger('tracklistpage', Math.ceil(data.total / 10));
                that.data.trackListSize = data.entities.length;
                data.entities.map(function(item) {
                    var paramsd ={
                       'start_time': that.data.start_time,
                       'end_time': that.data.end_time,
                       'entity_name': item.entity_name,
                       'is_processed': that.data.trackProcess.is_processed.toString(),
                        'process_option': 'need_denoise=' + that.data.trackProcess.need_denoise + ','+
                                          'need_vacuate=' + that.data.trackProcess.need_vacuate + ',' +
                                          'need_mapmatch=' + that.data.trackProcess.need_mapmatch + ',' +
                                          'transport_mode=' + that.data.transport_mode[that.data.trackProcess.transport_mode - 1]
                    };
                    Urls.jsonp(Urls.getDistance, paramsd, function(datad) {
                        if(datad.status === 0){
                            var trackDistance = (datad.distance / 1000).toFixed(1);
                            that.setTracklistDistance(trackDistance, item.entity_name);
                            that.trigger('tracklist', that.getTracklist());
                            if (++that.data.tracklistloadedConunt === that.data.trackListSize) {
                                that.trigger('tracklistloaded');
                                that.data.tracklistloadedConunt = 0;
                                if (that.data.triggerselecttrack) {
                                    that.trigger('triggerselecttrack');
                                    that.data.triggerselecttrack = false;
                                }
                            }
                        } else if (datad.status === 3006 || datad.status === 1) {
                            var tempTimeArr = [];
                            var partTime = Math.floor((that.data.end_time - that.data.start_time) / 6);
                            for(var i = 0; i < 6; i++) {
                                tempTimeArr[i] = {
                                    start_time: that.data.start_time + i * partTime,
                                    end_time: that.data.start_time + (i + 1) * partTime - 1,
                                    index: i
                                }
                            }
                            tempTimeArr[5].end_time = that.data.end_time;
                            var distance_time = [{
                                total: 0,
                                distance: []
                            }];
                            tempTimeArr.map(function (item_time) {
                                var param_time = {
                                    'start_time': item_time.start_time,
                                    'end_time': item_time.end_time,
                                    'entity_name': item.entity_name,
                                    'is_processed': that.data.trackProcess.is_processed.toString(),
                                    'process_option': 'need_denoise=' + that.data.trackProcess.need_denoise + ',' +
                                                     'need_vacuate=' + that.data.trackProcess.need_vacuate + ',' +
                                                     'need_mapmatch=' + that.data.trackProcess.need_mapmatch + ',' +
                                                     'transport_mode=' + that.data.transport_mode[that.data.trackProcess.transport_mode - 1]
                                };
                                Urls.jsonp(Urls.getDistance, param_time, function(data_time) {
                                    let key = item.entity_name;
                                    if (data_time.status === 0) {
                                        if (!distance_time[key]) {
                                            distance_time[key] = {};
                                            distance_time[key].total = 0;
                                            distance_time[key].distance = [];
                                        }
                                        distance_time[key].distance.push(data_time.distance);
                                        distance_time[key].total = distance_time[key].total + data_time.distance;
                                        if (distance_time[key].distance.length === 6) {
                                            var trackDistance = (distance_time[key].total / 1000).toFixed(1);
                                            that.setTracklistDistance(trackDistance, item.entity_name);
                                            that.trigger('tracklist', that.getTracklist());
                                            if (++that.data.tracklistloadedConunt === that.data.trackListSize) {
                                                that.trigger('tracklistloaded');
                                                that.data.tracklistloadedConunt = 0;
                                                if (that.data.triggerselecttrack) {
                                                    that.trigger('triggerselecttrack');
                                                    that.data.triggerselecttrack = false;
                                                }                
                                            }
                                        }
                                    }
                                });
                            });
                        } else {
                            var trackDistance = '数据异常';
                            that.setTracklistDistance(trackDistance, item.entity_name);
                            that.trigger('tracklist', that.getTracklist());
                            if (++that.data.tracklistloadedConunt === that.data.trackListSize) {
                                that.trigger('tracklistloaded');
                                that.data.tracklistloadedConunt = 0;
                            }
                        }
                    });
                });
                
            } else {
                that.trigger('tracklist', []);
                that.trigger('tracklistloaded');
            }
            
        }.bind(this));
    },
    /**
     * Store内部，根据查询结果设置tracklist数据
     *
     * @param {array} data entity数据
     */
    setTracklist: function (data) {
        var that = this;
        that.data.trackList = [];
        data.entities.map(function (item, index) {
            if (item.trackDistance != undefined){
                // alert(1);
                that.data.trackList.push([item.entity_name, item.trackDistance, item.trackDistance > 0 ? 0 : 1]);
            } else {
                that.data.trackList[index] = {
                    name: item.entity_name,
                    distance: -1,
                    style: 1,
                    desc: item.entity_desc ? item.entity_desc : '无'
                };

                // 从localstorage中获取应该显示到列表中的字段，entitydesc或者entityname
                let entityOption = localStorage['entityOption' + that.data.serviceId];
                if (entityOption === 'byname' || entityOption === undefined) {
                    that.data.trackList[index]['print'] = item.entity_name;
                } else if (entityOption === 'bydesc') {
                    that.data.trackList[index]['print'] = item.entity_desc ? item.entity_desc : '无';
                }

                if (that.data.managerDemo) {
                    that.data.trackList[index].entity_id = item.entity_id;
                }
            }
        });
    },
    /**
     * Store内部，设置tracklist里程数
     *
    * @param {string} data entity数据
     * @param {string} name entity名称
     */
    setTracklistDistance: function(data, name) {
        var that = this;
        that.data.trackList.map(function(item) {
            if(item.name === name) {
                item.distance = data;
                item.style = data > 0 ? 0 : 1;
            }
        });
    },
    /**
     * Store内部，获取tracklist数据
     *
     * @param {array} data entity数据
     */
    getTracklist: function() {
        return this.data.trackList;
    },
    /**
     * 响应Action changedatetime，修改起止时间
     *
     * @param {string} data 选择日期
     */
    onChangedatetime: function(data) {
        var date = new Date(Date.parse(data.replace(/-/g, "/")));
        date = date.getTime() / 1000;
        this.data.start_time = date;
        this.data.end_time = date + 86399;
    },
    /**
     * store内部 pdateonlinetime，修改判断在线离线时间
     *
     */
    updateOnlineTime: function() {
        this.data.onlineTime = Math.ceil(new Date().getTime() / 1000) - 600;
    },
    /**
     * 响应Action setsearchentity，设置检索关键字
     *
     * @param {string} data 检索关键字
     */
    onSetsearchentity: function(data) {
        this.data.searchQuery = data;
    },
    /**
     * 响应Action setsearchentitytrack，设置轨迹查询检索关键字
     *
     * @param {string} data 检索关键字
     */
    onSetsearchentitytrack: function(data) {
        this.data.searchQueryTrack = data;
    },
    /**
     * 响应Action selecttrack，选中某个轨迹
     *
     * @param {string} data entity name
     */
    onSelecttrack: function(data) {
        var that = this;
        if (that.data.selectTrack === '' && !data) {
            return;
        }
        if (that.data.trackSearching === 1) {
            return;
        }
        let first = (data !== undefined);
        that.data.trackSearching = 1;
        var tempTimeArr = [];
        that.data.selectTrack = data || that.data.selectTrack;
        that.data.trackRouteData = [];
        that.data.trackRoutePointData = [];
        that.data.trackRouteSortData = [];
        that.data.trackRouteNoZero = [];
        var partTime = Math.floor((that.data.end_time - that.data.start_time) / 6);
        for(var i = 0; i < 6; i++) {
            tempTimeArr[i] = {
                start_time: that.data.start_time + i * partTime,
                end_time: that.data.start_time + (i + 1) * partTime - 1,
                index: i
            }
        }
        tempTimeArr[5].end_time = that.data.end_time;
        var params = {
           'entity_name': that.data.selectTrack,
           'simple_return': 0,
           'page_size': 5000,
           'is_processed': that.data.trackProcess.is_processed.toString(),
           'process_option': 'need_denoise=' + that.data.trackProcess.need_denoise + ',' +
                             'need_vacuate=' + that.data.trackProcess.need_vacuate + ',' +
                             'need_mapmatch=' + that.data.trackProcess.need_mapmatch + ',' +
                             'transport_mode=' + that.data.transport_mode[that.data.trackProcess.transport_mode - 1]
        };
        var count = 1;
        var reTrackRoute = function (paramsr, page_index) {

            var newParams = {
                'service_id': paramsr.service_id,
                'entity_name': paramsr.entity_name,
                'simple_return': paramsr.simple_return,
                'page_size': paramsr.page_size,
                'page_index': page_index,
                'start_time': paramsr.start_time,
                'end_time': paramsr.end_time,
                'is_processed': paramsr.is_processed,
                'process_option': paramsr.process_option
            };

            var search = function (paramsearch, counta, countb) {
                Urls.jsonp(Urls.getTrack, paramsearch, function(data) {
                    that.data.trackRouteDataCount = that.data.trackRouteDataCount + 1;
                    if(data.status === 0){ 
                        that.data.trackRouteSortData.push({index: counta, data: data});
                        if(that.data.trackRouteDataCount === 12) {
                            that.data.trackRouteDataCount = 0;
                            that.data.trackRouteSortData.sort(function(a,b){return a.index - b.index});

                            for(var i = 0; i < 12; i++) {
                                that.data.trackRoutePointData = that.data.trackRoutePointData.concat(that.data.trackRouteSortData[i].data.points);
                            }
                            that.data.trackRoutePointData.map(function(item){
                                if (item.longitude > 1 && item.latitude > 1) {
                                    that.data.trackRouteNoZero.push(item);
                                }  
                            });
                            that.trigger('trackroutefirst', first);
                            that.trigger('trackroute', that.data.trackRouteNoZero);
                            that.data.trackSearching = 0;
                        }
                    }
                    if (that.data.trackRouteDataCount === 12) {
                        that.data.trackRouteDataCount = 0;
                        that.data.trackSearching = 0;
                    }
                });
            };
            search(newParams, count++);
        };
        tempTimeArr.map(function (item){
            params.start_time = item.start_time;
            params.end_time = item.end_time;
            reTrackRoute(params, 1);
            reTrackRoute(params, 2);
        }); 
    },
    /**
     * 响应Action initpageset，初始化页码
     *
     */
    onInitpageset: function() {
        this.data.currentAllPage =  0;
        this.data.currentOnlinePage =  0;
        this.data.currentOfflinePage =  0;
        this.trigger('initallpage');
        this.trigger('initonlinepage');
        this.trigger('initofflinepage');
    },
    /**
     * 响应Action initpagesettrack，初始化页码
     *
     */
    onInitpagesettrack: function() {
        this.data.currentTrackPageIndex =  0;
        this.trigger('initpagetrack');
    },
    /**
     * 响应Action getstaypoint，获取停留点
     *
     */
    onGetstaypoint: function() {
        var that = this;
        if (that.data.selectTrack === '') {
            return;
        }
        if (that.data.staypointSearching === 1) {
            return;
        }
        that.data.staypointSearching = 1;
        var entity_name = that.data.selectTrack;
        var tempTimeArr = [];
        that.data.trackStayRouteSortData = [];
        that.data.trackStayRoutePointData = [];
        var partTime = Math.floor((that.data.end_time - that.data.start_time) / 6);
        for(var i = 0; i < 6; i++) {
            tempTimeArr[i] = {
                start_time: that.data.start_time + i * partTime,
                end_time: that.data.start_time + (i + 1) * partTime - 1,
                index: i
            }
        }
        tempTimeArr[5].end_time = that.data.end_time;
        var params = {
           'entity_name': that.data.selectTrack
        };
        var count = 1;
        var reTrackRoute = function (paramsr) {

            var newParams = {
                'service_id': paramsr.service_id,
                'entity_name': paramsr.entity_name,
                'start_time': paramsr.start_time,
                'end_time': paramsr.end_time,
                'process_option': 'need_denoise=' + that.data.trackProcess.need_denoise + ','
                                  + 'need_vacuate=' + that.data.trackProcess.need_vacuate + ','
                                  + 'need_mapmatch=' + that.data.trackProcess.need_mapmatch + ','
                                  + 'transport_mode=' + that.data.transport_mode[that.data.trackProcess.transport_mode - 1]
            };
            var search = function (paramsearch, counta) {
                Urls.jsonp(Urls.getstaypoint, paramsearch, function(data) {
                    if(data.status === 0){ 
                        that.data.trackStayRouteSortData.push({index: counta, data: data});
                        if(++that.data.trackStayRouteDataCount === 6) {
                            that.data.trackStayRouteDataCount = 0;
                            that.data.trackStayRouteSortData.sort(function(a,b){return a.index - b.index});

                            for(var i = 0; i < 6; i++) {
                                if (that.data.trackStayRouteSortData[i].data.stay_points !== undefined) {
                                    that.data.trackStayRoutePointData = that.data.trackStayRoutePointData.concat(that.data.trackStayRouteSortData[i].data.stay_points);
                                }
                            }
                            that.trigger('staypoint', that.data.trackStayRoutePointData);
                            that.data.staypointSearching = 0;
                        }
                    }
                });
            };
            search(newParams, count++);
        };
        tempTimeArr.map(function (item){
            params.start_time = item.start_time;
            params.end_time = item.end_time;
            reTrackRoute(params);
        }); 
    },
    /**
     * 响应Action behavioranalysis，驾驶分析
     *
     */
    onBehavioranalysis: function() {
        var that = this;
        if (that.data.selectTrack === '') {
            return;
        }
        if (that.data.analysisbehaviorSearching === 1) {
            return;
        }
        that.data.analysisbehaviorSearching = 1;
        var entity_name = that.data.selectTrack;
        var tempTimeArr = [];
        that.data.trackBehaviorSortData = [];
        // 实际返回给view的驾驶分析数据
        that.data.trackBehaviorPointData = {
            harsh_acceleration: [],
            harsh_breaking: [],
            harsh_steering: [],
            speeding: []
        };
        var partTime = Math.floor((that.data.end_time - that.data.start_time) / 6);
        for(var i = 0; i < 6; i++) {
            tempTimeArr[i] = {
                start_time: that.data.start_time + i * partTime,
                end_time: that.data.start_time + (i + 1) * partTime - 1,
                index: i
            }
        }
        tempTimeArr[5].end_time = that.data.end_time;
        var params = {
           'entity_name': that.data.selectTrack
        };
        var count = 1;
        var reBehavior = function (paramsr) {
            var newParams = {
                'service_id': paramsr.service_id,
                'entity_name': paramsr.entity_name,
                'start_time': paramsr.start_time,
                'end_time': paramsr.end_time,
                'process_option': 'need_denoise=' + that.data.trackProcess.need_denoise + ','
                                  + 'need_vacuate=' + that.data.trackProcess.need_vacuate + ','
                                  + 'need_mapmatch=' + that.data.trackProcess.need_mapmatch + ','
                                  + 'transport_mode=' + that.data.transport_mode[that.data.trackProcess.transport_mode - 1]
            };
            var search = function (paramsearch, counta) {
                Urls.jsonp(Urls.getBehaviorAnalysis, paramsearch, function(data) {
                    if(data.status === 0){ 
                        that.data.trackBehaviorSortData.push({index: counta, data: data});
                        if(++that.data.trackBehaviorDataCount === 6) {
                            that.data.trackBehaviorDataCount = 0;
                            that.data.trackBehaviorSortData.sort(function(a,b){return a.index - b.index});

                            for(var i = 0; i < 6; i++) {
                                that.data.trackBehaviorPointData.harsh_acceleration = that.data.trackBehaviorPointData.harsh_acceleration.concat(
                                    that.data.trackBehaviorSortData[i].data.harsh_acceleration
                                );
                                that.data.trackBehaviorPointData.harsh_breaking = that.data.trackBehaviorPointData.harsh_breaking.concat(
                                    that.data.trackBehaviorSortData[i].data.harsh_breaking
                                );
                                that.data.trackBehaviorPointData.harsh_steering = that.data.trackBehaviorPointData.harsh_steering.concat(
                                    that.data.trackBehaviorSortData[i].data.harsh_steering
                                );
                                that.data.trackBehaviorPointData.speeding = that.data.trackBehaviorPointData.speeding.concat(
                                    that.data.trackBehaviorSortData[i].data.speeding
                                );
                            }
                            that.trigger('analysisbehavior', that.data.trackBehaviorPointData);
                            that.data.analysisbehaviorSearching = 0;
                        }
                    }
                });
            };
            search(newParams, count++);
        };
        tempTimeArr.map(function (item){
            params.start_time = item.start_time;
            params.end_time = item.end_time;
            reBehavior(params);
        }); 
    },
    /**
     * 响应Action updateprocess，驾驶分析
     *
     * @param {object} data 轨迹纠偏选项
     */
    onUpdateprocess: function(data) {
        this.data.trackProcess.is_processed = data.is_processed;
        this.data.trackProcess.need_denoise = data.need_denoise;
        this.data.trackProcess.need_vacuate = data.need_vacuate;
        this.data.trackProcess.need_mapmatch = data.need_mapmatch;
        this.data.trackProcess.transport_mode = data.transport_mode;
    },
    /**
     * 响应Action hidetrackcanvas 隐藏显示路径的canvas层
     *
     */
    onHidetrackcanvas: function(data) {
        this.trigger('hidetrackcanvas');
    },
    /**
     * 响应Action showtrackcanvas 隐藏显示路径的canvas层
     *
     */
    onShowtrackcanvas: function(data) {
        this.trigger('showtrackcanvas');
    },

    /**
     * 响应Action changeTimeline 设置轨迹显示的时间段
     *
     * @param {number} starttime 开始时间
     * @param {number} endtime 结束时间
     */
    onChangeTimeline(starttime, endtime) {
        this.trigger('changeTimeline', {
            starttime: starttime,
            endtime: endtime
        });
    },

    /**
     * 响应Action getaddress 进行地址解析
     *
     * @param {Object} point 点对象
     */
    onGetaddress(point) {
        let that = this;
        let param = {
            location: point.lat + ',' + point.lng,
            output: 'json'
        };
        Urls.jsonp(Urls.getAddress, param, function (data) {
            let infoBoxObject = that.getTrackPointInfo(data, point);
            that.trigger('getaddress', infoBoxObject);
        });
    },

    /**
     * 响应Action triggerswitchmanagetab
     * 传递模拟点击实时监控和轨迹查询的页签
     *
     * @param {number} index 序号
     */
    onTriggerswitchmanagetab(index) {
        this.trigger('triggerswitchmanagetab', index);
    },

    /**
     * 响应Action triggersearchentitytrack
     * 传递模拟轨迹查询页面的检索
     *
     */
    onTriggersearchentitytrack() {
        this.trigger('triggersearchentitytrack', this.data.selectCar);
    },

    /**
     * 响应Action triggersetdate
     * 传递模拟轨迹查询页面的检索
     *
     */
    onTriggersetdate() {
        this.trigger('triggersetdate', this.data.selectCarStartDatetime);
    },


    /**
     * 响应Action triggerselecttrack
     * 传递模拟选择某个轨迹
     *
     */
    onTriggerselecttrack() {
        this.data.triggerselecttrack = true;
    },

    /**
     * store 内部，整合轨迹点信息窗口的数据格式
     *
     * @param {Object} data 逆地址解析返回的结果
     * @param {Object} point 轨迹点对象数据
     *
     * @return {Object} 轨迹点信息窗口所需数据
     */
    getTrackPointInfo(data, point) {
        let address = '';
        if (data.status === 0) {
            if (data.result.formatted_address !== '') {
                address = data.result.formatted_address;
            } else {
                address = data.result.addressComponent.city + ', ' + data.result.addressComponent.country;
            }
        } else {
            address = '地址未解析成功';
        }
        let infoBoxObject = {
            point: point,
            print: point.print,
            infor: [
                ['定位:', point.lnglat],
                ['地址:', address],
                ['速度:', point.printSpeed],
                ['时间:', point.printTime],
                ['高度:', point.height + '米'],
                ['精度:', point.radius + '米']
            ]
            // lnglat: point.lnglat,
            // address: address,
            // printTime: point.printTime,
            // printSpeed: point.printSpeed,
            // height: point.height,
            // radius: point.radius
        };
        return infoBoxObject;
    }
});

export default TrackStore