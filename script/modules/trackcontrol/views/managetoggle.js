/**
 * @file 轨迹管理台收缩部分 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.22
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackStore from '..//stores/trackStore'
import ManageTab from 'managetab'
import Monitor from 'monitor'
import Track from 'track'

var Managetoggle = React.createClass({
    getInitialState: function() {
        return {

        }
    },
    render: function() {
        return (
            <div className="collapse in" id="manageBottom">
                <div className="manageBottom">
                    <ManageTab />
                    <Monitor />
                    <Track />
                </div>
            </div>

        )
    }
});

export default Managetoggle;
