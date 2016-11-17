/**
 * @file 公共Reflux Store
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

import CommonAction from '../actions/commonAction'
import Urls from '../../../common/urls'

var CommonStore = Reflux.createStore({
    listenables: [CommonAction],
    data: {
        // 当前标签页 0为轨迹监控，1为终端管理
        currentIndex: 0
    },
    /**
     * 响应Action switchtab，变更页签
     *
     * @param {number} index 要变更到的tab
     */
    onSwitchtab: function(index) {
        this.trigger('switchtab', index);
    },
    /**
     * 响应Action access，检查登录状态
     *
     */
    onAccess: function() {
        var that = this;
        Urls.get(Urls.statusCheck, {}, function(data){
            if (data.isOnline === 1) {
                Urls.jsonp(Urls.access, {}, function(data){
                    that.trigger('access', data);
                });
            } else {
                that.onLogin();
            }
        });
    },
    /**
     * 响应Action login，跳转到登陆页
     *
     */
    onLogin: function() {
        location.href =  Urls.login + '&u=' + location.href;
    },
    /**
     * 响应Action logout，登出账号
     *
     */
    onLogout: function() {
        location.href =  Urls.logout + '&u=' + location.href;
    },
    /**
     * 响应Action setting，跳转到账号设置页
     *
     */
    onSetting: function() {
        location.href =  Urls.setting;
    }
});

export default CommonStore