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
            need_mapmatch: '0'
        },
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
        selectCompleteEntities:[]
    },
    /**
     * 响应Action switchtab，变更页签
     *
     * @param {number} index 要变更到的tab
     */
    onSwitchmanagetab: function(index) {
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
        this.trigger('switchmonitortab', index);
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
     * 响应Action selectallcar 返回选中车辆具体信息
     *
     */
    onSelectcar: function(entity_name, entity_status, entity_type) {
        var that = this;
        if(that.data.selectCar.entity_name === undefined && entity_name === undefined) {
            return;
        }
        entity_name = entity_name || that.data.selectCar.entity_name;
        entity_status = entity_status || that.data.selectCar.entity_status;
        entity_type = entity_type || that.data.selectCar.entity_type;
        that.data.selectCompleteEntities = [];
        var params = {
            'query': entity_name,
            'page_index': 1,
        };

        Urls.jsonp(Urls.searchEntity, params, function(data) {
            if (data.status === 0) {
                data.entities.length = 1;
                data.entities.map(function(item) {
                    var point = data.entities[0].realtime_point.location;
                    var paramsGeo = {
                        location: point[1] + ',' + point[0],
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
                        var lnglat = item.realtime_point.location[0].toFixed(2) + ',' + item.realtime_point.location[1].toFixed(2);
                        that.data.selectCompleteEntities.push({
                            point: [item.realtime_point.location[0], item.realtime_point.location[1]],
                            entity_name: item.entity_name,
                            direction:item.realtime_point.direction,
                            infor: [
                                ['状态:', Commonfun.getInfoWindowStatus(item.realtime_point.speed, item.realtime_point.loc_time, item.realtime_point.direction)],
                                ['地址:', dataGeo.result.formatted_address === '' ? '无' : dataGeo.result.formatted_address],
                                ['定位:', lnglat],
                                ['时间:', Commonfun.getLocalTime(item.realtime_point.loc_time)]
                            ].concat(temp)
                        });
                        that.data.selectCompleteEntities[0].entity_status = entity_status;
                        that.data.selectCompleteEntities[0].entity_type = entity_type;
                        that.data.selectCar = that.data.selectCompleteEntities[0];
                        that.trigger('selectcardata',that.data.selectCompleteEntities[0]);
                    });   
                });
               
            } else {
                
            }
        }.bind(this));
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
        data.entities.map(function (item) {
            var desc = '';
            if (Commonfun.getOnlineStatus(item.realtime_point.loc_time) === 0) {
                item.realtime_point.speed = item.realtime_point.speed || 0;
                desc = Commonfun.getSpeed(item.realtime_point.speed);
                descIndex = desc === '静止' ? 1 : 0;
            } else {
                desc = '离线';
                descIndex = 2;
            }
            that.data.allEntities.push([
                item.entity_name,
                desc,
                descIndex
            ]);
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
        data.entities.map(function (item) {
            var desc = '';
            if (Commonfun.getOnlineStatus(item.realtime_point.loc_time) === 0) {
                item.realtime_point.speed = item.realtime_point.speed || 0;
                desc = Commonfun.getSpeed(item.realtime_point.speed);
                descIndex = desc === '静止' ? 1 : 0;
            } else {
                desc = '离线';
                descIndex = 2;
            }
            that.data.offlineEntities.push([
                item.entity_name,
                desc,
                descIndex
            ]);
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
        data.entities.map(function (item) {
            var desc = '';
            if (Commonfun.getOnlineStatus(item.realtime_point.loc_time) === 0) {
                item.realtime_point.speed = item.realtime_point.speed || 0;
                desc = Commonfun.getSpeed(item.realtime_point.speed);
                descIndex = desc === '静止' ? 1 : 0;
            } else {
                desc = '离线';
                descIndex = 2;
            }
            that.data.onlineEntities.push([
                item.entity_name,
                desc,
                descIndex
            ]);
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
                       'simple_return': 2,
                       'is_processed': that.data.trackProcess.is_processed.toString(),
                       'process_option': 'need_denoise=' + that.data.trackProcess.need_denoise + ',' +
                                         'need_vacuate=' + that.data.trackProcess.need_vacuate + ',' +
                                         'need_mapmatch=' + that.data.trackProcess.need_mapmatch
                    };
                    Urls.jsonp(Urls.trackList, paramsd, function(datad) {
                        if(datad.status === 0){
                            var trackDistance = (datad.distance / 1000).toFixed(1);
                            that.setTracklistDistance(trackDistance, item.entity_name);
                            that.trigger('tracklist', that.getTracklist());
                            if (++that.data.tracklistloadedConunt === that.data.trackListSize) {
                                that.trigger('tracklistloaded');
                                that.data.tracklistloadedConunt = 0;
                            }
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
    setTracklist: function(data) {
        var that = this;
        that.data.trackList = [];
        data.entities.map(function(item) {
            if (item.trackDistance != undefined){
                that.data.trackList.push([item.entity_name, item.trackDistance, item.trackDistance > 0 ? 0 : 1]);
            } else {
                that.data.trackList.push({name: item.entity_name, distance: -1, style: 1});
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
                             'need_mapmatch=' + that.data.trackProcess.need_mapmatch
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
                'process_option': paramsr.process_option,
                'sort_type': 1
            };

            var search = function (paramsearch, counta, countb) {
                Urls.jsonp(Urls.trackList, paramsearch, function(data) {
                    if(data.status === 0){ 
                        that.data.trackRouteSortData.push({index: counta, data: data});
                        if(++that.data.trackRouteDataCount === 12) {
                            that.data.trackRouteDataCount = 0;
                            that.data.trackRouteSortData.sort(function(a,b){return a.index - b.index});

                            for(var i = 0; i < 12; i++) {
                                that.data.trackRoutePointData = that.data.trackRoutePointData.concat(that.data.trackRouteSortData[i].data.points);
                            }
                            that.data.trackRoutePointData.map(function(item){
                                if(item.location[0] > 1 && item.location[1] > 1) {
                                    that.data.trackRouteNoZero.push(item);
                                }  
                            })
                            that.trigger('trackroute', that.data.trackRouteNoZero);
                            that.data.trackSearching = 0;
                        }
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
                'end_time': paramsr.end_time
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
                'end_time': paramsr.end_time
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
    }
});

export default TrackStore