/**
 * @file 存放php proxy的url和Jquery AJAX方法 
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */
import Commonfun from 'commonfun'
var urls = {
    // 获取自定义字段列表
    columnsList: '//yingyan.baidu.com/api/v3/entity/listcolumn',
    // 经纬度解析
    getAddress: '//api.map.baidu.com/geocoder/v2/',
    // 通过新的search接口获取数据，包括所有entity、模糊搜索entity、在线entity、离线entity
    searchEntity: '//yingyan.baidu.com/api/v3/entity/search',
    // 获取track列表
    trackList: '//yingyan.baidu.com/api/v2/track/gethistory',
    // 获取停留点
    getstaypoint: '//yingyan.baidu.com/api/v2/analysis/staypoint',
    // 获取驾驶行为分析信息
    getBehaviorAnalysis: '//yingyan.baidu.com/api/v2/analysis/drivingbehavior',

    /**
     * Jquery AJAX GET
     *
     * @param {string} url 请求url
     * @param {object} params 请求参数
     * @param {function} success 请求成功回调函数
     * @param {function} before 请求前函数
     * @param {function} fail 请求失败回调函数
     * @param {function} after 请求完成回调函数
     */
    post: function (url, params, success, before, fail, after) {
        if (before) {
            before();
        }
        params.timeStamp = new Date().getTime();
        fail = fail || function () { };
        after = after || function () { };
        // 严重推荐自己编写代理服务，将service_id和ak隐藏！！通过service_id和ak可以
        // 拿到该服务的所有数据，一旦泄露，后果严重!!!
        params.ak = Commonfun.getQueryString('ak');
        params.service_id = Commonfun.getQueryString('service_id');
        $.ajax({
            type: 'POST',
            url: url,
            data: params,
            dataType: 'json',
            success: success,
            error: fail,
            complete: after
        });
    },

    /**
     * JSONP
     *
     * @param {string} url 请求url
     * @param {object} params 请求参数
     * @param {function} callbakc 请求成功回调函数
     * @param {function} before 请求前函数
     */
    jsonp: function (url, params, callback, before) {
        var that = this;
        if (before) {
            before();
        }
        params.timeStamp = new Date().getTime();
        params.ak = Commonfun.getQueryString('ak');
        params.service_id = Commonfun.getQueryString('service_id');
        url = url + '?';
        for (let i in params) {
            url = url + i + '=' + params[i] + '&';
        }
        var timeStamp = (Math.random() * 100000).toFixed(0);
        window['ck' + timeStamp] = callback || function () {};
        var completeUrl = url + '&callback=ck' + timeStamp;
        var script = document.createElement('script');
        script.src = completeUrl;
        script.id = 'jsonp';
        document.getElementsByTagName('head')[0].appendChild(script);
        script.onload = function (e) {
            $('#jsonp').remove();
        };
        script.onerror = function (e) {
            that.jsonp(url, params, callback, before)
        };
    }
}

export default urls;