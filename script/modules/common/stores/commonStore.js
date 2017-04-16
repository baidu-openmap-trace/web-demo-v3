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
    }
});

export default CommonStore