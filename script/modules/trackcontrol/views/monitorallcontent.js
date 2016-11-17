/**
 * @file 实时监控全部 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.23
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackStore from '../stores/trackStore'
import CommonStore from '../../common/stores/commonStore'
import MonitorAllPage from 'monitorallpage'
import TrackAction from '../actions/trackAction'

var Monitorallcontent = React.createClass({
    getInitialState: function() {
        return {
            // 页签编码 0为实时监控 1为终端管理
            tabIndex: 0,
            // 页签编码 0为实时监控 1为终端管理
            manageTabIndex: 0,
            // monitor三种列表类型编码 0全部 1在线 2离线
            monitorTabIndex: 0,
            // 父容器可见性
            parentVisible: {},
            // 当前列表内容
            allEntity: [],
            // 当前选中车的坐标
            currentPoint: {},
            // 当前选中的entityname
            currentEntityName: '',
            // service  类型
            service_type: 0
        }
    },
    componentDidMount: function () {
        TrackStore.listen(this.onStatusChange);
        CommonStore.listen(this.onStatusChange);
        TrackAction.listcolumn();
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'switchmanagetab':
                this.listenSwitchmanageTab(data);
            break;
            case 'switchtab':
                this.listenSwitchTab(data);
            break;
            case 'switchmonitortab':
                this.listenSwitchMonitorTab(data);
            break;
            case 'listcolumn':
                this.listenListColumn();
            break;
            case 'alllist':
                this.listenAllList(data);
            break;
            case 'selectcardata':
                this.listenSelectCarData(data);
            break;
            case 'hideselectcar':
                this.listenHideSelectCar();
            break;
            case 'servicetype':
                this.listenServicetype(data);
            break;
        }
    },
    /**
     * 响应Store list事件，设置标签页
     *
     * @param {data} 标签页标识
     */
    listenSwitchmanageTab: function(data) {
        var that = this;
        if (data === 0){
            this.setState({parentVisible: {}});
            this.setState({manageTabIndex: 0});
        } else {
            this.setState({parentVisible: {visibility: 'inherit'}});
            this.setState({manageTabIndex: 1});
        }
    },
    /**
     * 响应Store switchtab事件，隐藏manage
     *
     * @param {data} 标签页标识
     */
    listenSwitchTab: function(data) {
        var that = this;
        if (data === 0){
            switch (that.state.monitorTabIndex) {
                case 0:
                    this.setState({parentVisible: {visibility: 'inherit'}});
                break;
                case 1:
                    this.setState({parentVisible: {}});
                break;
                case 2:
                    this.setState({parentVisible: {}});
                break;
            }        
            this.setState({tabIndex: 0});
        } else {
            this.setState({parentVisible: {visibility: 'inherit'}});
            this.setState({tabIndex: 1});
        }
    },
    /**
     * 响应Store switchmonitortab事件,设置标签页
     *
     * @param {data} 标签页标识
     */
    listenSwitchMonitorTab: function(data) {
        this.setState({parentVisible: {}});
        this.setState({monitorTabIndex: data});
    },
    /**
     * 响应Store listcolumn事件,设置标签页
     *
     */
    listenListColumn: function() {
        TrackAction.searchallentity(1);
    },
    /**
     * 响应Store alllist事件,设置列表
     *
     * @param {data} entity数据
     */
    listenAllList: function(data) {
        this.setState({allEntity:data});
        if (this.state.manageTabIndex === 0){
            TrackAction.selectcar();
        }
    },
    /**
     * 响应Store selectcardata事件,显示被选车辆
     *
     * @param {data} 选中entity数据
     */
    listenSelectCarData: function(data) {
        var marker = this.setMarker(data);
        var infoWindow = this.setInfowindow(data,marker);
    },
    /**
     * 响应Store selectcardata事件,显示被选车辆
     *
     */
    listenHideSelectCar: function(){
        map.clearOverlays();

    },
    /**
     * 响应Store servicetype事件,显示被选车辆
     *
     * @param {data} 选中entity数据
     */
    listenServicetype: function(data) {
        this.setState({service_type: data});
    },
    /**
     * view内部，设置marker
     *
     * @param {data} 选中entity数据
     * @return {object} 新建的marker对象
     */
    setMarker: function(data) {
        var point = new BMap.Point(data.point[0], data.point[1]);
        var iconUrl = '';

        var size;
        var imageSize;
        if (this.state.service_type === 1) {
            size = new BMap.Size(41, 34);
            imageSize = new BMap.Size(41, 34);
            switch (data.infor[0][1].substring(0,2)) {
                case '离线':
                    iconUrl = __uri('/static/images/caroffnorth.png');
                break;
                case '静止':
                    iconUrl = __uri('/static/images/carstaticnorth.png');
                break;
                default:
                    iconUrl = __uri('/static/images/carrunnorth.png'); 
            }
        } else {
            size = new BMap.Size(22, 27);
            imageSize = new BMap.Size(22, 27);
            switch (data.infor[0][1].substring(0,2)) {
                case '离线':
                    iconUrl = __uri('/static/images/othertypeoffline.png');
                break;
                case '静止':
                    iconUrl = __uri('/static/images/othertypestatic.png');
                break;
                default:
                    iconUrl = __uri('/static/images/othertype.png'); 
            }
        }
        var icon = new BMap.Icon(iconUrl, size);
        icon.setImageSize(imageSize);
        var marker = new BMap.Marker(point,{icon:icon});
        marker.setRotation(data.direction);
        map.clearOverlays();
        map.addOverlay(marker);
        map.panTo(point);
        return marker;
    },
    /**
     * view内部，设置infowindow
     *
     * @param {data} 选中entity数据
     * @param {object} 当前marker
     * @return {object} 新建的infowindow对象
     */
    setInfowindow: function(data,marker){
        var infoContentFrontArr = [
            '<div class="carInfoWindow">',
                '<div class="carInfoHeader' + data.entity_status + '">',
                    '<abbr title="' + data.entity_name +'">',
                    data.entity_name,
                    '</abbr>',
                '</div>',
                '<div class="carInfoContent">',
        ];
        data.infor.map(function(item) {
            var itemPushArr = [
                '<div class="carInfoItem">',
                    '<div class="infoItemTitle">',
                        item[0],
                    '</div>',
                    '<div class="infoItemContent">',
                        item[1],
                    '</div>',
                '</div>',
            ];
            infoContentFrontArr.push(itemPushArr.join(''));
        });
        var infoContentNextArr = [
            '</div>',
            '<div class="infoControl">',
                '<div class="infoZoomIn" id="infoZoomIn">',
                    '放大',
                '</div>',
            '</div>',
            '</div>'
        ];
        var infoBox = new BMapLib.InfoBox(
            map,
            infoContentFrontArr.concat(infoContentNextArr).join(''),
            {
                boxClass:'carInfoBox',
                // boxStyle:{background:"url('tipbox.gif') no-repeatcenter top",width: "200px"},
                closeIconMargin: "15px 20px 0 0",
                alignBottom: false,
                closeIconUrl: __uri('/static/images/closeinfowindow.png')
            }
        );
        infoBox.open(marker);
        marker.addEventListener("click", function(){          
           infoBox.open(marker);
        });
        this.setState({currentPoint: marker.getPosition()});
        $('#infoZoomIn').click(function(e) {
            infoBox.hide();
            map.zoomIn();
            map.panTo(marker.getPosition());
            map.addEventListener('moveend', function(){
                infoBox.show();
            });
        });
    },
    /**
     * DOM操作回调，点击选中一辆车
     *
     * @param {object} event 事件对象 
     */
    handleSelectCar: function(event) {
        var realTarget = event.target;
        if (event.target.parentElement.className.indexOf('monitorListItem') > -1) {
            realTarget = event.target.parentElement;
        }
        if (event.target.parentElement.parentElement.className.indexOf('monitorListItem') > -1) {
            realTarget = event.target.parentElement.parentElement;
        }
        var entity_name = realTarget.getAttribute('data-entity_name');
        var entity_status = realTarget.getAttribute('data-entity_status');
        // $('.monitorListItem0, .monitorListItem1, .monitorListItem2').removeClass('monitorSelect');
        // $(realTarget).addClass('monitorSelect');
        this.setState({currentEntityName: entity_name});
        TrackAction.selectcar(entity_name, entity_status, 'allCompleteEntities');
    },
    render: function() {
        var monitorTabIndex = this.state.monitorTabIndex;
        var parentVisible = this.state.parentVisible;
        var allEntity = this.state.allEntity;
        var handleSelectCar = this.handleSelectCar;
        var currentEntityName = this.state.currentEntityName;
        return (
            <div className={monitorTabIndex === 0 ? 'monitorAllContent visible' : 'monitorAllContent hidden'} style={parentVisible} >
                    <div className="monitorFrame">
                    {
                        allEntity.map(function(item, key) {
                            return (
                                <div className={'monitorListItem' + item[2] + ((currentEntityName === item[0]) ? ' monitorSelect' : '')} key={key} data-entity_name={item[0]} data-entity_status={item[2]} onClick={handleSelectCar}>
                                    <div className="monitorListItemName" ><abbr title={item[0]}>{item[0]}</abbr></div>
                                    <div className="monitorListItemSpeed">{item[1]}</div>
                                </div>
                                )
                        })
                    }
                    </div>
                <MonitorAllPage />
            </div>

        )
    }
});

export default Monitorallcontent;
