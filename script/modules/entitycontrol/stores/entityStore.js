/**
 * @file 设备管理台Reflux Store
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

import EntityAction from '../actions/entityAction'
import Urls from '../../../common/urls'
import Commonfun from '../../../common/commonfun'

var EntityStore = Reflux.createStore({
    listenables: [EntityAction],
    init: function() {
    },
    data: {
        // 总entity数据数量
        total: 0,
        // 当前页entity数据数量
        size: 0,
        // entity完整数据
        entities: [],
        // entity的固定默认列名
        column: ['名称', '创建时间', '最后位置', '最后定位时间'],
        // entity的自定义列的key
        column_key: [],
        // entity的自定义列的desc
        indiviColumn: [],
        // entity list计数器，entity全部trigger完成后判断触发listcomplete时间
        sizeCount: 0,
        // 目前选中的entity，记录checklist主要是为了删除
        checklist: [],
        // 当前数据页
        currentPage: 1,
        // 删除entity计数，都删除后触发removecomplete
        removeCount: 0,
        // 当前检索关键字
        searchQuery: '',
        providerArr: [
            {
                key: 21,
                value: '深圳微科通讯'
            },
            {
                key: 24,
                value: '深圳博实结科技'
            },
            {
                key: 22,
                value: '北京聚利科技'
            }
        ]
    },
    /**
     * store内部，根据view需要的格式处理entities，因为后端返回的定位点
     * 为经纬度，所以需要再次循环调用经纬度解析方法
     *
     * @param {object} data 后端返回的entity原始数据
     */
    setEntities: function(data) {
        var that = this;
        that.data.total = data.total;
        that.data.size = data.size;
        data.entities.map(function(item) {
            var point = data.entities[0].latest_location;
            var paramsGeo = {
                location: point.latitude + ',' + point.longitude,
                output: 'json'
            };
            Urls.jsonp(Urls.getAddress, paramsGeo, function(dataGeo) {
                var temp = [];
                that.data.column_key.map(function(keyitem, index) { 
                    if (keyitem === '_provider') {
                        temp[index] = ['_provider', '1'];
                    } else {
                        temp[index]= item[keyitem] !== undefined ? [keyitem, item[keyitem]] : [keyitem, '无'];
                    }
                });
                // var location_desc = JSON.parse(item.latest_location.location_desc);
                that.data.entities.push([
                    ['entity_name', item.entity_name],
                    ['create_time', item.create_time],
                    ['local_address', dataGeo.result.formatted_address === '' ? '无' : dataGeo.result.formatted_address,],
                    ['loc_time', Commonfun.getLocalTime(item.latest_location.loc_time)]
                ].concat(temp));
                if (that.data.entities.length === that.data.size) {
                    that.trigger('list', that.getEntities());
                    that.trigger('listcomplete', that.data.size);
                }
            });
            
        });
    },
    /**
     * store内部，获取entities
     *
     * @return {object} 当前entities
     */
    getEntities: function() {
        return this.data.entities;
    },
    /**
     * 响应Action list，加载entity list
     *
     * @param {number} pageindex 页码
     */
    onList: function(pageindex) {
        var that = this;
        that.data.currentPage = pageindex;
        that.data.entities = [];
        var params = {
            'page_index': pageindex,
            'query': that.data.searchQuery,
            'page_size': 15
        };
        Urls.jsonp(Urls.searchEntity, params, function(data) {
            if (data.status === 0) {
                that.setEntities(data);
                this.trigger('total', that.data.total);
                this.trigger('totalpage', Math.ceil(that.data.total / 15));
            } else {
                this.trigger('list', []);
                this.trigger('listcomplete', 0);
                this.trigger('total', 0);
                this.trigger('totalpage', 0);
                this.trigger('initpage');
            }
        }.bind(this));
    },
    /**
     * store内部 将自定义字段中的provider字段删除
     *
     * @param {array} column 自定义字段
     * @return {array} 新的数组
     */
     formatColumn: function(columns) {
        var providerIndex = columns.findIndex(function(value, index, array) {
            return value.column_key === '_provider';
        });
        if (providerIndex != -1) {
            var provider = columns.find(function(value, index, array) {
                return value.column_key === '_provider';
            });
            columns.splice(providerIndex, 1);
        }
        return columns;
     },
    /**
     * 响应Action listcolumn，查询当前service_id的自定义字段
     *
     */
    onListcolumn: function() {
        var that = this;
        var params = {
        };
        Urls.jsonp(Urls.columnsList, params, function(data) {
            if (data.status === 0) {
                data.columns = that.formatColumn(data.columns);
                data.columns.map(function(item) {
                    that.data.column.push(item.column_desc !== null ? item.column_desc : item.column_key);
                    that.data.column_key.push(item.column_key);
                    if (item.column_key !== '_provider') {
                        that.data.indiviColumn.push({
                            'column_key': item.column_key,
                            'column_desc': item.column_desc !== null ? item.column_desc : item.column_key
                        });
                    }
                });
                this.trigger('indivicolumn', that.data.indiviColumn);
                this.trigger('listcolumn', that.data.column);
            }

        }.bind(this));
    },
    /**
     * 响应Action checkall，触发checkall事件
     *
     */
    onCheckall: function() {
        this.trigger('checkall');
    },
    /**
     * 响应Action uncheckall，触发uncheckall事件
     *
     */
    onUncheckall: function() {
        this.trigger('uncheckall');
    },
    /**
     * 响应Action updatecheck，更新checklist
     *
     * @param {array} data 当前选中entity项
     */
    onUpdatecheck: function(data) {
        this.data.checklist = data;
    },
    /**
     * 响应Action remove
     *
     */
    onRemove: function() {
        console.warn('此处需要自行通过代理服务器实现POST请求！');
        // var that = this;
        // var removeList = that.data.checklist;
        // removeList.map(function(item) {
        //     var params = {
        //         'entity_name': item
        //     };
        //     Urls.post(Urls.deleteEntity, params, function(data) {
        //         if (data.status === 0) {
        //             if (++that.data.removeCount === removeList.length) {
        //                 that.data.currentPage = (that.data.size === removeList.length) ? that.data.currentPage - 1 : that.data.currentPage;
        //                 that.onList(that.data.currentPage);
        //                 that.data.removeCount = 0;
        //                 that.trigger('removecomplete');
        //             }
        //         }

        //     }.bind(this));
        // });

    },

    /**
     * 响应Action setsearchentity
     * @param {string} data 新的setsearchentity
     *
     */
    setsearchentity: function(data) {
        this.data.searchQuery = data;
    },
    /**
     * 响应Action initpageset，选中某个轨迹
     *
     */
    onInitpageset: function() {
        this.data.currentPage =  0;
        this.data.checklist = [];
        this.trigger('initpage');
    },
    /**
     * 响应Action update，更新entity属性
     * @param {object} data 更新的entity和属性
     */
    onUpdate: function(data) {
        console.warn('此处需要自行通过代理服务器实现POST请求！');
        // Urls.post(Urls.updateEntity, data, function(data) {
        //     if (data.status === 0) {
        //     } else {
        //         alert(data.message);
        //     }

        // }.bind(this));
    }
});

export default EntityStore