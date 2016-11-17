/**
 * @file 设备管理台头部 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

import React, { Component } from 'react'
import { render } from 'react-dom'
import Title from 'title'
import Tabs from 'tabs'

var Header = React.createClass({
    render: function () {
        return (
            <div className="header">
                <Title />
                <Tabs />
            </div>
        )
    }
});

export default Header;
