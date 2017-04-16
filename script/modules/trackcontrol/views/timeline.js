/* globals map */
/* globals BMap */
/* globals Reflux */
/* eslint-disable fecs-camelcase */
/* eslint-disable max-len */
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
    getDefaultProps() {
        return {
            // 时间轴总长
            timelineLong: 721
        };
    },
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
            progress: 0,
            // 当前时间轴位置
            currentProgress: 0,
            // 当前时间轴位置对应的pageX
            currentPageX:  0,
            // 初始鼠标拖动位置
            initMouseX: 0,
            // label的位置
            label: 0,
            // lable可见性
            labelVisible: 'blank',
            // 当前时间轴位置代表的时间戳
            currentTimeStamp: 0,
            // 当前有数据的时间段数组
            dataPart: [],
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
            playSpeedIndex: 5,
            // 浮动时间
            hovertime: '0:0',
            // 卡尺A位置
            caliperAPosition: 0,
            // 卡尺B位置
            caliperBPosition: this.props.timelineLong,
            // 卡尺A的clientX
            caliperAclientX: 0,
            // 当前拖动的卡尺
            caluperCurrent: ''
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
            // this.setState({parentVisible: {visibility: 'inherit'}});
        } else {
            // this.setState({parentVisible: {}});
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
     * 初始化卡尺
     *
     */
    initCaliper() {
        this.setState({
            // 卡尺A位置
            caliperAPosition: 0,
            // 卡尺B位置
            caliperBPosition: this.props.timelineLong,
            // 卡尺A的clientX
            caliperAclientX: 0,
            // 当前拖动的卡尺
            caluperCurrent: ''
        });
    },

    /**
     * 响应Store trackroute事件，绘制时间轴
     *
     * @param {data} 轨迹数据
     */
    listenTrackRoute: function(data) {
        this.initCaliper();
        var that = this;
        if (data.length === 0) {
            return;
        }
        that.setState({totalPointData: data});
        var timePart = [{}];
        var pxPart = [{}];
        var j = 0;
        var date = new Date(data[0].loc_time * 1000);
        // that.setState({initTimeStamp: data[0].loc_time - (data[0].loc_time % 86400 - 57600)});
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
        that.setState({progress: pxPart[0].start_time - 0, currentProgress: pxPart[0].start_time - 0});
        that.setState({initMouseX: $('.timelineProgress').offset().left + 20 });
        that.setState({currentPageX: $('.timelineProgress').offset().left + 20 });
        if (typeof(canvasLayerRunning) != "undefined") {
            map.removeOverlay(canvasLayerRunning);
            canvasLayerRunning = undefined;
        }
        that.setState({playOrPause: 'timelinePlay'});
        that.setRunningPointByProgress(pxPart[0].start_time - 0);
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
        $(document).off('mousemove', that.onProgessDrag);
        $(document).off('mouseup', that.onProgressDragMouseUp);
        this.setState({currentProgress: that.state.progress});
        // this.setState({currentTimeStamp: that.getTimeByPx(that.state.progress)});
        // var point = that.getPointByTime(that.getTimeByPx(that.state.progress));
        // if (point.loc_time !== undefined){
        //     that.setRunningPoint(point);
        // }
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
            return true;
        }
        this.setState({initMouseX: event.clientX});
        $(document).on('mousemove', that.onProgessDrag);
        $(document).on('mouseup', that.onProgressDragMouseUp);
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
            if (that.state.progress + speed > that.state.caliperBPosition) {
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
    handleTimelineClick(event) {
        if (this.state.totalPointData.length === 0) {
            return;
        }
        if (event.target.className === 'timelineProgress' || event.target.className.indexOf('caliperPointer') > -1)  {
            return;
        }
        this.jumpTime(event.clientX);
    },

    /**
     * DOM操作回调，点击时间轴跳跃时间
     *
     * @param {number} clientx 偏移
     */
    jumpTime(clientx) {
        let that = this;
        let x = clientx - $('.timelineMain').offset().left;
        that.setState({progress: x});
        that.setState({currentProgress: x});
        that.setState({currentPageX: clientx});
        that.setRunningPointByProgress(x);
    },
    /**
     * view 内部 拖动事件监听
     *
     * @param {object} event 事件对象 
     */
    onProgessDrag(event) {
        let x = event.clientX - this.state.initMouseX;
        let newProgress = x + this.state.currentProgress;
        if (newProgress >= 0 && newProgress <= this.props.timelineLong) {
            this.setState({progress: newProgress});
        }
        // var point = this.getPointByTime(this.getTimeByPx(newProgress));
        // if (point.loc_time !== undefined){
        //     this.setRunningPoint(point);
        // }
        this.setRunningPointByProgress(newProgress);
        this.handleHoverLabel(event);
    },
    /**
     * view 内部 拖动抬起鼠标
     *
     * @param {object} event 事件对象 
     */
    onProgressDragMouseUp (event) {
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
        // 像素 = (当前时间戳 + （北京时区 * 60 * 60））% 一天的秒) / (一个时间轴像素代表的秒数)
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
        time = (px) * 120 + this.state.initTimeStamp;
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
            let ctx = this.canvas.getContext("2d");
            if (!ctx) {
                return;
            }
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            let point = new BMap.Point(data.longitude, data.latitude);
            let pixel = map.pointToPixel(point);
            
            ctx.beginPath();
            ctx.strokeStyle = '#d0d4d7'
            ctx.arc(pixel.x, pixel.y, 35, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.fillStyle = 'rgba(35, 152, 255, 0.14)';
            ctx.arc(pixel.x, pixel.y, 34, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.strokeStyle = '#c2c2c4';
            ctx.arc(pixel.x, pixel.y, 8, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.fillStyle = '#fff';
            ctx.arc(pixel.x, pixel.y, 7, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = '#1496ff';
            ctx.arc(pixel.x, pixel.y, 2.6, 0, 2 * Math.PI);
            ctx.fill();
        }
        if(typeof(canvasLayerRunning) != 'undefined') {
            canvasLayerRunning.options.update = update;
            canvasLayerRunning._draw();
            return;
        }
        window.canvasLayerRunning =  new CanvasLayer({
            map: map,
            update: update,
            zIndex: 10
        });
    },
    /**
     * view 内部 根据时间轴位置设置轨迹点位置
     *
     * @param {number} progress 时间戳 
     */
    setRunningPointByProgress(progress) {
        let point = this.getPointByTime(this.getTimeByPx(progress + 0));
        if (point.loc_time !== undefined){
            this.setRunningPoint(point);
        }
    },

    /**
     * DOM操作回调，鼠标浮动到时间轴上后显示事件label
     *
     * @param {Object} event 事件对象
     */
    handleHoverLabel(event) {
        if (event.target.className.indexOf('caliperPointer') > -1) {
            return;
        }
        let x = event.clientX - $('.timelineMain').offset().left;
        // 一像素两分钟
        let time = x * 120;
        let hour = parseInt(time / (60 * 60), 10);
        let min = parseInt(time % (60 * 60) / 60, 10);
        this.setState({
            labelVisible: 'block'
        });
        if (hour >= 0 && hour <= 24 && min >= 0 && min <= 59 && hour * 100 + min <= 2400) {
            min = min >= 10 ? min : '0' + min;
            this.setState({
                label: x,
                hovertime: hour + ':' + min
            });
        }
    },

    /**
     * DOM操作回调，鼠标移动开关闭label的显示
     *
     * @param {Object} event 事件对象
     */
    handleOffLabel(event) {
        this.setState({
            labelVisible: 'blank'
        });
    },

    /**
     * DOM操作回调，点击卡尺
     *
     * @param {Object} event 事件对象
     */
    handleCaliperDragStart(event) {
        if (this.state.totalPointData.length === 0) {
            return;
        }
        let that = this;
        let caluperCurrent = event.target.parentElement.className;
        that.setState({
            caluperCurrent: caluperCurrent
        });
        $(document).on('mousemove', that.handleCaliperDrag);
        $(document).on('mouseup', that.handleCaliperDragEnd);
        $('body').css('user-select', 'none');
    },

    /**
     * DOM操作回调，拖动卡尺
     *
     * @param {Object} event 事件对象
     */
    handleCaliperDrag(event) {
        let x = event.clientX - $('.timelineMain').offset().left;
        if (x < 0 || x > this.props.timelineLong) {
            return;
        }
        let caluperCurrent = this.state.caluperCurrent;
        if (caluperCurrent === 'caliperA' && x < this.state.caliperBPosition) {
            this.setState({
                caliperAPosition: x
            });
        } else if (caluperCurrent === 'caliperB' && x > this.state.caliperAPosition) {
            this.setState({
                caliperBPosition: x
            });
        }
        this.handleHoverLabel(event);
    },

    /**
     * DOM操作回调，抬起卡尺
     *
     * @param {Object} event 事件对象
     */
    handleCaliperDragEnd(event) {
        let x = event.clientX - $('.timelineMain').offset().left;
        let clientx = event.clientX;
        if (x < 0) {
            x = 0;
            clientx = $('.timelineMain').offset().left;
        } else if (x >= this.props.timelineLong) {
            x = this.props.timelineLong;
            clientx = $('.timelineMain').offset().left + this.props.timelineLong;
        }
        // 设置卡尺位置
        let caluperCurrent = this.state.caluperCurrent;
        if (caluperCurrent === 'caliperA' && x < this.state.caliperBPosition) {
            this.setState({
                caliperAPosition: x
            });
            let starttime = this.getTimeByPx(x);
            let endtime = this.getTimeByPx(this.state.caliperBPosition);
            TrackAction.changeTimeline(starttime, endtime);
        } else if (caluperCurrent === 'caliperB' && x > this.state.caliperAPosition) {
            this.setState({
                caliperBPosition: x
            });

            let starttime = this.getTimeByPx(this.state.caliperAPosition);
            let endtime = this.getTimeByPx(x);
            TrackAction.changeTimeline(starttime, endtime);
        }

        $('body').css('user-select', 'text');
        $(document).off('mousemove', this.handleCaliperDrag);
        $(document).off('mouseup', this.handleCaliperDragEnd);


        // 控制播放进度跳转
        if (this.state.caluperCurrent === 'caliperA') {
            this.jumpTime(clientx);
        } else {
            this.jumpTime(this.state.caliperAPosition + $('.timelineMain').offset().left);
        }

        // 暂定播放
        this.handlePlayOrPause({
            target: {
                className: 'timelinePause'
            }
        });
    },

    render: function() {
        let timeCount = this.state.timeCount;
        let timeNumber = this.state.timeNumber;
        let handleProgressDragEnd = this.handleProgressDragEnd;
        let progress = this.state.progress;
        let handleProgressDragStart = this.handleProgressDragStart;
        let handleTimelineClick = this.handleTimelineClick;
        let dataPart = this.state.dataPart;
        let playOrPause = this.state.playOrPause;
        let handlePlayOrPause = this.handlePlayOrPause;
        let handleSlow = this.handleSlow;
        let handleQuick = this.handleQuick;
        let tabIndex = this.state.tabIndex;
        let parentVisible = this.state.parentVisible;
        let handleHoverLabel = this.handleHoverLabel;
        let handleOffLabel = this.handleOffLabel;
        let labelVisible = this.state.labelVisible;
        let label = this.state.label;
        let hovertime = this.state.hovertime;
        let handleCaliperDragStart = this.handleCaliperDragStart;
        let caliperAPosition = this.state.caliperAPosition;
        let caliperBPosition = this.state.caliperBPosition;
        let timelineLong = this.props.timelineLong;
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
                <div className="timelineMain" onClick={handleTimelineClick} onMouseOver={handleHoverLabel} onMouseOut={handleOffLabel}>
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
                    <div className={'timelineLabel ' + labelVisible} style={{left: label + 'px'}}>
                        <div className="timelineLabelcontent">
                            {hovertime}
                        </div>
                        <div className="timelineLabelpointer">
                        </div>
                    </div>
                    <div className="caliperA" style={{left: caliperAPosition + 'px'}}>
                        <div className="caliperLine"></div>
                        <div className="caliperPointerA" onMouseDown={handleCaliperDragStart}></div>
                    </div>
                    <div className="caliperB" style={{left: caliperBPosition + 'px'}}>
                        <div className="caliperLine"></div>
                        <div className="caliperPointerB" onMouseDown={handleCaliperDragStart}></div>
                    </div>
                    <div className="caliperPartA" style={{width: caliperAPosition + 'px'}}></div>
                    <div className="caliperPartB" style={{width: timelineLong - caliperBPosition + 'px'}}></div>
                </div>
            </div>
        )
    }
});

export default Timeline;
