/* globals map */
/* globals BMap */
/* globals Reflux */
/* globals mapv */
/* globals dataSet */
/* globals mapControl */
/* eslint-disable fecs-camelcase */
/* eslint-disable max-len */
/**
 * @file 实时监控全部 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.23
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackStore from '../stores/trackStore'
import CommonStore from '../../common/stores/commonStore'
import MonitorAllPage from 'monitorallpage'
import TrackAction from '../actions/trackAction'

var Monitorallcontent = React.createClass({
    getInitialState: function() {
        return {
            // 页签编码 0为实时监控 1为终端管理
            tabIndex: 0,
            // 页签编码 0为实时监控 1为终端管理
            manageTabIndex: 0,
            // monitor三种列表类型编码 0全部 1在线 2离线
            monitorTabIndex: 0,
            // 父容器可见性
            parentVisible: {},
            // 当前列表内容
            allEntity: [],
            // 当前选中车的坐标
            currentPoint: {},
            // 当前选中的entityname
            currentEntityName: '',
            // service  类型
            service_type: 0
        }
    },
    componentDidMount: function () {
        TrackStore.listen(this.onStatusChange);
        CommonStore.listen(this.onStatusChange);
        TrackAction.listcolumn();
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'switchmanagetab':
                this.listenSwitchmanageTab(data);
            break;
            case 'switchtab':
                this.listenSwitchTab(data);
            break;
            case 'switchmonitortab':
                this.listenSwitchMonitorTab(data);
            break;
            case 'listcolumn':
                this.listenListColumn();
            break;
            case 'alllist':
                this.listenAllList(data);
            break;
            case 'selectcardata':
                this.listenSelectCarData(data);
            break;
            case 'hideselectcar':
                this.listenHideSelectCar();
            break;
            case 'servicetype':
                this.listenServicetype(data);
            break;
            case 'boundsearchentity':
                this.listenBoundsearchentity(data);
                break;
        }
    },
    /**
     * 响应Store list事件，设置标签页
     *
     * @param {data} 标签页标识
     */
    listenSwitchmanageTab: function(data) {
        var that = this;
        if (data === 0){
            this.setState({parentVisible: {}});
            this.setState({manageTabIndex: 0});
        } else {
            this.setState({parentVisible: {visibility: 'inherit'}});
            this.setState({manageTabIndex: 1});
        }
    },
    /**
     * 响应Store switchtab事件，隐藏manage
     *
     * @param {data} 标签页标识
     */
    listenSwitchTab: function(data) {
        var that = this;
        if (data === 0){
            switch (that.state.monitorTabIndex) {
                case 0:
                    this.setState({parentVisible: {visibility: 'inherit'}});
                break;
                case 1:
                    this.setState({parentVisible: {}});
                break;
                case 2:
                    this.setState({parentVisible: {}});
                break;
            }        
            this.setState({tabIndex: 0});
        } else {
            this.setState({parentVisible: {visibility: 'inherit'}});
            this.setState({tabIndex: 1});
        }
    },
    /**
     * 响应Store switchmonitortab事件,设置标签页
     *
     * @param {data} 标签页标识
     */
    listenSwitchMonitorTab: function(data) {
        this.setState({parentVisible: {}});
        this.setState({monitorTabIndex: data});
    },
    /**
     * 响应Store listcolumn事件,设置标签页
     *
     */
    listenListColumn: function() {
        TrackAction.searchallentity(1);
    },
    /**
     * 响应Store alllist事件,设置列表
     *
     * @param {data} entity数据
     */
    listenAllList: function(data) {
        this.setState({allEntity:data});
        if (this.state.manageTabIndex === 0){
            TrackAction.selectcar();
        }
    },
    /**
     * 响应Store selectcardata事件,显示被选车辆
     *
     * @param {data} 选中entity数据
     */
    listenSelectCarData: function(data) {
        mapControl.removeMonitorInfoBox();
        mapControl.removeEntityMarker();

        mapControl.setEntityMarker(data, this.state.service_type);
        mapControl.setMonitorInfoBox(data);

    },

    /**
     * 响应Store boundsearchentity事件,显示范围内车辆
     *
     * @param {Array} data 范围内entity数据
     */
    listenBoundsearchentity(data) {
        let that = this;
        let markerArr = [];
        let MarkerOption = {};
        if (that.state.service_type === 1) {
            // MarkerOption.height = 41;
            // MarkerOption.width = 34;
        } else {
            MarkerOption.height = 27;
            MarkerOption.width = 22;
        }
        if (data.length === 0) {
            mapControl.setBoundSearch([], MarkerOption);
        } else {
            data.map(function (item, index) {
                let img = mapControl.getEntityIcon(that.state.service_type, item);
                img.onload = function () {
                    markerArr.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [item.point[0], item.point[1]]
                        },
                        icon: img,
                        deg: item.direction ? item.direction : 0,
                        entity_name: item.entity_name,
                        entity_status: item.entity_status
                    });
                    if (markerArr.length === data.length) {
                        mapControl.setBoundSearch(markerArr, MarkerOption);
                    }
                };
            });
        }
    },

    /**
     * 响应Store selectcardata事件,显示被选车辆
     *
     */
    listenHideSelectCar() {
        mapControl.removeMonitorInfoBox();
        mapControl.removeEntityMarker();
    },
    /**
     * 响应Store servicetype事件,显示被选车辆
     *
     * @param {data} 选中entity数据
     */
    listenServicetype: function(data) {
        this.setState({service_type: data});
        // console.log('type:' + data);
    },

    /**
     * DOM操作回调，点击选中一辆车
     *
     * @param {object} event 事件对象 
     */
    handleSelectCar: function(event) {
        var realTarget = event.target;
        if (event.target.parentElement.className.indexOf('monitorListItem') > -1) {
            realTarget = event.target.parentElement;
        }
        if (event.target.parentElement.parentElement.className.indexOf('monitorListItem') > -1) {
            realTarget = event.target.parentElement.parentElement;
        }
        var entity_name = realTarget.getAttribute('data-entity_name');
        var entity_status = realTarget.getAttribute('data-entity_status');
        var entity_id = realTarget.getAttribute('data-entity_id');
        this.setState({currentEntityName: entity_name});
        TrackAction.selectcar(entity_name, entity_status, entity_id, 'allCompleteEntities');
    },
    render: function() {
        var monitorTabIndex = this.state.monitorTabIndex;
        var parentVisible = this.state.parentVisible;
        var allEntity = this.state.allEntity;
        var handleSelectCar = this.handleSelectCar;
        var currentEntityName = this.state.currentEntityName;
        return (
            <div className={monitorTabIndex === 0 ? 'monitorAllContent visible' : 'monitorAllContent hidden'} style={parentVisible} >
                    <div className="monitorFrame">
                    {
                        allEntity.map(function(item, key) {
                            return (
                                <div className={'monitorListItem' + item[2] + ((currentEntityName === item[0]) ? ' monitorSelect' : '')} key={key} data-entity_name={item[0]} data-entity_desc={item[4]} data-entity_status={item[2]} data-entity_id={item[3]} onClick={handleSelectCar}>
                                    <div className="monitorListItemName" ><abbr title={item[5]}>{item[5]}</abbr></div>
                                    <div className="monitorListItemSpeed">{item[1]}</div>
                                </div>
                                )
                        })
                    }
                    </div>
                <MonitorAllPage />
            </div>

        )
    }
});

export default Monitorallcontent;
