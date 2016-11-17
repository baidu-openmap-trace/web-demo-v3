/**
 * @file 轨迹管理台时间轴 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.31
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackAction from '../actions/trackAction'
import TrackStore from '../stores/trackStore'
import CommonStore from '../../common/stores/commonStore'

var Timeline = React.createClass({
    getInitialState: function() {
        return {
            // 页签编码 0为实时监控 1为轨迹查询
            tabIndex: 0,
            // 父容器可见性
            parentVisible: {},
            // 时间轴显示的小时数量
            timeCount: [],
            // 时间轴显示的时间数字标识
            timeNumber: [],
            // 时间轴位置
            progress: -20,
            // 当前时间轴位置
            currentProgress:  -20,
            // 当前时间轴位置对应的pageX
            currentPageX:  0,
            // 初始鼠标拖动位置
            initMouseX: 0,
            // 当前时间轴位置代表的时间戳
            currentTimeStamp: 0,
            // 当前有数据的时间段数组
            dataPart:[],
            // 当天起始时间时间错
            initTimeStamp: 0,
            // 所有路径点数据
            totalPointData:[],
            // 播放按钮状态
            playOrPause: 'timelinePlay',
            // 播放速度，常规速度为0.1/frame 
            // 减速为 0.08,0.06,0.04,0.02,0.01 
            // 加速为 0.12,0.14,0.16,0.18,0.20
            playSpeed: [0.01, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14, 0.16, 0.18, 0.2],
            //当前播放速度位置
            playSpeedIndex: 5
        }
    },
    componentDidMount: function () {
        TrackStore.listen(this.onStatusChange);
        CommonStore.listen(this.onStatusChange);
        this.initTimeCount();
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'trackroute':
               this.listenTrackRoute(data);
            break;
            case 'switchmanagetab':
                this.listenSwitchmanageTab(data);
            break;
            case 'switchtab':
                this.listenSwitchTab(data);
            break;
        }
    },
    /**
     * 响应Store switchmanagetab事件，设置标签页
     *
     * @param {data} 标签页标识
     */
    listenSwitchmanageTab: function(data) {
        this.setState({tabIndex: data});
        if (data === 0){

        } else {

        }
    },
    /**
     * 响应Store switchtab事件，隐藏manage
     *
     * @param {data} 标签页标识
     */
    listenSwitchTab: function(data) {
        if (data === 0){
            this.setState({parentVisible: {}});
        } else {
            this.setState({parentVisible: {visibility: 'inherit'}});
        }
    },
    /**
     * 响应Store trackroute事件，绘制时间轴
     *
     * @param {data} 轨迹数据
     */
    listenTrackRoute: function(data) {
        var that = this;
        if (data.length === 0) {
            return;
        }
        that.setState({totalPointData: data});
        var timePart = [{}];
        var pxPart = [{}];
        var j = 0;
        var date = new Date(data[0].loc_time * 1000);
        that.setState({initTimeStamp: data[0].loc_time - (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds())});
        timePart[j].start_time = data[0].loc_time;
        pxPart[j].start_time = that.getPxByTime(data[0].loc_time);
        for (var i = 0; i < data.length - 1; i++) {
            if (data[i + 1].loc_time - data[i].loc_time <= 5 * 60) {
                timePart[j].end_time = data[i + 1].loc_time;
                pxPart[j].end_time = that.getPxByTime(data[i + 1].loc_time);
            } else {
                j++;
                timePart[j] = {};
                timePart[j].start_time = data[i + 1].loc_time;
                pxPart[j] = {};
                pxPart[j].start_time = that.getPxByTime(data[i + 1].loc_time);
            }
        }
        that.setState({dataPart: pxPart});
        that.setState({progress: pxPart[0].start_time - 20, currentProgress: pxPart[0].start_time - 20});
        that.setState({initMouseX: $('.timelineProgress').offset().left + 20 });
        that.setState({currentPageX: $('.timelineProgress').offset().left + 20 });
        if (typeof(canvasLayerRunning) != "undefined") {
            map.removeOverlay(canvasLayerRunning);
            canvasLayerRunning = undefined;
        }
        that.setState({playOrPause: 'timelinePlay'});
        that.setRunningPointByProgress(pxPart[0].start_time - 20);
    },
    /**
     * 初始化时间轴
     *
     */
    initTimeCount: function() {
        var tempA = [];
        var tempB = [];
        for(var i = 0; i < 24; i++){
            tempA[i] = i;
        }
        this.setState({timeCount: tempA});
        for(var i = 0; i < 25; i++){
            tempB[i] = i;
        }
        this.setState({timeNumber: tempB});
    },
    /**
     * DOM操作回调，拖动时间轴位置
     *
     * @param {object} event 事件对象 
     */
    handleProgressDragEnd: function (event) {
        var that = this;
        if (that.state.totalPointData.length === 0) {
            return;
        }
        $(document).off('mousemove', that.onDrag);
        $(document).off('mouseup', that.onMouseUp);
        this.setState({currentProgress: that.state.progress});
        that.setRunningPointByProgress(that.state.progress)
    },
    /**
     * DOM操作回调，拖动时间轴位置
     *
     * @param {object} event 事件对象 
     */
    handleProgressDragStart: function (event) {
        var that = this;
        if (that.state.totalPointData.length === 0) {
            return;
        }
        this.setState({initMouseX: event.clientX});
        $(document).on('mousemove', that.onDrag);
        $(document).on('mouseup', that.onMouseUp);
    },
    /**
     * DOM操作回调，播放停止轨迹
     *
     * @param {object} event 事件对象 
     */
    handlePlayOrPause: function (event) {
        if (this.state.totalPointData.length === 0) {
            return;
        }
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        var that = this;
        var newStatus = '';
        var step = function(timestamp) {
            var speed = that.state.playSpeed[that.state.playSpeedIndex];
            that.setState({progress: that.state.progress + speed});
            that.setState({currentProgress: that.state.currentProgress + speed});
            that.setState({currentPageX: that.state.currentPageX + speed});
            that.setRunningPointByProgress(that.state.progress + speed);
            if (that.state.progress + speed > 700) {
                newStatus = 'timelinePlay';
                that.setState({playOrPause: newStatus});
                return;
            }
            if (that.state.playOrPause === 'timelinePause') {
                requestAnimationFrame(step);
            } 
        }
        if (event.target.className === 'timelinePause') {
            newStatus = 'timelinePlay';
        } else {
            newStatus = 'timelinePause';
            requestAnimationFrame(step);
        }
        this.setState({playOrPause: newStatus});
    },
    /**
     * DOM操作回调，加速播放
     *
     * @param {object} event 事件对象 
     */
    handleQuick: function (event) {
        if (this.state.totalPointData.length === 0) {
            return;
        }
        if (this.state.playSpeedIndex === 10) {

        } else {
            this.setState({playSpeedIndex: this.state.playSpeedIndex + 1});
        }
    },
    /**
     * DOM操作回调，减速播放
     *
     * @param {object} event 事件对象 
     */
    handleSlow: function (event) {
        if (this.state.totalPointData.length === 0) {
            return;
        }
        if (this.state.playSpeedIndex === 0) {

        } else {
            this.setState({playSpeedIndex: this.state.playSpeedIndex - 1});
        }
    },
    /**
     * DOM操作回调，点击时间轴跳跃时间
     *
     * @param {object} event 事件对象 
     */
    handleJumpTime: function (event) {
        if (this.state.totalPointData.length === 0) {
            return;
        }
        if (event.target.className == 'timelineProgress') {
            return;
        }
        var that = this;
        var x = event.clientX - that.state.currentPageX + that.state.currentProgress;
        that.setState({progress: x});
        that.setState({currentProgress: x});
        that.setState({currentPageX: event.clientX});
        that.setRunningPointByProgress(x);
    },
    /**
     * view 内部 拖动事件监听
     *
     * @param {object} event 事件对象 
     */
    onDrag: function(event) {
        var x = event.clientX - this.state.initMouseX;
        var newProgress = x + this.state.currentProgress;
        if (newProgress >= -20 && newProgress<= 700) {
            this.setState({progress: newProgress});
        }
        this.setRunningPointByProgress(newProgress);
    },
    /**
     * view 内部 拖动抬起鼠标
     *
     * @param {object} event 事件对象 
     */
    onMouseUp: function(event) {
        this.handleProgressDragEnd();
        this.setState({currentPageX: event.clientX});
    },
    /**
     * view 内部 根据时间戳获取时间轴像素位置
     *
     * @param {number} time 时间戳 
     * @return {number} 像素位置
     */
    getPxByTime: function(time) {
        var px = 0;
        px = (time + 28800) % 86400 / 120;
        return px;
    },
    /**
     * view 内部 根据时间轴位置获取对应数据中时间点
     *
     * @param {number} px 像素位置 
     * @return {number} 时间戳
     */
    getTimeByPx: function(px) {
        var time = 0;
        time = (px + 20) * 120 + this.state.initTimeStamp;
        return time;
    },
    /**
     * view 内部 根据时间获取数据点
     *
     * @param {number} time 时间戳 
     * @return {object} 数据点
     */
    getPointByTime: function(time) {
        var point = {};
        var totalPoint = this.state.totalPointData;
        if (time < totalPoint[0].loc_time) {
            point = totalPoint[0];
            return point;
        }
        if (time > totalPoint[totalPoint.length - 1].loc_time) {
            point = totalPoint[totalPoint.length - 1];
            return point;
        }
        for (var i = 0; i < totalPoint.length - 1; i++){

            if (time >= totalPoint[i].loc_time && time <= totalPoint[i + 1].loc_time) {
                point = totalPoint[i];
                break;
            }
        }
        return point;
    },
    /**
     * view 内部 根据数据点绘制实时位置
     *
     * @param {object} data 数据点 
     */
    setRunningPoint: function(data) {
        var update = function () {
        var ctx = this.canvas.getContext("2d");
        if (!ctx) {
            return;
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var point = new BMap.Point(data.location[0], data.location[1]);
        var pixel = map.pointToPixel(point);
        
        ctx.beginPath();
        ctx.strokeStyle = "#d0d4d7"
        ctx.arc(pixel.x,pixel.y,35,0,2*Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = "rgba(35, 152, 255, 0.14)"
        ctx.arc(pixel.x,pixel.y,34,0,2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = "#c2c2c4"
        ctx.arc(pixel.x,pixel.y,8,0,2*Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = "#fff"
        ctx.arc(pixel.x,pixel.y,7,0,2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "#1496ff"
        ctx.arc(pixel.x,pixel.y,2.6,0,2*Math.PI);
        ctx.fill();
        }
        if(typeof(canvasLayerRunning) != "undefined") {
            canvasLayerRunning.options.update = update;
            canvasLayerRunning._draw();
            return;
        }
        window.canvasLayerRunning =  new CanvasLayer({
            map: map,
            update: update
        });
    },
    /**
     * view 内部 根据时间轴位置设置轨迹点位置
     *
     * @param {number} progress 时间戳 
     */
    setRunningPointByProgress: function(progress) {
        var point = this.getPointByTime(this.getTimeByPx(progress));
        if (point.loc_time !== undefined){
            this.setRunningPoint(point);
        }
    },
    render: function() {
        var timeCount = this.state.timeCount;
        var timeNumber = this.state.timeNumber;
        var handleProgressDragEnd = this.handleProgressDragEnd;
        var progress = this.state.progress;
        var handleProgressDragStart = this.handleProgressDragStart;
        var handleJumpTime = this.handleJumpTime;
        var dataPart = this.state.dataPart;
        var playOrPause = this.state.playOrPause;
        var handlePlayOrPause = this.handlePlayOrPause;
        var handleSlow = this.handleSlow;
        var handleQuick = this.handleQuick;
        var tabIndex = this.state.tabIndex;
        var parentVisible = this.state.parentVisible;
        return (
            <div className={tabIndex === 0 ? 'timeline hidden' : 'timeline visible'} style={parentVisible} >
                <div className="timelineControl">
                    <div className={playOrPause} onClick={handlePlayOrPause}>
                    </div>
                    <div className="timelineSlow" onClick={handleSlow}>
                    </div>
                    <div className="timelineQuick" onClick={handleQuick}>
                    </div>
                </div>
                <div className="timelineMain" onClick={handleJumpTime}>
                    {
                        timeCount.map(function(item, key){
                            return (
                                <div className={'timeHour' + (key === 0 ? ' timeHourFirst' : '') + (key === 23 ? ' timeHourFinal' : '')} key={key}></div>
                                
                            )
                        })
                    }
                    {
                        timeNumber.map(function(item, key){
                            return (
                                 <div className="timeNumber" key={key} style={{left: key * 29.6 - 1 +'px'}} >{key}</div>
                            )
                        })
                    }
                    <div className="timelineProgress" style={{left: progress + 'px'}}  onMouseDown = {handleProgressDragStart}></div>
                    {
                        dataPart.map(function(item, key){
                            return <div className="runPart" key={key} style={{left: item.start_time + 'px',width: item.end_time - item.start_time + 'px'}}></div>
                        })
                    }
                </div>
            </div>
        )
    }
});

export default Timeline;
