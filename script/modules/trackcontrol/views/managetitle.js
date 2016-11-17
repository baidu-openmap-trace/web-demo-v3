/**
 * @file 轨迹管理台头部标题 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.23
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackStore from '..//stores/trackStore'
import TrackAction from '../actions/trackAction'

var Managetitle = React.createClass({
    getInitialState: function() {
        return {
            // 当前service名
            serviceName: '',
            // 当前toggle状态class名
            toggleClass: 'toggleInManage'
        }
    },
    componentDidMount: function () {
        TrackAction.getservicename();
        TrackStore.listen(this.onStatusChange);
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'servicename':
                this.lisenUpdateServiceName(data);
            break;
        }
    },
    /**
     * 响应Store servicename事件，更新service名称
     *
     * @param {data} 标签页标识
     */
    lisenUpdateServiceName: function(data) {
        this.setState({serviceName: data + '管理'});
    },
    /**
     * DOM操作回调，点击收起放开按钮
     *
     * @param {object} event 事件对象 
     */
    handleToggle: function(event) {
        if (this.state.toggleClass === 'toggleInManage') {
            this.setState({toggleClass: 'toggleOutManage'});
        } else {
            this.setState({toggleClass: 'toggleInManage'})
        }
    },
    render: function() {
        var serviceName = this.state.serviceName;
        var toggleClass = this.state.toggleClass;
        return (
            <div className="manageTop">
                <div className="serviceName">{serviceName}</div>
                <div className={toggleClass} data-toggle="collapse" data-target="#manageBottom" onClick={this.handleToggle}></div>
            </div>
        )
    }
});

export default Managetitle;
