/**
 * @file 全选当前页entity Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

import React, { Component } from 'react'
import { render } from 'react-dom'
import EntityAction from '../actions/entityAction'
import EntityStore from '../stores/entityStore'


var Selectall = React.createClass({
    getInitialState: function() {
        return {
        }
    },
    componentDidMount: function () {
        var self = this;
        EntityStore.listen(self.onStatusChange);
        this.setCheckboxStyle();
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'listcomplete':
                this.listenListcomplete();
            break;
        }
    },
    /**
     * 响应Store listcomplete事件，取消所有checkbox选中状态
     *
     */
    listenListcomplete: function() {
        $('#checkAll').iCheck('uncheck');
    },
    /**
     * view内部，初始化checkbox样式，添加监听
     *
     */
    setCheckboxStyle: function () {
        $('#checkAll').iCheck({
            checkboxClass: 'icheckbox_square-blue',
            radioClass: 'iradio_square',
            increaseArea: '20%' // optional
        });
        $('#checkAll').on('ifChecked', function(event){
            EntityAction.checkall();
        });
        $('#checkAll').on('ifUnchecked', function(event){
            EntityAction.uncheckall();
        });
    },
    render: function () {
        return (
            <div className="selectAll">
                <label>
                    <input type="checkbox" id="checkAll"/>
                    <span className="allCheck">全选</span>
                </label>
            </div>
        )
    }
});

export default Selectall;
