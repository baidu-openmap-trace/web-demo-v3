/**
 * @file 轨迹查询检索entity部分 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.29
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackStore from '../stores/trackStore'
import TrackAction from '../actions/trackAction'

var Tracksearch = React.createClass({
    getInitialState: function() {
        return {
            value: '',
            visible:0,
            cliking: 0
        };
    },
    componentDidMount: function () {
        var self = this;
        TrackStore.listen(self.onStatusChange);
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'tracklistloaded':
                this.listenListcomplete(type);
            break;
        }
    },
    listenListcomplete: function() {
        this.setState({cliking: 0});
    },
    /**
     * DOM操作回调，检索框value改变
     *
     * @param {object} event 事件对象 
     */
    handleChange: function(event) {
        this.setState({value: event.target.value});
        if(event.target.value != '') {
            this.state.visible = 1;
        } else {
            this.state.visible = 0;
            TrackAction.initpagesettrack();
            TrackAction.setsearchentitytrack('');
            TrackAction.tracklist(1);
            this.setState({cliking: 1});
        }
    },
    /**
     * DOM操作回调，检索框value清空
     *
     * @param {object} event 事件对象 
     */
    handleClearClick: function(event) {
        if (this.state.cliking === 1) {
            return;
        }
        TrackAction.initpagesettrack();
        this.setState({value: '',visible:0});
        TrackAction.setsearchentitytrack('');
        TrackAction.tracklist(1);
        this.setState({cliking: 1});  
    },
    /**
     * DOM操作回调，检索
     *
     * @param {object} event 事件对象 
     */
    handleClickSearch: function(event) {
        if (this.state.cliking === 1) {
            return;
        }
        TrackAction.initpagesettrack();
        TrackAction.setsearchentitytrack(this.state.value);
        TrackAction.tracklist(1);
        this.setState({cliking: 1});
    },
    /**
     * DOM操作回调，点击回车检索
     *
     * @param {object} event 事件对象 s
     */
    handleKeyBoard: function(event) {
        if (this.state.cliking === 1) {
            return;
        }
        if (event.key === 'Enter') {
            TrackAction.initpagesettrack();
            TrackAction.setsearchentitytrack(this.state.value);
            TrackAction.tracklist(1);
            this.setState({cliking: 1});
        }
    },
    render: function() {
        var searchicon = __uri('/static/images/searchicon_2x.png');
        var clearsearch = __uri('/static/images/clearsearch_2x.png');
        return (
            <div className="trackSearch">
                <input className="searchInputMonitor" placeholder="请输入关键字"   value={this.state.value} onChange={this.handleChange} onKeyPress={this.handleKeyBoard}/>
                <img src={searchicon} className="searchBtnMonitor"  onClick={this.handleClickSearch} />
                <div className="lineMonitor"></div>
                <img src={clearsearch} className={this.state.visible === 0 ? 'clearSearchBtnMonitor hideCommon':'clearSearchBtnMonitor'}  onClick={this.handleClearClick}/>     
            </div>

        )
    }
});

export default Tracksearch;