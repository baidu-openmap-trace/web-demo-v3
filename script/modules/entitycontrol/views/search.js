/**
 * @file 检索entity Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

import React, { Component } from 'react'
import { render } from 'react-dom'
import EntityStore from '../stores/entityStore'
import EntityAction from '../actions/entityAction'

var Search = React.createClass({
    getInitialState: function() {
        return {
            value: '',
            visible:0,
            cliking: 0
        };
    },
    componentDidMount: function () {
        var self = this;
        EntityStore.listen(self.onStatusChange);
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'listcomplete':
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
            EntityAction.initpageset();
            EntityAction.setsearchentity('');
            EntityAction.list(1);
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
        EntityAction.initpageset();
        this.setState({value: '',visible:0});
        EntityAction.setsearchentity('');
        EntityAction.list(1);
        this.setState({cliking: 1});
    },
    /**
     * DOM操作回调，检索
     *
     * @param {object} event 事件对象 s
     */
    handleClickSearch: function(event) {
        if (this.state.cliking === 1) {
            return;
        }
        EntityAction.initpageset();
        EntityAction.setsearchentity(this.state.value);
        EntityAction.list(1);
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
            EntityAction.initpageset();
            EntityAction.setsearchentity(this.state.value);
            EntityAction.list(1);
            this.setState({cliking: 1});
        }
    },
    render: function () {
        var searchicon = __uri('/static/images/searchicon_2x.png');
        var clearsearch = __uri('/static/images/clearsearch_2x.png');
        return (
            <div className="searchEntity">
                <input className="searchInput" placeholder="请输入名称"   value={this.state.value} onChange={this.handleChange} onKeyPress={this.handleKeyBoard}/>
                <img src={searchicon} className="searchBtn" onClick={this.handleClickSearch}  />
                <div className="line"></div>
                <img src={clearsearch} className={this.state.visible === 0 ? 'clearSearchBtn hideCommon':'clearSearchBtn'}  onClick={this.handleClearClick}/>     
            </div>
        )
    }
});

export default Search;
