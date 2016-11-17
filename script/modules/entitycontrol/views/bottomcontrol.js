/**
 * @file 页面底部 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import SelectAll from 'selectall'
import Remove from 'remove'
import Page from 'page'

var Bottomcontrol = React.createClass({
    render: function () {
        return (
            <div className="bottomControl">
                <SelectAll />
                <Remove />
                <Page />
            </div>
        )
    }
});

export default Bottomcontrol;
