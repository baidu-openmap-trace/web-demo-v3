/**
 * @file 轨迹查询时间选择entity部分 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.29
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackStore from '../stores/trackStore'
import TrackAction from '../actions/trackAction'
import Commonfun from '../../../common/commonfun'

var Trackdatetime = React.createClass({
    getInitialState: function() {
        return {
            defaultDatetime: '',
            triggersetdate: new Date()
        };
    },
    componentDidMount: function () {
        this.initTrackDatetime();
        TrackStore.listen(this.onStatusChange);
    },

    componentDidUpdate() {
        $('#datetimepicker').datetimepicker('setDate', this.state.triggersetdate);
        TrackAction.changedatetime(Commonfun.getCurrentDate(this.state.triggersetdate));
        TrackAction.tracklist();
    },

    onStatusChange(type, data) {
        switch (type) {
            case 'triggersetdate':
                this.listenTriggerSetDate(data);
                break;
        }
    },

    /**
     * 响应Store triggersetdate事件，触发更改时间
     *
     * @param {Object} date 时间对象
     */
    listenTriggerSetDate(date) {
        this.setState({
            triggersetdate: date
        });
    },

    /**
     * view内部 初始化时间选择插件
     *
     */
    initTrackDatetime: function() {
        var that = this;
        $('#datetimepicker').datetimepicker({
            language: 'zh-CN',
            weekStart: 1,
            todayBtn:  1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            forceParse: 0,
            minView: 2,
            pickerPosition: 'bottom-left'
        });
        $('#datetimepicker').on('changeDate', function(e) {
            that.setState({
                defaultDatetime: Commonfun.getCurrentDate(e.date),
                triggersetdate: e.date
            });
        });
        $('#datetimepicker').datetimepicker('setEndDate', Commonfun.getCurrentDate());
        that.setState({defaultDatetime: Commonfun.getCurrentDate()});
    },
    /**
     * DOM操作回调，这里没有实际作用，主要为了防止react报错
     *
     * @param {object} event 事件对象 
     */
    handleChangeDate: function(e) {
        TrackAction.changedatetime(this.state.defaultDatetime);
    },
    render: function() {
        var defaultDatetime = this.state.defaultDatetime;
        return (
            <div className="trackDatetime">
                <div className="input-append date" id="datetimepicker"  data-date-format="yyyy-mm-dd">
                    <input className="datetimeInput" size="16" type="text"  value={defaultDatetime} onChange={this.handleChangeDate} />
                    <span className="add-on datetimeBtn">
                        <i className="icon-th"></i>
                    </span>
                </div>
            </div>

        )
    }
});

export default Trackdatetime;