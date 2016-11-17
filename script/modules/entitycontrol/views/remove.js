/**
 * @file 删除entity Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

import React, { Component } from 'react'
import { render } from 'react-dom'
import EntityAction from '../actions/entityAction'
import EntityStore from '../stores/entityStore'

var Remove = React.createClass({
    getInitialState: function() {
        return {
        }
    },
    componentDidMount: function () {
        EntityStore.listen(this.onStatusChange);
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            
        }
    },
    /**
     * DOM操作回调，点击删除按钮
     *
     * @param {object} event 事件对象 
     */
    handleClick: function (event) {
        if(window.confirm("确定要删除选定的设备么?")) {
            EntityAction.remove();
        }
    },
    render: function () {
        return (
            <div className="remove" onClick={this.handleClick}>
                删除
            </div>
        )
    }
});

export default Remove;
