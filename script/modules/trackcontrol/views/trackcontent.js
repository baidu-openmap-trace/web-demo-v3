/**
 * @file ¹ì¼£²éÑ¯ÁÐ±í Reflux View
 * @author ´Þ½¡ cuijian03@baidu.com 2016.08.29
 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import TrackStore from '../stores/trackStore'
import CommonStore from '../../common/stores/commonStore'
import TrackAction from '../actions/trackAction'
import Trackpages from 'trackpages'

var Trackcontent = React.createClass({
    getInitialState: function() {
        return {
            // µ±Ç°ÁÐ±íÄÚÈÝ
            trackList: [],
            // µ±Ç°Ñ¡ÖÐ³µµÄ×ø±ê
            currentTrack: {},
            // ¿Õ°×ÁÐ±íÏî
            blankEntityList: [],
            // µ±Ç°Ñ¡ÖÐµÄentityname
            currentEntityName: ''
        }
    },
    componentDidMount: function () {
        TrackStore.listen(this.onStatusChange);
        TrackAction.tracklist(1);
        // this.listenTrackRoute();
    }, 
    onStatusChange: function (type,data) {
        switch (type){
            case 'tracklist':
                this.listenTrackList(data);
            break;
            case 'trackroute':
                this.listenTrackRoute(data);
            break;
        }
    },
    /**
     * ÏìÓ¦Store tracklistÊÂ¼þ£¬ÉèÖÃ¹ì¼£ÁÐ±í
     *
     * @param {data} ±êÇ©Ò³±êÊ¶
     */
    listenTrackList: function(data) {
        this.setState({trackList: data});
        var tempArray = new Array(10 - data.length);
        tempArray.fill(1);
        this.setState({blankEntityList: tempArray});
    },
    /**
     * ÏìÓ¦Store trackrouteÊÂ¼þ£¬ÔÚµØÍ¼ÉÏ»æÖÆ¹ì¼£
     *
     * @param {data} ¹ì¼£Êý¾Ý
     */
    listenTrackRoute: function(data) {
        var that = this;
        var points = [];
        if (data.length === 0) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            points[i] = new BMap.Point(data[i].location[0], data[i].location[1]);
            points[i].speed = data[i].speed ? data[i].speed : 0;
            points[i].loc_time = data[i].loc_time;
        }
        map.setViewport(points);
        map.zoomOut();
        var update = function () {
            var nextArray = [];
            var ctx = this.canvas.getContext("2d");
            if (!ctx) {
                return;
            }
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            if(points.length != 0){                
                var lines = 1;
                var lineObj = {};
                var width = [4, 8];
                for (var i = 0, len = points.length; i < len - 1; i++) {

                    var pixel = map.pointToPixel(points[i]);
                    var nextPixel = map.pointToPixel(points[i + 1]);
                    ctx.beginPath();
                    ctx.lineCap="round";
                    ctx.lineWidth = 6;
                    ctx.moveTo(pixel.x, pixel.y);
                    var grd = ctx.createLinearGradient(pixel.x, pixel.y, nextPixel.x, nextPixel.y);
                    var speed = points[i].speed;
                    var speedNext = points[i + 1].speed;
                    grd.addColorStop(0, that.getColorBySpeed(speed));
                    grd.addColorStop(1, that.getColorBySpeed(speedNext));
                    ctx.strokeStyle = grd;
                    if (points[i + 1].loc_time - points[i].loc_time <= 5 * 60){
                        ctx.lineTo(nextPixel.x, nextPixel.y);
                    } else {
                        lines = lines + 1;
                        let lineNum = lines;
                        nextArray.push([pixel, nextPixel]);
                        var partImgStart = new Image();
                        partImgStart.src = __uri("/static/images/startpoint.png");
                        let next = nextPixel;
                        partImgStart.onload = function() {
                            ctx.drawImage(partImgStart, next.x - 10, next.y - 30);
                            ctx.font = "lighter 14px arial";
                            ctx.fillStyle = "white";
                            ctx.fillText(lineNum, next.x - width[lineNum >= 10 ? 1 : 0], next.y - 15);
                        };

                        let current = pixel;
                        var partImgEnd = new Image();
                        partImgEnd.src = __uri("/static/images/endpoint.png");
                        partImgEnd.onload = function() {
                            ctx.drawImage(partImgEnd, current.x - 10, current.y - 30);
                            ctx.font = "lighter 14px arial";
                            ctx.fillStyle = "white";
                            ctx.fillText(lineNum - 1, current.x - width[lineNum >= 10 ? 1 : 0], current.y - 15);
                        };
                    }
                    
                    ctx.stroke();
                    
                }            
            }
            // Ìí¼ÓµÚÒ»¸öÆðµãºÍ×îºóÒ»¸öÖÕµã

            var imgStart = new Image();
            imgStart.src = __uri("/static/images/startpoint.png");
            imgStart.onload = function() {
                ctx.drawImage(imgStart,map.pointToPixel(points[0]).x - 10 ,map.pointToPixel(points[0]).y - 30);
                ctx.font = "lighter 14px arial";
                ctx.fillStyle = "white";
                ctx.fillText("1", map.pointToPixel(points[0]).x - width[lines >= 10 ? 1 : 0],map.pointToPixel(points[0]).y - 15);
            };
            var imgEnd = new Image();
            imgEnd.src = __uri("/static/images/endpoint.png");
            imgEnd.onload = function() {
                ctx.drawImage(imgEnd,map.pointToPixel(points[i]).x - 10 ,map.pointToPixel(points[i]).y - 30);
                ctx.font = "lighter 14px arial";
                ctx.fillStyle = "white";
                ctx.fillText(lines, map.pointToPixel(points[i]).x - width[lines >= 10 ? 1 : 0],map.pointToPixel(points[i]).y - 15);
            };

            
        }
        if(points.length > 0){
            if(typeof(canvasLayer) != "undefined") {
                map.removeOverlay(canvasLayer);
            }
            window.canvasLayer =  new CanvasLayer({
                map: map,
                update: update
            });
        }
        TrackAction.behavioranalysis();
        TrackAction.getstaypoint();
    },
    /**
     * viewÄÚ²¿ ¸ù¾ÝËÙ¶È»ñÈ¡ÑÕÉ«
     * 
     * @param {number} speed ËÙ¶È
     *
     * @return {string} ÑÕÉ«µÄÊ®Áù½øÖÆRGB
     */
    getColorBySpeed: function(speed) {
        var color = '';
        var red = 0;
        var green = 0;
        var blue = 0;
        speed = speed > 100 ? 100 : speed;
        switch (Math.floor(speed / 25)) {
            case 0:
                red = 187;
                green = 0;
                blue = 0;
            break;
            case 1:
                speed = speed - 25;
                red = 187 + Math.ceil((241 - 187) / 25 * speed);
                green = 0 + Math.ceil((48 - 0) / 25 * speed);
                blue = 0 + Math.ceil((48 - 0) / 25 * speed);
            break;
            case 2:
                speed = speed - 50;
                red = 241 + Math.ceil((255 - 241) / 25 * speed);
                green = 48 + Math.ceil((200 - 48) / 25 * speed);
                blue = 48 + Math.ceil((0 - 48) / 25 * speed);
            break;
            case 3:
                speed = speed - 75;
                red = 255 + Math.ceil((22 - 255) / 25 * speed);
                green = 200 + Math.ceil((191 - 200) / 25 * speed);
                blue = 0 + Math.ceil((43 - 0) / 25 * speed);
            break;
            case 4:
                red = 22;
                green = 191;
                blue = 43;
            break;
        }

        red = red.toString(16).length === 1 ? '0' + red.toString(16) : red.toString(16);
        green = green.toString(16).length === 1 ? '0' + green.toString(16) : green.toString(16);
        blue = blue.toString(16).length === 1 ? '0' + blue.toString(16) : blue.toString(16);
        color = '#' + red + green + blue;
        return color;
    },
    /**
     * DOM²Ù×÷»Øµ÷£¬µã»÷Ñ¡ÖÐÒ»¸ö¹ì¼£
     *
     * @param {object} event ÊÂ¼þ¶ÔÏó 
     */
    handleSelectTrack: function(event) {
        var realTarget = event.target;
        if (event.target.parentElement.className.indexOf('monitorListItem') > -1) {
            realTarget = event.target.parentElement;
        }
        if (event.target.parentElement.parentElement.className.indexOf('monitorListItem') > -1) {
            realTarget = event.target.parentElement.parentElement;
        }
        var entity_name = realTarget.getAttribute('data-entity_name');
        this.setState({currentEntityName: entity_name});
        mapControl.removeBehaviorOverlay();
        TrackAction.selecttrack(entity_name);
    },
    render: function() {
        var trackList = this.state.trackList;
        var currentTrack = this.state.currentTrack;
        var handleSelectTrack = this.handleSelectTrack;
        var blankEntityList = this.state.blankEntityList;
        var currentEntityName = this.state.currentEntityName;
        return (
            <div className="trackContent">
                <div className="monitorFrame">
                {
                    trackList.map(function(item, key) {
                        return (
                            <div className={'monitorListItem' + item.style + ((currentEntityName === item.name) ? ' monitorSelect' : '')} key={key} data-entity_name={item.name}  onClick={handleSelectTrack}>
                                <div className="monitorListItemName"><abbr title={item.name}>{item.name}</abbr></div>
                                <div className="monitorListItemSpeed">
                                {item.distance >= 0 ? item.distance + ' km' : <div className="loading"></div>}
                                </div>
                            </div>
                            )
                    })
                }
                {
                    blankEntityList.map(function(item, key) {
                        return (
                            <div className='monitorListItem' key={key}>
                                <div className="monitorListItemName"></div>
                                <div className="monitorListItemSpeed">
                             
                                </div>
                            </div>
                            )
                    })
                }
                </div>
                <Trackpages />
            </div>
        )
    }
});

export default Trackcontent;
