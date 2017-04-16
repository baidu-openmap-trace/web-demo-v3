/**
 * @file 实时监控离线 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.23
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackStore from '../stores/trackStore'
import CommonStore from '../../common/stores/commonStore'
import MonitorOnlinePage from 'monitoronlinepage'
import TrackAction from '../actions/trackAction'

var Monitoronlinecontent = React.createClass({
    getInitialState: function() {
        return {
            // 页签编码 0为实时监控 1为轨迹查询
            tabIndex: 0,
            // monitor三种列表类型编码 0全部 1在线 2离线
            monitorTabIndex: 0,
            // 父容器可见性
            parentVisible: {},
            // 当前列表内容
            allEntity: [],
            // 当前选中的entityname
            currentEntityName: ''
        }
    },
    componentDidMount: function () {
        TrackStore.listen(this.onStatusChange);
        CommonStore.listen(this.onStatusChange);
        // TrackAction.listcolumn();
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
            case 'onlinelist':
                this.listenOnlineList(data);
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
        } else {
            this.setState({parentVisible: {visibility: 'inherit'}});
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
                    this.setState({parentVisible: {}});
                break;
                case 1:
                    this.setState({parentVisible: {visibility: 'inherit'}});
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
        TrackAction.searchonlineentity(1);
    },
    /**
     * 响应Store onlinelist事件,设置列表
     *
     * @param {data} entity数据
     */
    listenOnlineList: function(data) {
        this.setState({allEntity:data});
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
        // $('.monitorListItem0, .monitorListItem1, .monitorListItem2').removeClass('monitorSelect');
        // $(realTarget).addClass('monitorSelect');
        var entity_id = realTarget.getAttribute('data-entity_id');
        this.setState({currentEntityName: entity_name});
        TrackAction.selectcar(entity_name, entity_status, entity_id, 'onlineCompleteEntities');
    },
    render: function() {
        var monitorTabIndex = this.state.monitorTabIndex;
        var parentVisible = this.state.parentVisible;
        var allEntity = this.state.allEntity;
        var handleSelectCar = this.handleSelectCar;
        var currentEntityName = this.state.currentEntityName;
        return (
            <div className={monitorTabIndex === 1 ? 'monitorOnlineContent visible' : 'monitorOnlineContent hidden'} style={parentVisible} >
                    <div className="monitorFrame">
                    {
                        allEntity.map(function(item, key) {
                            return (
                                <div className={'monitorListItem' + item[2] + ((currentEntityName === item[0]) ? ' monitorSelect' : '')} key={key} data-entity_name={item[0]} data-entity_status={item[2]} data-entity_id={item[3]} onClick={handleSelectCar}>
                                    <div className="monitorListItemName"><abbr title={item[5]}>{item[5]}</abbr></div>
                                    <div className="monitorListItemSpeed">{item[1]}</div>
                                </div>
                                )
                        })
                    }
                    </div>
                <MonitorOnlinePage />
            </div>

        )
    }
});

export default Monitoronlinecontent;
