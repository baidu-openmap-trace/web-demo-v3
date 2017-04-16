/* globals map */
/* globals BMap */
/* globals mapControl */
/* eslint-disable fecs-camelcase */
/* eslint-disable max-len */
/**
 * @file 轨迹分析 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.09.02
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackStore from '../stores/trackStore'
import CommonStore from '../../common/stores/commonStore'
import TrackAction from '../actions/trackAction'

var TrackAnalysis = React.createClass({
    componentDidUpdate: function() {
        // this.setLocalStorageSet();
    },
    getInitialState: function() {
        return {
            // 页签编码 0为实时监控 1为轨迹查询
            tabIndex: 0,
            // 父容器可见性
            parentVisible: {},
            // 轨迹纠偏开关状态及样式
            processSwitch: 'processSwitchOff',
            // 驾驶分析开关状态及样式
            behaviorSwitch: 'behaviorSwitchOff',
            // 轨迹纠偏标题文字状态及样式
            analysisHeaderTitle1: 'analysisHeaderTitle1Off',
            // 轨迹纠偏标题图标状态及样式
            analysisHeaderPoint1: 'analysisHeaderPointOffDown',
            // 轨迹纠偏标题文字状态及样式
            analysisHeaderTitle2: 'analysisHeaderTitle2Off',
            // 轨迹纠偏标题图标状态及样式
            analysisHeaderPoint2: 'analysisHeaderPointOffDown',
            // 驾驶分析数字状态及样式
            controlItemNum1: 'controlItemNumOff',
            // 驾驶分析数字状态及样式
            controlItemNum2: 'controlItemNumOff',
            // 驾驶分析数字状态及样式
            controlItemNum3: 'controlItemNumOff',
            // 驾驶分析数字状态及样式
            controlItemNum4: 'controlItemNumOff',
            // 当前显示的控件，0无，1轨迹纠偏，2轨迹分析
            analysisTab: 0,
            // 当前轨迹纠偏对象
            trackProcess: {
                is_processed: '0',
                need_denoise: '1',
                need_vacuate: '1',
                need_mapmatch: '0',
                transport_mode: '1'
            },
            // 当前轨迹驾驶行为分析
            behavior: {
                behaviorSpeeding: 0,
                behaviorAcceleration: 0,
                behaviorSteering: 0
            },
            // 停留点信息
            behaviorStaypoint: 0,
            // 驾驶行为四个checkbox状态，0未选中 1选中
            behaviorCheck: [0, 0, 0, 0],
            // 轨迹分析数据
            currentAnalysisData: {},
            // 截取开始时间
            starttime: 0,
            // 截取结束时间
            endtime: 2000000000
        }
    },
    /**
     * 从本地存储中获取配置项 
     *
     */
    getLocalStorageSet: function() {
        var that = this;
        var trackProcessTemp = {
            is_processed: localStorage.is_processed != undefined ? localStorage.is_processed : '0',
            need_denoise: localStorage.need_denoise != undefined ? localStorage.need_denoise : '1',
            need_vacuate: localStorage.need_vacuate != undefined ? localStorage.need_vacuate : '1',
            need_mapmatch: localStorage.need_mapmatch != undefined ? localStorage.need_mapmatch : '0',
            transport_mode: localStorage.transport_mode != undefined ? localStorage.transport_mode : '1'
        }

        if (trackProcessTemp.need_denoise === '1') {
            $('#denoise').iCheck('check');
        } else {
            $('#denoise').iCheck('uncheck');
        }
        if (trackProcessTemp.need_vacuate === '1') {
            $('#vacuate').iCheck('check');
        } else {
            $('#vacuate').iCheck('uncheck');
        }
        if (trackProcessTemp.need_mapmatch === '1') {
            $('#mapmatch').iCheck('check');
        } else {
            $('#mapmatch').iCheck('uncheck');
        }

        switch (trackProcessTemp.transport_mode) {
            case '1':
            default:
                $('#byCar').iCheck('check');
                break;
            case '2':
                $('#byBike').iCheck('check');
                break;
            case '3':
                $('#byWalk').iCheck('check');
                break;
        }
        if (trackProcessTemp.is_processed === '1') {
            $('.processControl input').iCheck('enable');
        } else {
            $('.processControl input').iCheck('disable');
        }

        this.setState({
            trackProcess: trackProcessTemp,
            processSwitch: trackProcessTemp.is_processed === '0' ? 'processSwitchOff' : 'processSwitchOn',
            analysisHeaderTitle1: trackProcessTemp.is_processed === '0' ? 'analysisHeaderTitle1Off' : 'analysisHeaderTitle1On',
            analysisHeaderPoint1: trackProcessTemp.is_processed === '0' ? 'analysisHeaderPointOffDown' : 'analysisHeaderPointOnDown'
        });
        this.updateTrackProcess(trackProcessTemp);

        var tempBehaviorCheck = [
            localStorage.speeding != undefined ? localStorage.speeding : '0',
            localStorage.harsh != undefined ? localStorage.harsh : '0',
            localStorage.steer != undefined ? localStorage.steer : '0',
            localStorage.stay != undefined ? localStorage.stay : '0'
        ];

        var tempBehaviorSwitch = localStorage.behaviorSwitch != undefined ? localStorage.behaviorSwitch : 'behaviorSwitchOff';

        if (tempBehaviorCheck[0] === '1') {
            $('#speeding').iCheck('check');
        } else {
            $('#speeding').iCheck('uncheck');
        }
        if (tempBehaviorCheck[1] === '1') {
            $('#acceleration').iCheck('check');
        } else {
            $('#acceleration').iCheck('uncheck');
        }
        if (tempBehaviorCheck[2] === '1') {
            $('#steering').iCheck('check');
        } else {
            $('#steering').iCheck('uncheck');
        }
        if (tempBehaviorCheck[3] === '1') {
            $('#staypoint').iCheck('check');
        } else {
            $('#staypoint').iCheck('uncheck');
        }
        if (tempBehaviorSwitch === 'behaviorSwitchOn') {
            $('.behaviorControlItem input').iCheck('enable');
        } else {
            $('.behaviorControlItem input').iCheck('disable');
            // that.setState({

            // });
        }

        this.setState({
            behaviorCheck: tempBehaviorCheck,
            behaviorSwitch: tempBehaviorSwitch,
            analysisHeaderTitle2: tempBehaviorSwitch === 'behaviorSwitchOff' ? 'analysisHeaderTitle2Off' : 'analysisHeaderTitle2On',
            analysisHeaderPoint2: tempBehaviorSwitch === 'behaviorSwitchOff' ? 'analysisHeaderPointOffDown' : 'analysisHeaderPointOnDown'
        });
    },
    /**
     * 设置配置项到本地存储
     *
     */
    setLocalStorageSet: function() {
        var that = this;
        localStorage.is_processed = that.state.trackProcess.is_processed;
        localStorage.need_denoise = that.state.trackProcess.need_denoise;
        localStorage.need_vacuate = that.state.trackProcess.need_vacuate;
        localStorage.need_mapmatch = that.state.trackProcess.need_mapmatch;
        localStorage.transport_mode = that.state.trackProcess.transport_mode;
        localStorage.speeding = that.state.behaviorCheck[0];
        localStorage.harsh = that.state.behaviorCheck[1];
        localStorage.steer = that.state.behaviorCheck[2];
        localStorage.stay = that.state.behaviorCheck[3];
        localStorage.behaviorSwitch = that.state.behaviorSwitch;
    },
    componentDidMount: function () {
        TrackStore.listen(this.onStatusChange);
        CommonStore.listen(this.onStatusChange);
        this.setCheckboxStyle();
        window.onbeforeunload = this.setLocalStorageSet;
        
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'switchmanagetab':
                this.listenSwitchmanageTab(data);
            break;
            case 'switchtab':
                this.listenSwitchTab(data);
            break;
            case 'analysisbehavior':
                this.listenAnalysisBehavior(data);
            break;
            case 'staypoint':
                this.listenStaypoint(data);
            break;
            case 'changeTimeline':
                this.listenChangeTimeLine(data);
                break;
        }
    },

    /**
     * 监听Store changeTimeline事件，修改绘制卡尺时间
     *
     * @param {Object} data 开始和结束时间
     */
    listenChangeTimeLine(data) {
        this.setState({
            starttime: data.starttime,
            endtime: data.endtime
        });
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
            this.setLocalStorageSet();
        } else {
            // this.setState({parentVisible: {}});
            this.getLocalStorageSet();
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
     * 响应Store analysisbehavior事件，设置驾驶行为
     *
     * @param {data} 驾驶行为数据
     */
    listenAnalysisBehavior: function(data) {
        this.setState({
            currentAnalysisData: data
        });
        this.drawAnalysisBehavior(data);
    },

    /**
     * view内部，绘制轨迹分析点
     *
     * @param {Array} data 轨迹数据 可选
     * @param {number} starttime 时间区间起点 可选
     * @param {number} endtime 时间区间终点 可选
     */
    drawAnalysisBehavior(data) {
        if (!data) {
            data = this.state.currentAnalysisData;
        }
        let starttime = this.state.starttime;
        let endtime = this.state.endtime;
        var that = this;
        var temp = {
            behaviorSpeeding: data.speeding.length,
            behaviorAcceleration: data.harsh_acceleration.length + data.harsh_breaking.length,
            behaviorSteering: data.harsh_steering.length
        };
        that.setState({behavior: temp});
        var accelerationPoints = [];
        for (let i = 0;i < data.harsh_acceleration.length; i++) {
            accelerationPoints[i] = {
                latitude: data.harsh_acceleration[i].latitude,
                longitude: data.harsh_acceleration[i].longitude
            }
            var point = new BMap.Point(accelerationPoints[i].longitude, accelerationPoints[i].latitude);
            var value = '急加速';
            let loc_time = data.harsh_acceleration[i].loc_time;
            if (starttime <= loc_time && loc_time <= endtime) {
                mapControl.addBehaviorOverlay(point, 'behaviorAccelecation', value);
            }
        }
        var breakingPoints = [];
        for (let i = 0;i < data.harsh_breaking.length; i++) {
            breakingPoints[i] = {
                latitude: data.harsh_breaking[i].latitude,
                longitude: data.harsh_breaking[i].longitude
            }
            var point = new BMap.Point(breakingPoints[i].longitude, breakingPoints[i].latitude);
            var value = '急减速';
            let loc_time = data.harsh_breaking[i].loc_time;
            if (starttime <= loc_time && loc_time <= endtime) {
                mapControl.addBehaviorOverlay(point, 'behaviorBreaking', value);
            }
        }
        var steeringPoints = [];
        for (let i = 0;i < data.harsh_steering.length; i++) {
            steeringPoints[i] = {
                latitude: data.harsh_steering[i].latitude,
                longitude: data.harsh_steering[i].longitude
            }
            var point = new BMap.Point(steeringPoints[i].longitude, steeringPoints[i].latitude);
            var value = '急转弯';
            let loc_time = data.harsh_steering[i].loc_time;
            if (starttime <= loc_time && loc_time <= endtime) {
                mapControl.addBehaviorOverlay(point, 'behaviorSteering', value);
            }
        }
        var speekingPoints = [];
        for (let i = 0;i < data.speeding.length; i++) {
            speekingPoints[i] = {
                latitude: data.speeding[i].speeding_points[0].latitude,
                longitude: data.speeding[i].speeding_points[0].longitude
            }
            var point = new BMap.Point(speekingPoints[i].longitude, speekingPoints[i].latitude);
            var value = '超速 ' + Math.floor(data.speeding[i].speeding_points[0].actual_speed) + ' | 限速 ' + data.speeding[i].speeding_points[0].limit_speed;
            let loc_time = data.speeding[i].speeding_points[0].loc_time;
            if (starttime <= loc_time && loc_time <= endtime) {
                mapControl.addBehaviorOverlay(point, 'behaviorSpeeking', value);
            }
        }
        that.updateAnalysisBehavior(that.state.behaviorCheck);
    },


    /**
     * 响应Store staypoint事件，设置驾驶停留点
     *
     * @param {data} 驾驶行为数据
     */
    listenStaypoint: function(data) {
        this.setState({
            currentStaypointData: data
        });
        this.drawStaypoint(data);
    },

    /**
     * view内部，绘制轨迹停留点
     *
     * @param {Array} data 轨迹数据 可选
     * @param {number} starttime 时间区间起点 可选
     * @param {number} endtime 时间区间终点 可选
     */
    drawStaypoint(data) {
        if (!data) {
            data = this.state.currentAnalysisData;
        }
        let starttime = this.state.starttime;
        let endtime = this.state.endtime;
        var that = this;
        that.setState({behaviorStaypoint: data.length});
        var points = [];
        for (let i = 0;i < data.length; i++) {
            points[i] = {
                latitude: data[i].stay_point.latitude,
                longitude: data[i].stay_point.longitude
            }
            var point = new BMap.Point(points[i].longitude, points[i].latitude);
            var during = data[i].end_time - data[i].start_time;
            var hour = during / 3600 >= 1 ? Math.floor(during / 3600) + '小时' : '';
            var minute = (during % 3600 / 60).toFixed(0) + '分钟';
            var value = '停留' + hour + minute;
            if (starttime <= data[i].start_time && data[i].end_time <= endtime) {
                mapControl.addBehaviorOverlay(point, 'behaviorPlace', value);
            }
        }
        that.updateAnalysisBehavior(that.state.behaviorCheck);
    },
    /**
     * view内部，设置checkbox样式
     *
     */
    setCheckboxStyle: function (){
        var that = this;
        $('.processControl input, .behaviorControlItem input').iCheck({
            checkboxClass: 'icheckbox_square-blue',
            radioClass: 'iradio_square-blue',
            increaseArea: '20%' // optional
        });
        $('.processControl input, .behaviorControlItem input').iCheck('disable');
        $('#denoise, #vacuate').iCheck('check');
        $('#denoise').on('ifChecked', function(event){
            var temp = {};
            temp.is_processed = that.state.trackProcess.is_processed;
            temp.need_denoise = '1';
            temp.need_vacuate = that.state.trackProcess.need_vacuate;
            temp.need_mapmatch = that.state.trackProcess.need_mapmatch;
            temp.transport_mode = that.state.trackProcess.transport_mode;
            that.setState({trackProcess: temp});
            that.updateTrackProcess(temp);
        });
        $('#denoise').on('ifUnchecked', function(event){
            var temp = {};
            temp.is_processed = that.state.trackProcess.is_processed;
            temp.need_denoise = '0';
            temp.need_vacuate = that.state.trackProcess.need_vacuate;
            temp.need_mapmatch = that.state.trackProcess.need_mapmatch;
            temp.transport_mode = that.state.trackProcess.transport_mode;
            that.setState({trackProcess: temp});
            that.updateTrackProcess(temp);
        });
        $('#vacuate').on('ifChecked', function(event){
            var temp = {};
            temp.is_processed = that.state.trackProcess.is_processed;
            temp.need_denoise = that.state.trackProcess.need_denoise;
            temp.need_vacuate = '1';
            temp.need_mapmatch = that.state.trackProcess.need_mapmatch;
            temp.transport_mode = that.state.trackProcess.transport_mode;
            that.setState({trackProcess: temp});
            that.updateTrackProcess(temp);
        });
        $('#vacuate').on('ifUnchecked', function(event){
            var temp = {};
            temp.is_processed = that.state.trackProcess.is_processed;
            temp.need_denoise = that.state.trackProcess.need_denoise;
            temp.need_vacuate = '0';
            temp.need_mapmatch = that.state.trackProcess.need_mapmatch;
            temp.transport_mode = that.state.trackProcess.transport_mode;
            that.setState({trackProcess: temp});
            that.updateTrackProcess(temp);
        });
        $('#mapmatch').on('ifChecked', function(event){
            var temp = {};
            temp.is_processed = that.state.trackProcess.is_processed;
            temp.need_denoise = that.state.trackProcess.need_denoise;
            temp.need_vacuate = that.state.trackProcess.need_vacuate;
            temp.need_mapmatch = '1';
            temp.transport_mode = that.state.trackProcess.transport_mode;
            that.setState({trackProcess: temp});
            that.updateTrackProcess(temp);
        });
        $('#mapmatch').on('ifUnchecked', function(event){
            var temp = {};
            temp.is_processed = that.state.trackProcess.is_processed;
            temp.need_denoise = that.state.trackProcess.need_denoise;
            temp.need_vacuate = that.state.trackProcess.need_vacuate;
            temp.need_mapmatch = '0';
            temp.transport_mode = that.state.trackProcess.transport_mode;
            that.setState({trackProcess: temp});
            that.updateTrackProcess(temp);
        });
        $('#speeding').on('ifChecked', function(event){
            that.setState({controlItemNum1: 'controlItemNumOn'});
            var temp = that.state.behaviorCheck;
            temp[0] = '1';
            that.setState({behaviorCheck: temp});
            that.updateAnalysisBehavior(temp);
        });
        $('#speeding').on('ifUnchecked', function(event){
            that.setState({controlItemNum1: 'controlItemNumOff'});
            var temp = that.state.behaviorCheck;
            temp[0] = '0';
            that.setState({behaviorCheck: temp});
            that.updateAnalysisBehavior(temp);
        });
        $('#acceleration').on('ifChecked', function(event){
            that.setState({controlItemNum2: 'controlItemNumOn'});
            var temp = that.state.behaviorCheck;
            temp[1] = '1';
            that.setState({behaviorCheck: temp});
            that.updateAnalysisBehavior(temp);
        });
        $('#acceleration').on('ifUnchecked', function(event){
            that.setState({controlItemNum2: 'controlItemNumOff'});
            var temp = that.state.behaviorCheck;
            temp[1] = '0';
            that.setState({behaviorCheck: temp});
            that.updateAnalysisBehavior(temp);
        });
        $('#steering').on('ifChecked', function(event){
            that.setState({controlItemNum3: 'controlItemNumOn'});
            var temp = that.state.behaviorCheck;
            temp[2] = '1';
            that.setState({behaviorCheck: temp});
            that.updateAnalysisBehavior(temp);
        });
        $('#steering').on('ifUnchecked', function(event){
            that.setState({controlItemNum3: 'controlItemNumOff'});
            var temp = that.state.behaviorCheck;
            temp[2] = '0';
            that.setState({behaviorCheck: temp});
            that.updateAnalysisBehavior(temp);
        });
        $('#staypoint').on('ifChecked', function(event){
            that.setState({controlItemNum4: 'controlItemNumOn'});
            var temp = that.state.behaviorCheck;
            temp[3] = '1';
            that.setState({behaviorCheck: temp});
            that.updateAnalysisBehavior(temp);
        });
        $('#staypoint').on('ifUnchecked', function(event){
            that.setState({controlItemNum4: 'controlItemNumOff'});
            var temp = that.state.behaviorCheck;
            temp[3] = '0';
            that.setState({behaviorCheck: temp});
            that.updateAnalysisBehavior(temp);
        });

        $('#byCar').on('ifChecked', function(event){
            var temp = {};
            temp.is_processed = that.state.trackProcess.is_processed;
            temp.need_denoise = that.state.trackProcess.need_denoise;
            temp.need_vacuate = that.state.trackProcess.need_vacuate;
            temp.need_mapmatch = that.state.trackProcess.need_mapmatch;
            temp.transport_mode = '1';
            that.setState({trackProcess: temp});
            that.updateTrackProcess(temp);
        });
        $('#byBike').on('ifChecked', function(event){
            var temp = {};
            temp.is_processed = that.state.trackProcess.is_processed;
            temp.need_denoise = that.state.trackProcess.need_denoise;
            temp.need_vacuate = that.state.trackProcess.need_vacuate;
            temp.need_mapmatch = that.state.trackProcess.need_mapmatch;
            temp.transport_mode = '2';
            that.setState({trackProcess: temp});
            that.updateTrackProcess(temp);
        });
        $('#byWalk').on('ifChecked', function(event){
            var temp = {};
            temp.is_processed = that.state.trackProcess.is_processed;
            temp.need_denoise = that.state.trackProcess.need_denoise;
            temp.need_vacuate = that.state.trackProcess.need_vacuate;
            temp.need_mapmatch = that.state.trackProcess.need_mapmatch;
            temp.transport_mode = '3';
            that.setState({trackProcess: temp});
            that.updateTrackProcess(temp);
        });
    },
    /**
     * DOM操作回调，切换轨迹纠偏总开关
     *
     * @param {object} event 事件对象 
     */
    handleProcessSwitch: function(event) {
        var that = this;
        if (that.state.processSwitch === 'processSwitchOn') {
            that.setState({
                processSwitch: 'processSwitchOff',
                analysisHeaderTitle1: 'analysisHeaderTitle1Off',
                analysisHeaderPoint1: 'analysisHeaderPointOffUp'   
            });
            $('.processControl input').iCheck('disable');
            var temp = {};
            temp.is_processed = '0';
            temp.need_denoise = that.state.trackProcess.need_denoise;
            temp.need_vacuate = that.state.trackProcess.need_vacuate;
            temp.need_mapmatch = that.state.trackProcess.need_mapmatch;
            temp.transport_mode = that.state.trackProcess.transport_mode;
            that.setState({trackProcess: temp});
            that.updateTrackProcess(temp);
        } else {
            that.setState({
                processSwitch: 'processSwitchOn',
                analysisHeaderTitle1: 'analysisHeaderTitle1On',
                analysisHeaderPoint1: 'analysisHeaderPointOnUp'
            });
            $('.processControl input').iCheck('enable');
            var temp = {};
            temp.is_processed = '1';
            temp.need_denoise = that.state.trackProcess.need_denoise;
            temp.need_vacuate = that.state.trackProcess.need_vacuate;
            temp.need_mapmatch = that.state.trackProcess.need_mapmatch;
            temp.transport_mode = that.state.trackProcess.transport_mode;
            that.setState({trackProcess: temp});
            that.updateTrackProcess(temp);
        }
    },
    /**
     * DOM操作回调，切换驾驶分析总开关
     *
     * @param {object} event 事件对象 
     */
    handleBehaviorSwitch: function(event) {
        var that = this;
        if (that.state.behaviorSwitch === 'behaviorSwitchOn') {
            that.setState({
                behaviorSwitch: 'behaviorSwitchOff',
                analysisHeaderTitle2: 'analysisHeaderTitle2Off',
                analysisHeaderPoint2: 'analysisHeaderPointOffUp',
                controlItemNum1: 'controlItemNumOff',
                controlItemNum2: 'controlItemNumOff',
                controlItemNum3: 'controlItemNumOff',
                controlItemNum4: 'controlItemNumOff'
            });
            $('.behaviorControlItem input').iCheck('disable');
            that.updateAnalysisBehavior(['0','0','0','0']);
        } else {
            that.setState({
                behaviorSwitch: 'behaviorSwitchOn',
                analysisHeaderTitle2: 'analysisHeaderTitle2On',
                analysisHeaderPoint2: 'analysisHeaderPointOnUp'
            });
            $('.behaviorControlItem input').iCheck('enable');
            that.state.behaviorCheck;
            that.setState({controlItemNum1: that.state.behaviorCheck[0] === '0' ? 'controlItemNumOff' : 'controlItemNumOn'});
            that.setState({controlItemNum2: that.state.behaviorCheck[1] === '0' ? 'controlItemNumOff' : 'controlItemNumOn'});
            that.setState({controlItemNum3: that.state.behaviorCheck[2] === '0' ? 'controlItemNumOff' : 'controlItemNumOn'});
            that.setState({controlItemNum4: that.state.behaviorCheck[3] === '0' ? 'controlItemNumOff' : 'controlItemNumOn'});
            that.updateAnalysisBehavior(that.state.behaviorCheck);
        }
    },
    /**
     * DOM操作回调，开关轨迹纠偏面板
     *
     * @param {object} event 事件对象 
     */
    handleToggleProcess: function(event) {
        var that = this;
        if (that.state.analysisTab === 0 || that.state.analysisTab === 2) {
            that.setState({analysisTab: 1});
            if (that.state.processSwitch === 'processSwitchOn') {
                that.setState({analysisHeaderPoint1: 'analysisHeaderPointOnUp'});
            } else {
                that.setState({analysisHeaderPoint1: 'analysisHeaderPointOffUp'});
            }
            if (that.state.behaviorSwitch === 'behaviorSwitchOn') {
                that.setState({analysisHeaderPoint2: 'analysisHeaderPointOnDown'});
            } else {
                that.setState({analysisHeaderPoint2: 'analysisHeaderPointOffDown'});
            }
        } else {
            that.setState({analysisTab: 0});
            if (that.state.processSwitch === 'processSwitchOn') {
                that.setState({analysisHeaderPoint1: 'analysisHeaderPointOnDown'});
            } else {
                that.setState({analysisHeaderPoint1: 'analysisHeaderPointOffDown'});
            }
        }
    },
    /**
     * DOM操作回调，开关驾驶行为分析面板
     *
     * @param {object} event 事件对象 
     */
    handleToggleBehavior: function(event) {
        var that = this;
        if (that.state.analysisTab === 0 || that.state.analysisTab === 1) {
            that.setState({analysisTab: 2});
            if (that.state.behaviorSwitch === 'behaviorSwitchOn') {
                that.setState({analysisHeaderPoint2: 'analysisHeaderPointOnUp'});
            } else {
                that.setState({analysisHeaderPoint2: 'analysisHeaderPointOffUp'});
            }
            if (that.state.processSwitch === 'processSwitchOn') {
                that.setState({analysisHeaderPoint1: 'analysisHeaderPointOnDown'});
            } else {
                that.setState({analysisHeaderPoint1: 'analysisHeaderPointOffDown'});
            }
        } else {
            that.setState({analysisTab: 0});
            if (that.state.behaviorSwitch === 'behaviorSwitchOn') {
                that.setState({analysisHeaderPoint2: 'analysisHeaderPointOnDown'});
            } else {
                that.setState({analysisHeaderPoint2: 'analysisHeaderPointOffDown'});
            }
        }
    },
    /**
     * DOM操作回调，关闭面板
     *
     * @param {Object} event 事件对象
     */
    handleClose: function(event) {
        var that = this;
        if (that.state.analysisTab === 1){
            if (that.state.processSwitch === 'processSwitchOn') {
                that.setState({analysisHeaderPoint1: 'analysisHeaderPointOnDown'});
            } else {
                that.setState({analysisHeaderPoint1: 'analysisHeaderPointOffDown'});
            }
        } else {
            if (that.state.behaviorSwitch === 'behaviorSwitchOn') {
                that.setState({analysisHeaderPoint2: 'analysisHeaderPointOnDown'});
            } else {
                that.setState({analysisHeaderPoint2: 'analysisHeaderPointOffDown'});
            }
        }
        that.setState({analysisTab: 0});

    },
    /**
     * view内部，修改纠偏选项后重新加载路径
     *
     * @param {object} 更新轨迹纠偏状态
     */
    updateTrackProcess: function(data) {
        var that = this;
        // if (data.is_processed === '1' && data.need_denoise === '0' && data.need_vacuate === '0' && data.need_mapmatch === '0') {

        // }
        // data.is_processed = 0;
        // this.handleProcessSwitch();
        TrackAction.updateprocess(data);
        TrackAction.selecttrack();
        TrackAction.tracklist();
        // mapControl.removeBehaviorOverlay();
        // this.setState({trackProcess: data});
        // this.setLocalStorageSet();
    },
    /**
     * view内部，更新驾驶行为分析显示
     *
     * @param {array} 显示状态
     */
    updateAnalysisBehavior: function(data) {
        var that = this;
        data = data || that.state.behaviorCheck;
        mapControl.updataBehaviorDisplay(data);
        // this.setLocalStorageSet();
    },
    render: function() {
        var handleProcessSwitch = this.handleProcessSwitch;
        var handleBehaviorSwitch = this.handleBehaviorSwitch;
        var processSwitch = this.state.processSwitch;
        var behaviorSwitch = this.state.behaviorSwitch;
        var analysisHeaderTitle1 = this.state.analysisHeaderTitle1;
        var analysisHeaderPoint1 = this.state.analysisHeaderPoint1;
        var analysisHeaderTitle2 = this.state.analysisHeaderTitle2;
        var analysisHeaderPoint2 = this.state.analysisHeaderPoint2;
        var tabIndex = this.state.tabIndex;
        var parentVisible = this.state.parentVisible;
        var controlItemNum4 = this.state.controlItemNum4;
        var controlItemNum1 = this.state.controlItemNum1;
        var controlItemNum2 = this.state.controlItemNum2;
        var controlItemNum3 = this.state.controlItemNum3;
        var analysisTab = this.state.analysisTab;
        var handleToggleProcess = this.handleToggleProcess;
        var handleToggleBehavior = this.handleToggleBehavior;
        var handleClose = this.handleClose;
        var behaviorSpeeding = this.state.behavior.behaviorSpeeding;
        var behaviorAcceleration = this.state.behavior.behaviorAcceleration;
        var behaviorSteering = this.state.behavior.behaviorSteering;
        var behaviorStaypoint = this.state.behaviorStaypoint;
        var behaviorCheck = this.state.behaviorCheck;
        return (
            <div className={tabIndex === 0 ? 'trackAnalysis hidden' : 'trackAnalysis visible'} style={parentVisible}>
                <div className="trackAnalysisHeader">
                    <div className={analysisHeaderTitle1} onClick={handleToggleProcess}>轨迹纠偏</div>
                    <div className={analysisHeaderPoint1} onClick={handleToggleProcess}></div>
                    <div className="analysisHeaderLine"></div>
                    <div className={analysisHeaderTitle2} onClick={handleToggleBehavior}>驾驶行为分析</div>
                    <div className={analysisHeaderPoint2} onClick={handleToggleBehavior}></div>
                </div>
                <div className={analysisTab === 1 && tabIndex === 1 ? 'trackAnalysisProcess visible' : 'trackAnalysisProcess hidden'} style={parentVisible}>
                    <div className="processClose" onClick={handleClose}></div>
                    <div className="processTile">轨迹纠偏</div>
                    <div className={processSwitch} onClick={handleProcessSwitch}></div>
                    <div className="processControl">
                        <div className="processControlItem">
                            <input type="checkbox" id="denoise" />
                            <label htmlFor="denoise">去噪</label>
                        </div>
                        <div className="processControlItem">
                            <input type="checkbox" id="vacuate" />
                            <label htmlFor="vacuate">抽稀</label>
                        </div>
                        <div className="processControlItem">
                            <input type="checkbox" id="mapmatch" />
                            <label htmlFor="mapmatch">绑路</label>
                        </div>
                    </div>
                    <div className="processControl">
                        <div className="optionsTitle">交通方式</div>
                        <div className="trafficMethodItem">
                            <input type="radio" name="trafficMethod" id="byCar" />
                            <label htmlFor="byCar">驾车</label>
                        </div>
                        <div className="trafficMethodItem">
                            <input type="radio" name="trafficMethod" id="byBike" />
                            <label htmlFor="byBike">骑行</label>
                        </div>
                        <div className="trafficMethodItem">
                            <input type="radio" name="trafficMethod" id="byWalk" />
                            <label htmlFor="byWalk">步行</label>
                        </div>
                    </div>
                </div>
                <div className={analysisTab === 2 && tabIndex === 1 ? 'trackAnalysisBehavior visible' : 'trackAnalysisBehavior hidden'} style={parentVisible}>
                    <div className="behaviorClose" onClick={handleClose}></div>
                    <div className="behaviorTile">驾驶行为分析</div>
                    <div className={behaviorSwitch} onClick={handleBehaviorSwitch}></div>
                    <div className="behaviorControl">
                        <div className="behaviorControlItem">
                            <div className={controlItemNum1}>{behaviorSpeeding}</div>
                            <div className="controlItemBot">
                                <input type="checkbox" id="speeding" />
                                <label htmlFor="speeding">超速</label>
                            </div>
                        </div>
                        <div className="controlItemLine"></div>
                        <div className="behaviorControlItem">
                            <div className={controlItemNum2}>{behaviorAcceleration}</div>
                            <div className="controlItemBot">
                                <input type="checkbox" id="acceleration" />
                                <label htmlFor="acceleration">急变速</label>
                            </div>
                        </div>
                        <div className="controlItemLine"></div>
                        <div className="behaviorControlItem">
                            <div className={controlItemNum3}>{behaviorSteering}</div>
                            <div className="controlItemBot">
                                <input type="checkbox" id="steering" />
                                <label htmlFor="steering">急转弯</label>
                            </div>
                        </div>
                        <div className="controlItemLine"></div>
                        <div className="behaviorControlItem">
                            <div className={controlItemNum4}>{behaviorStaypoint}</div>
                            <div className="controlItemBot">
                                <input type="checkbox" id="staypoint" />
                                <label htmlFor="staypoint">停留</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
});

export default TrackAnalysis;
