/**
 * @file 设备管理台Reflux Actoin
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

var EntityAction = Reflux.createActions([
    // 列出所有entity数据
    'list',
    // 列出所有列名，包括固定列和自定义列
    'listcolumn',
    // 添加新entity
    'add',
    // 检索entity
    'search',
    // 移除entity
    'remove',
    // 选中当前页所有entity
    'checkall',
    // 取消选中当前页所有entity
    'uncheckall',
    // 更新选中的entity的数据
    'updatecheck',
    // 设置检索关键字
    'setsearchentity',
    // 初始化页码
    'initpageset',
    // 修改自定义字段
    'update'
]);

export default EntityAction