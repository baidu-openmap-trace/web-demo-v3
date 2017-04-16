/**
 * @file 控制是否按范围显示entity的控件 Reflux View
 * @author 崔健 cuijian03@baidu.com 2017.03.18
 */
import React, {Component} from 'react';
import {render} from 'react-dom';
import TrackStore from '../stores/trackStore';
import TrackAction from '../actions/trackAction';
import CommonStore from '../../common/stores/commonStore';

let Boundcontrol = React.createClass({
    getInitialState() {
        return {
            // 页签编码 0为实时监控 1为轨迹查询
            tabIndex: 0,
            // 父容器可见性
            parentVisible: {},
            // 是否开启
            boundSwitch: 'boundOff',
            // 当前视野设备的数量
            boundTotal: 0,
            // 文字描述
            describe: '当前视野设备数'
        };
    },
    componentDidMount() {
        TrackStore.listen(this.onStatusChange);
        CommonStore.listen(this.onStatusChange);
    },
    onStatusChange(type, data) {
        switch (type) {
            case 'switchmanagetab':
                this.listenSwitchmanageTab(data);
                break;
            case 'switchtab':
                this.listenSwitchTab(data);
                break;
            case 'boundsearchentitytotal':
                this.listenBoundSearchEntityTotal(data);
                break;
            case 'boundsearchDec':
                this.listenBoundsearchDec(data);
                break;
        }
    },


    /**
     * 响应Store boundsearchDec事件，设置蚊子描述
     *
     * @param {string} data 文字描述
     */
    listenBoundsearchDec(data) {
        this.setState({describe: data});
    },

    /**
     * 响应Store boundsearchentitytotal事件，设置当前视野entity数量
     *
     * @param {number} data entity total数量
     */
    listenBoundSearchEntityTotal(data) {
        this.setState({boundTotal: data});
    },

    /**
     * 响应Store switchmanagetab事件，设置标签页
     *
     * @param {number} data 标签页标识
     */
    listenSwitchmanageTab(data) {
        this.setState({tabIndex: data});
    },

    /**
     * 响应Store list事件，设置标签页
     *
     * @param {nubmer} data 标签页标识
     */
    listenSwitchTab(data) {
        if (data === 0) {
            this.setState({parentVisible: {}});
        } else {
            this.setState({parentVisible: {visibility: 'inherit'}});
        }
    },

    /**
     * DOM操作回调，切换设备bound展示的开关
     *
     * @param {Object} event 事件对象
     */
    handleBoundSwitch(event) {
        let that = this;
        if (that.state.boundSwitch === 'boundOn') {
            that.setState({boundSwitch: 'boundOff'});
            TrackAction.switchboundsearch(false);
        } else {
            that.setState({boundSwitch: 'boundOn'});
            TrackAction.switchboundsearch(true);
        }
    },

    render() {
        let tabIndex = this.state.tabIndex;
        let parentVisible = this.state.parentVisible;
        let boundSwitch = this.state.boundSwitch;
        let handleBoundSwitch = this.handleBoundSwitch;
        let boundTotal = this.state.boundTotal;
        let describe = this.state.describe;
        return (
            <div className={tabIndex === 1 ? 'boundcontrol hidden' : 'boundcontrol visible'} style={parentVisible} >
                <div className="boundsearch_title">全部显示</div>
                <div className={boundSwitch} onClick={handleBoundSwitch}></div>
                <div className="boundsearch_total">{describe}:{boundTotal}</div>
            </div>
        )
    }
});

export default Boundcontrol;
