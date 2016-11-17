/**
 * @file 页面检索添加栏 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import Search from 'search'

var Control = React.createClass({
    render: function () {
        return (
            <div className="control">
                <Search />
            </div>
        )
    }
});

export default Control;
