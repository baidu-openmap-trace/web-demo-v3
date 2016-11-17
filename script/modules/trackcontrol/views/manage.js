/**
 * @file 轨迹管理台 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.22
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import CommonStore from '../../common/stores/commonStore'
import Managetitle from 'managetitle'
import Managetoggle from 'managetoggle'

var Manage = React.createClass({
    render: function() {
        return (
        <div className="manage">
            <div className="manageControl">
                <Managetitle />
                <Managetoggle />
            </div>
        </div>
        )
    }
});

export default Manage;
