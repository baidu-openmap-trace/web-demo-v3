/**
 * @file 页面主 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */
import React, {Component} from 'react';
import {render} from 'react-dom';
import Header from 'header';
import EntityControl from '../../entitycontrol/views/entitycontrol';
import TrackControl from '../../trackcontrol/views/trackcontrol';
import CommonStore from '../stores/commonStore';
import Mapcontrol from '../../../common/mapControl.js';



let ManagerContent = React.createClass({
    render() {
        return (
            <div className="main">
                <div className="trunk" id="trunk">
                    <Header />
                    <TrackControl />
                    <EntityControl />
                </div>
                <div className="branch" id="branch">
                </div>
            </div>
        );
    }
});

if (location.href.indexOf('/manager') > -1) {
    render(
      <ManagerContent />,
      $('#Manager_content')[0]
    );
}

