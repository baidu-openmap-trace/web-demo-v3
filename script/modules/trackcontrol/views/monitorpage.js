/**
 * @file 轨迹监控页码翻页部分 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.24
 */

import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackAction from '../actions/trackAction'
import TrackStore from '../stores/trackStore'

var Monitorpage = React.createClass({
    getInitialState: function() {
        return {
            // 当前页码
            currentPage: 1,
            // 输入框中的页码
            inputPage: 1,
            // 总页码
            totalPage: 0,
            // 上一页按钮的样式，分为lasepageon&lastPageOff两种
            lastPage: 'lastPageOff',
            // 下一页按钮的样式，分为nextPageOn&nextPageOff两种
            nextPage: 'nextPageOff',
            // 翻页状态，当正在翻页过程中，翻页按钮不可点
            cliking: 0
        }
    },
    componentDidMount: function () {
        TrackStore.listen(this.onStatusChange);
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'totalpage':
                this.listenTotalpage(data);
            break;
            case 'listcomplete':
                this.listenListcomplete();
            break;
        }
    },
    /**
     * 响应Store totalpage事件，设置总数量量
     *
     * @param {data} 总页数
     */
    listenTotalpage: function(data) {
        this.setState({totalPage:data});
        this.setSwichPageStyle(this.state.currentPage);
    },
    /**
     * 响应Store listcomplete事件，开启翻页按钮可点
     *
     */
    listenListcomplete: function() {
        this.setState({cliking: 0});
    },
    /**
     * DOM操作回调，页码输入value变化
     *
     * @param {object} event 事件对象 
     */
    handleChange: function (event) {
        this.setState({inputPage:parseInt(event.target.value)});
    },
    /**
     * DOM操作回调，点击跳转页面按钮
     *
     * @param {object} event 事件对象 
     */
    handleJumppage: function (event) {
        var jumpPage = this.state.inputPage;
        this.setState({currentPage: jumpPage});
        TrackAction.list(jumpPage);
    },
    /**
     * DOM操作回调，点击上一页
     *
     * @param {object} event 事件对象 
     */
    handleLastpage: function (event) {
        if(this.state.currentPage === 1 || this.state.cliking === 1) {
            return;
        } else {
            var lastPage = this.state.currentPage - 1;
            this.setState({currentPage: lastPage});
            this.setState({inputPage: lastPage});
            TrackAction.list(lastPage);
            this.setState({cliking: 1});
        }
    },
    /**
     * DOM操作回调，点击下一页
     *
     * @param {object} event 事件对象 
     */
    handleNextpage: function (event) {
        if(this.state.currentPage === this.state.totalPage || this.state.cliking === 1) {
            return;
        } else {
            var nextPage = this.state.currentPage + 1;
            this.setState({currentPage: nextPage});
            this.setState({inputPage: nextPage});
            TrackAction.list(nextPage);
            this.setState({cliking: 1});
        }
    },
    /**
     * view内部，设置翻页按钮样式
     *
     * @param {number} jumpPage 要跳转到的页 
     */
    setSwichPageStyle: function (jumpPage) {
        if(jumpPage === 1) {
            this.setState({lastPage: 'lastPageOff'});
        } else {
            this.setState({lastPage: 'lastPageOn'});
        }
        if(jumpPage === this.state.totalPage) {
            this.setState({nextPage: 'nextPageOff'});
        } else {
            this.setState({nextPage: 'nextPageOn'});
        }
        this.setState({currentPage: jumpPage});
    },
    render: function () {
        var currentPage = this.state.currentPage;
        var totalPage = this.state.totalPage;
        var lastPage = this.state.lastPage;
        var nextPage = this.state.nextPage;
        var inputPage = this.state.inputPage;
        return (
            <div className="monitorPage">
                <div className="jumpPage">
                    <input type="number" className="inputPage" value={inputPage} onChange={this.handleChange} min="0" max={totalPage} />
                    <span className="pageNumber">/{'    ' + totalPage}页</span>
                    <span className="goPage" onClick={this.handleJumppage}>GO</span>
                </div>
                <div className="switchPage">
                    <span className={lastPage} onClick={this.handleLastpage}></span>
                    <span className={nextPage} onClick={this.handleNextpage}></span>
                </div>
            </div>
        )
    }
});

export default Monitorpage;
