/**
 * @file 实时监控页签头部分 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.23
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackStore from '../stores/trackStore'
import TrackAction from '../actions/trackAction'


var Monitortab = React.createClass({
    getInitialState: function() {
        return {
            // 所有entity数量
            all: 0,
            // 在线entity数量
            online: 0,
            // 离线entity数量
            offline: 0,
            // 当前选中的实时监控列表
            monitorListTab: 'monitorBottomLineLeft'
        }
    },
    componentDidMount: function () {
        TrackStore.listen(this.onStatusChange);
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'totalall':
                this.listenTotalAll(data);
            break;
            case 'totaloffline':
                this.listenTotalOffline(data);
            break;
            case 'totalonline':
                this.listenTotalOnline(data);
            break;
        }
    },
    /**
     * 响应Store totalall事件，设置全部entity总数
     *
     * @param {data} 总页数
     */
    listenTotalAll: function(data) {
        this.setState({all:data});
    },
    /**
     * 响应Store totaloffline事件，设置全部entity总数
     *
     * @param {data} 总页数
     */
    listenTotalOffline: function(data) {
        this.setState({offline:data});
    },
    /**
     * 响应Store totalonline事件，设置全部entity总数
     *
     * @param {data} 总页数
     */
    listenTotalOnline: function(data) {
        this.setState({online:data});
    },
    /**
     * DOM操作回调，切换实时监控三种列表
     *
     * @param {object} event 事件对象 
     */
    handleChangeMonitorList: function(event) {
        if (event.target.className === 'monitorAll') {
            this.setState({monitorListTab: 'monitorBottomLineLeft'});
            TrackAction.switchmonitortab(0);
        } else if (event.target.className === 'monitorOnline') {
            this.setState({monitorListTab: 'monitorBottomLineMid'});
            TrackAction.switchmonitortab(1);
        } else if (event.target.className === 'monitorOffline') {
            this.setState({monitorListTab: 'monitorBottomLineRight'});
            TrackAction.switchmonitortab(2);
        }
    },
    render: function() {
        var all = this.state.all;
        var online = this.state.online;
        var offline = this.state.offline;
        var monitorListTab = this.state.monitorListTab;
        return (
            <div className="monitorList">
                <div className="monitorAll" style={{color: monitorListTab === 'monitorBottomLineLeft' ? '#0a8cff' : ''}} onClick={this.handleChangeMonitorList}>
                    全部({all})
                </div>
                <div className="monitorOnline" style={{color: monitorListTab === 'monitorBottomLineMid' ? '#0a8cff' : ''}} onClick={this.handleChangeMonitorList}>
                    在线({online})
                </div>
                <div className="monitorOffline" style={{color: monitorListTab === 'monitorBottomLineRight' ? '#0a8cff' : ''}} onClick={this.handleChangeMonitorList}>
                    离线({offline})
                </div>
                <div className={monitorListTab}></div>
            </div>

        )
    }
});

export default Monitortab;
