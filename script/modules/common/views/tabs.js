/**
 * @file 切换功能页签 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

import React, { Component } from 'react'
import { render } from 'react-dom'
import CommonAction from '../actions/commonAction'
import CommonStore from '../stores/commonStore'

var Tabs = React.createClass({
    getInitialState: function() {
        return {
            // 当前tab页签
            currentIndex: 0
        };
    },
    render: function () {
        var that = this;
        var tabsArray = ['轨迹监控', '终端管理'];
        return (
            <div className="tab">
                {
                    tabsArray.map(function (tabsName, index) {
                        return (
                            <div className="tabItem" key={index}>
                                <span key={index} onClick={ () => { that.setState({currentIndex : index}); CommonAction.switchtab(index)} } className={index === that.state.currentIndex?'active':''}>{tabsName}</span>
                            </div>
                        ) 
                    })
                }
            </div>
        )
    }
});

export default Tabs;
