/**
 * @file 轨迹管理台Reflux Actoin
 * @author 崔健 cuijian03@baidu.com 2016.08.23
 */


var TrackAction = Reflux.createActions([
    // 获取service名
    'getservicename',
    // 调整管理面板标签页，分为实时监控和轨迹查询
    'switchmanagetab',
    // 调整实时监控面板标签页，分为全部、在线和离线
    'switchmonitortab',
    // 查询全部entity
    'searchallentity',
    // 查询在线entity
    'searchonlineentity',
    // 查询离线entity
    'searchofflineentity',
    // 列出当前service的自定义字段
    'listcolumn',
    // 选中列表中某个车
    'selectcar',
    // 隐藏选中车
    'hideselectcar',
    // 加载track列表
    'tracklist',
    // 修改选中时间
    'changedatetime',
    // 设定当前检索关键字
    'setsearchentity',
    // 选中某个轨迹
    'selecttrack',
    // 初始化页码
    'initpageset',
    // 检索轨迹查询列表关键字
    'setsearchentitytrack',
    // 初始化轨迹查询页码
    'initpagesettrack',
    // 获取停留点
    'getstaypoint',
    // 获取驾驶分析
    'behavioranalysis',
    // 更新轨迹纠偏选项
    'updateprocess',
    // 隐藏canvas
    'hidetrackcanvas',
    // 显示canvas
    'showtrackcanvas'
]);

export default TrackAction