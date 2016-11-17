/**
 * @file 存放公共方法
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

var commonfun = {
    /**
     * 根据系统要求变更时间格式
     *
     * @param {string} time UNIX时间戳
     * @return {string} 时间 格式：2016-08-19 19:18:15
     */
    getLocalTime: function (time) { 
        var d = new Date(parseInt(time) * 1000);
        var month = d.getMonth() + 1;
        var day =  d.getDate();
        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        hour = hour < 10 ? '0' + hour : hour;
        minute = minute < 10 ? '0' + minute : minute;
        second = second < 10 ? '0' + second : second;
        return d.getFullYear() + '-' + month + '-' +  day + ' ' + hour + ':' + minute + ':' + second; 
    },
    /**
     * 获取当前日期
     *
     * @param {string} time UNIX时间戳 可选
     * @return {string} 时间 格式：2016-08-19
     */
    getCurrentDate: function (e) {
        e = e || new Date();
        var d = e;
        var month = d.getMonth() + 1;
        var day =  d.getDate();
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        return d.getFullYear() + '-' + month + '-' +  day; 
    },
    /**
     * 从数组中移除指定项
     *
     * @param {array} 源数组
     * @param {string} 要移除的值
     * @return {array} 处理后的数组
     */
    removeFromArray: function (arr, val) {
        var index = $.inArray(val, arr);
        if (index >= 0) {
            arr.splice(index, 1);
        }
        return arr;
    },
    // 系统中常量
    constVar: {

    },
    /**
     * 从当前url取参数
     *
     * @param {string} 参数名
     * @return {string} 参数值
     */
    getQueryString: function(name) { 
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
        var r = window.location.search.substr(1).match(reg); 
        if (r != null) {
            return unescape(r[2]); 
        }
        return null; 
    },
    /**
     * 判断当前设备是否在线，规则是最后上传的轨迹点
     * 时间在当前系统时间十分钟内判断为在线，否则为离线
     *
     * @param {number} time UNIX时间戳
     * @return {number} 在线状态 0在线 1离线
     */
    getOnlineStatus: function(time) {
        var status = 0;
        var timestamp = new Date().getTime() / 1000;
        var timeDiff = (timestamp - time) / 60;
        status = timeDiff >= 10 ? 1 : 0;
        return status;
     },
     /**
     * 判断当前设备是否为静止，规则是速度小于1km/h返回静止，
     * 否则返回速度
     *
     * @param {number} speed 速度 单位为 km/h
     * @return {string} 速度
     */
    getSpeed: function(speed) {
        var speedDesc
        if (speed >= 1) {
            speedDesc = speed.toFixed(1) + 'km/h';
        } else {
            speedDesc = '静止';
        }
        return speedDesc;
     },
    /**
     * 返回当前弹窗中的状态字段数组，
     * 分别为状态、速度、方向
     *
     * @param {number} speed 速度
     * @param {number} time UNIX时间戳
     * @param {number} direction 方向
     * 
     * @return {array} 状态
     */
    getInfoWindowStatus: function(speed, time, direction) {
        var statusArr = [];
        speed = speed || 0;
        if (this.getOnlineStatus(time) === 0) {
            if (this.getSpeed(speed) === '静止') {
                statusArr[0] = '静止';
                statusArr[1] = '';
                statusArr[2] = '';
            } else {
                statusArr[0] = '<span class="run">行驶</span>';
                statusArr[1] = this.getSpeed(speed);
                statusArr[2] = this.getDirection(direction);
            }
        } else {
            statusArr[0] = '离线';
            statusArr[1] = '';
            statusArr[2] = '';
        }

        return statusArr.join(' ');
    },
     /**
     * 返回当前设备运动方向描述，一共分为8种，45度一个
     *
     * @param {number} direction 方向数据
     * @return {string} 方向描述
     */
    getDirection: function(direction) {
        var directionDesc = '';
        direction = direction || 0;
        switch (Math.floor((direction) / 22.5)) {
            case 0:
            case 15:
                directionDesc = '(北)';
            break;
            case 1:
            case 2:
                directionDesc = '(东北)';
            break;
            case 3:
            case 4:
                directionDesc = '(东)';
            break;
            case 5:
            case 6:
                directionDesc = '(东南)';
            break;
            case 7:
            case 8:
                directionDesc = '(南)';
            break;
            case 9:
            case 10:
                directionDesc = '(西南)';
            break;
            case 11:
            case 12:
                directionDesc = '(西)';
            break;
            case 13:
            case 14:
                directionDesc = '(西北)';
            break;
        }
        return directionDesc;
     },
     /**
     * 返回当前车辆图标方向，一个四种，90度一个
     *
     * @param {number} direction 方向数据
     * @return {number} 方向标识 0上 1右 2下 3左
     */
    getDirectionIcon: function(direction) {
        var directionIcon = 0;
        direction = direction || 0;
        switch (Math.floor((direction) / 45)) {
            case 0:
            case 7:
                directionIcon = 0;
            break;
            case 1:
            case 2:
                directionIcon = 1;
            break;
            case 3:
            case 4:
                directionIcon = 2;
            break;
            case 5:
            case 6:
                directionIcon = 3;
            break;
        }
        return directionIcon;
     },
};


export default commonfun;