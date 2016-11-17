/**
 * @file entity列表 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

import React, { Component } from 'react'
import { render } from 'react-dom'
import EntityAction from '../actions/entityAction'
import EntityStore from '../stores/entityStore'
import Commonfun from '../../../common/commonfun'

var Entitylist = React.createClass({
    getInitialState: function() {
        return {
            // 当前entity列表头
            column: [],
            // 当前entity列表数据
            entityList: [],
            // 空白行数
            blankEntityList: [],
            // 总页数
            page: 0,
            // 总数据
            total: 0,
            // 总页数
            totalPage: 0,
            // 当前页码
            currentPage: 0,
            // 列表项的样式class索引
            tableClass: ['entity_name', 'create_time', 'location', 'loc_time'],
            // 列表初始高度，之后会根据当前页数据数量动态变化
            tableHeight: 0,
            // 当前页选中的entity
            checkedEntities: [],
            // 列表下样式条，为了避免数据加载前页面闪动，初始时不加载
            tableBottom: '',
            // 标记是否正在进行自定义字段编辑 0未编辑  1正在编辑
            edit: [],
            // 编辑的值
            editValue: []
        }
    },
    componentDidMount: function () {
        var self = this;
        EntityStore.listen(self.onStatusChange);
        EntityAction.listcolumn();
        
    }, 
    componentDidUpdate: function () {
        this.setCheckboxStyle();
    },
    onStatusChange: function (type,data) {
        switch (type){
            case 'listcolumn':
                this.listenListcolumn(data);
            break;
            case 'list':
                this.listenList(data);
            break;
            case 'checkall':
                this.listenCheckall(type);  
            break;
            case 'uncheckall':
                this.listenCheckall(type)
            break;
            case 'listcomplete':
                this.listenListcomplete(type);
            break;
            case 'removecomplete':
                this.listenRemovecomplete();
            break;
        }
    },
    /**
     * 响应Store listcolumn事件，设置表头
     *
     * @param {array} 表头信息
     */
    listenListcolumn: function(data) {
        this.setState({column: data});
        this.setTableStyle(data);
        EntityAction.list(1);
    },
    /**
     * 响应Store list事件，设置列表内容，表高，初始化checkbox状态
     *
     * @param {array} 表内数据
     */
    listenList: function(data) {

        this.setTableHeight();
        var tempArray = new Array(15 - data.length);
        tempArray.fill(1);
        var tempColumnArray = [];
        var tempEditValueArray = [];
        data.map(function(item1, index1) {
            tempColumnArray[index1] = [];
            tempEditValueArray[index1] = [];
            data[0].map(function(item2, index2) {
                tempColumnArray[index1][index2] = 0;
                tempEditValueArray[index1][index2] = 0;
            });
        });

        this.setState({
            entityList: data,
            blankEntityList: tempArray,
            edit: tempColumnArray,
            editValue: tempEditValueArray
        });
    },
    /**
     * 响应Store checkall事件，选中当前页所有checkbox
     *
     * @param {array} 类型
     */
    listenCheckall: function(type) {
        this.toggleCheck(type);
    },
    /**
     * 响应Store uncheckall事件，取消选中当前页所有checkbox
     *
     * @param {string} 类型
     */
    listenUncheckall: function(type) {
        this.toggleCheck(type);
    },
    /**
     * 响应Store listcomplete事件，选中当前页所有checkbox
     *
     * @param {string} 类型
     */
    listenListcomplete: function(type) {
        this.setState({checkedEntities:[]});
        this.toggleCheck(type);
    },
    /**
     * 响应Store removecomplete事件，提示删除成功
     *
     */
    listenRemovecomplete: function() {
        alert('删除成功！');
    },
    /**
     * view内部，清空输入的新entity数据
     *
     * @param {string} 类型
     */
    toggleCheck: function (type) {
        if (type === 'checkall') {
            $('.entityTable input').iCheck('check');
        } else {
            this.setState({checkedEntities:[]});
            $('.entityTable input').iCheck('uncheck');
        }
    },
    /**
     * view内部，设置当前entity列表高度
     *
     */
    setTableHeight: function() {
        this.setState({tableHeight:$('.entityTable').height()});
    },
    /**
     * view内部，设置当前entity列表样式
     *
     * @param {array} entity列头
     */
    setTableStyle: function (data){
        var that = this;
        var tempClass = this.state.tableClass;
        $('.control').css('display','block');
        $('.bottomControl').css('display','block');
        $('.entityList .thead').css('border-left', '1px solid #2096ff');
        var length = tempClass.length;
        for (var i = length; i < data.length; i++) {
            if (i >= length) {
                tempClass[i] = 'other edit';
            }
        }
        this.setState({tableClass:tempClass});
    },
    /**
     * view内部，设置checkbox样式
     *
     */
    setCheckboxStyle: function (){
        var that = this;
        $('.entityTable input').iCheck({
            checkboxClass: 'icheckbox_square-blue',
            radioClass: 'iradio_square',
            increaseArea: '20%' // optional
        });
        $('.entityTable input').on('ifChecked', function(event){
            var checkedEntities = that.state.checkedEntities;
            checkedEntities.push($(event.target.parentNode.parentNode).attr('data-keyname'));
            that.setState({checkedEntities:checkedEntities});
            EntityAction.updatecheck(checkedEntities);
        });
        $('.entityTable input').on('ifUnchecked', function(event){
            var checkedEntities = that.state.checkedEntities;
            checkedEntities = Commonfun.removeFromArray(checkedEntities, $(event.target.parentNode.parentNode).attr('data-keyname'));
            that.setState({checkedEntities:checkedEntities});
            EntityAction.updatecheck(checkedEntities);
        });
    },
    /**
     * DOM操作回调，编辑自定义字段
     *
     * @param {object} event 事件对象
     */
    handleEditEntity: function(event) {
        var tempArray = this.state.edit;
        tempArray[parseInt(event.target.getAttribute('data-column'))][parseInt(event.target.getAttribute('data-row'))] = 1;
        var tempValueArray = this.state.editValue;
        tempValueArray[parseInt(event.target.getAttribute('data-column'))][parseInt(event.target.getAttribute('data-row'))] = event.target.value;
        this.setState({edit: tempArray, editValue: tempValueArray})
    },
    /**
     * DOM操作回调，保存自定义字段
     *
     * @param {object} event 事件对象
     */
    handleSaveEditEntity: function(event) {
        // console.log(event.target.value);
        var tempObject = {};
        tempObject[event.target.getAttribute('data-key')] = event.target.value;
        tempObject.entity_name = event.target.getAttribute('data-entity_name');
        EntityAction.update(tempObject);
    },
    /**
     * DOM操作回调，处理鼠标浮动到tr上
     *
     * @param {object} event 事件对象
     */
    handleTrMouseOver: function(event) {
        var node = event.target;
        do {
            node = node.parentElement;
        } while(node.className != 'entitylistTr')
        $(node.childNodes).css('background-color', '#f4f4f4');
        var entity_name = node.childNodes[0].getAttribute('data-keyname');
        $("input[data-entity_name="+entity_name + "]").css('background-color', '#f4f4f4');
        $("input[data-entity_name="+entity_name + "]").css('border-color', '#f4f4f4');
    },
    /**
     * DOM操作回调，处理鼠标移开tr上
     *
     * @param {object} event 事件对象
     */
    handleTrMouseOut: function(event) {
        var node = event.target;
        do {
            node = node.parentElement;
        } while(node.className != 'entitylistTr')
        $(node.childNodes).css('background-color', '');
        var entity_name = node.childNodes[0].getAttribute('data-keyname');
        $("input[data-entity_name="+entity_name + "]").css('background-color', '');
        $("input[data-entity_name="+entity_name + "]").css('border-color', '');
    },
    render: function() {
        var column = this.state.column;
        var entityList = this.state.entityList;
        var tableClass = this.state.tableClass;
        var tableHeight = this.state.tableHeight;
        var tableBottom = this.state.tableBottom;
        var blankEntityList = this.state.blankEntityList;
        var handleEditEntity = this.handleEditEntity;
        var edit = this.state.edit;
        var editValue = this.state.editValue;
        var handleSaveEditEntity = this.handleSaveEditEntity;
        var handleTrMouseOver = this.handleTrMouseOver;
        var handleTrMouseOut = this.handleTrMouseOut;
        return (
            <div className="entityList">
                
    
                    <table className="entityTable">
                        <tbody>
                            <tr><td className="thead tableCheck"></td>
                                {
                                    column.map(function(item, index) {
                                        return <td key={index} className={tableClass[index] + ' thead'}>{item}</td>
                                    })
                                }
                            </tr>
                                {
                                    entityList.map(function(item, index) {
                                        return <tr key={index} className="entitylistTr" onMouseOver={handleTrMouseOver} onMouseOut={handleTrMouseOut}><td data-keyname={item[0][1]} className="tableCheck"><input type="checkbox"/></td>
                                            {item.map(function (i, j){
                                                return (
                                                    <td key={j} className={tableClass[j]}>
                                                        {
                                                            tableClass[j] === 'other edit' ? <input type="text" className="editEntity" data-entity_name={item[0][1]} data-key={i[0]} data-column={index} data-row={j} value={(!edit.length || edit[index][j]) === 0 ? i[1] : (!!editValue.length ? editValue[index][j] : 0)} onChange={handleEditEntity} onBlur={handleSaveEditEntity}/> : <abbr title={i[1]}>{i[1]}</abbr>
                                                        }
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    })
                                }
                                {
                                    blankEntityList.map(function(item, index) {
                                        return <tr key={index}><td></td>
                                            {column.map(function(citem, cindex) {
                                                return <td key={cindex}></td>
                                            })}
                                        </tr>
                                    })
                                }
                        </tbody>
                    </table>


                
            </div>
        )
    }
});

export default Entitylist