/**
 * @file 轨迹管理台Tab切换 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.22
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackAction from '../actions/trackAction'
import TrackStore from '../stores/trackStore'

var Managetab = React.createClass({
    getInitialState: function() {
        return {
            pointerTab: 'pointerTabLeft',
            pointerTabIndex: 0
        }
    },
    /**
     * DOM操作回调，切换标签页
     *
     * @param {object} event 事件对象 
     */
    handleToggle: function(event) {
        if (event.target.className === 'trackTab') {
            this.setState({pointerTab: 'pointerTabRight'});
            this.setState({pointerTabIndex: 1});
            TrackAction.switchmanagetab(1);
        } else {
            this.setState({pointerTab: 'pointerTabLeft'});
            this.setState({pointerTabIndex: 0});
            TrackAction.switchmanagetab(0);
        }
    },
    render: function() {
        var pointerTab = this.state.pointerTab;
        return (
            <div className="manageTab">
                <div className="monitorTab" onClick={this.handleToggle}>
                    实时监控
                    <div className="monitorTabIcon"></div>
                </div>
                <div className="trackTab" onClick={this.handleToggle}>
                    轨迹查询
                    <div className="trackTabIcon"></div>
                </div>
                <div className={pointerTab}></div>
            </div>

        )
    }
});

export default Managetab;
