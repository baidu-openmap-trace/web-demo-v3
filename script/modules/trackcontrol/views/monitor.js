/**
 * @file 实时监控 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.23
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackStore from '..//stores/trackStore'
import CommonStore from '../../common/stores/commonStore'
import Monitorsearch from 'monitorsearch'
import Monitortab from 'monitortab'
import MonitorAllContent from 'monitorallcontent'
import MonitorOnlineContent from 'monitoronlinecontent'
import MonitorOfflineContent from 'monitorofflinecontent'
import TrackAction from '../actions/trackAction'

var Monitor = React.createClass({
    getInitialState: function() {
        return {
            // 页签编码 0为实时监控 1为轨迹查询
            tabIndex: 0,
            // 父容器可见性
            parentVisible: {}
        }
    },
    componentDidMount: function () {
        TrackStore.listen(this.onStatusChange);
        CommonStore.listen(this.onStatusChange);
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'switchmanagetab':
               this.listenSwitchmanageTab(data);
            break;
            case 'switchtab':
                this.listenSwitchTab(data);
            break;
        }
    },
    /**
     * 响应Store list事件，设置标签页
     *
     * @param {data} 标签页标识
     */
    listenSwitchmanageTab: function(data) {
        this.setState({tabIndex: data});
        if(data === 0){
            
        } else {
            
        }
    },
    /**
     * 响应Store switchtab事件，隐藏manage
     *
     * @param {data} 标签页标识
     */
    listenSwitchTab: function(data) {
        if (data === 0){
            this.setState({parentVisible: {}});
        } else {
            this.setState({parentVisible: {visibility: 'inherit'}});
        }
        
    },
    render: function() {
        var tabIndex = this.state.tabIndex;
        var parentVisible = this.state.parentVisible;
        return (
            <div className={tabIndex === 1 ? 'monitor hidden' : 'monitor visible'} style={parentVisible} >
                <Monitorsearch />
                <Monitortab />
                <MonitorAllContent />
                <MonitorOnlineContent />
                <MonitorOfflineContent />
            </div>

        )
    }
});

export default Monitor;
