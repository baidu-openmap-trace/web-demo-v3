# 百度地图鹰眼轨迹管理台demo-v3
**相关链接：**  
[百度地图开放平台](http://lbsyun.baidu.com/)  
[百度地图鹰眼轨迹服务](http://lbsyun.baidu.com/trace)  
[百度底图鹰眼开发者社区](http://bbs.lbsyun.baidu.com/forum.php?mod=forumdisplay&fid=26)  
## 参考文档
###目录###
>[1 前言](#1)  
>>[1.1 版本说明](#1.1)  
>>[1.2 开发准备](#1.2)  
>
>[2 开发说明](#2)  
>>[2.1 代码结构和功能点对应](#2.1)  
>>[2.2 举个栗子](#2.2)  
>>[2.3 开发方式](#2.3)   
>
><mark>[3 注意事项](#3)
>><mark>[3.1 帐号安全](#3.1)  
>><mark>[3.2 版权声明](#3.2)  

<h3 id="1">1 前言</h3>
<h4 id="1.1">1.1 版本说明</h4>
鹰眼轨迹管理台v3.0版本已经正式上线一段时间了，为了能够方便大家将管理台灵活的集成到自己的系统中，我们现在将完整的源代码开源出来供大家参考。<br>
3.0版本舍弃了旧版本的代码，完全重新开发。使用了ES6、React、Reflux，将代码各个功能部分进行了划分，增加了可读性，方便了代码的管理和维护。同时使用FIS3进行前端代码的构建，便于构建不同版本环境的代码。<br>
开发者本人也是React的初学者，如果在使用DEMO源码的过程中有任何指教或疑问，欢迎提Issues。


<h4 id="1.2">1.2 开发准备</h4>
开始开发前，强烈建议熟悉一下管理台中用到的各种类库、插件、工具。
管理台的开发依赖了一些百度提供API或工具，列表如下<br>

序号   | 名称           | 用途       
----- | -------------  | --------- 
1     | [鹰眼Web 服务 API](http://lbsyun.baidu.com/index.php?title=yingyan/api/all)  | 数据获取      
2     | [百度地图JSAPI](http://lbsyun.baidu.com/index.php?title=jspopular)           | 地图展示等   
3     | [百度地图Geocoding API](http://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-geocoding)           | 逆地址解析（经纬度到地址） 
4     | [百度地图MapV](http://mapv.baidu.com/)                                       | 大数据展示    
5     | [百度地图CanvasLayer](https://github.com/huiyan-fe/CanvasLayer)              | 轨迹绘制      
6     | [FIS3](http://fis.baidu.com/)                                               | 编译集成工具，发布管理 
7     | [modJS](https://github.com/fex-team/mod)                                    | 代码模块化   


管理台中用到了大量的第三方库和工具，列表如下<br>

序号   | 名称           | 用途       
----- | -------------  | --------- 
1     | [Jquery](http://jquery.com/)                                                      | DOM操作 
2     | [Bootstrap](http://v2.bootcss.com/)                                               | CSS样式    
3     | [Bootstrap-datetimepicker](https://github.com/smalot/bootstrap-datetimepicker)    | 日期选择插件   
4     | [normalize.css](http://necolas.github.io/normalize.css/)                          | CSS样式初始化 
5     | [animate.css](https://daneden.github.io/animate.css/)                             | CSS3 动画   
6     | [icheck](https://github.com/fronteed/icheck)                                      | checkbox 样式 
7     | [React](https://github.com/facebook/react)                                        | DOM 组织 
8     | [RefluxJS](https://github.com/reflux/refluxjs)                                    | 代码组织架构   
9     | [babel](https://github.com/babel/babel)                                           | ES6代码编译  
10    | [npm](https://www.npmjs.com/)                                                     | 包管理  



下载管理台DEMO源码前，建议配置好NPM和FIS3的使用环境，具体方法可以参考这两个工具的官网。  
如果目前位置您还没有申请百度地图开发者帐号或没有AK，也请提前[申请配置好ak](http://lbsyun.baidu.com/apiconsole/key)。此处为了帐号安全，<mark>强烈建议您为项目单独申请2个AK，并且分别开启不同的权限。AK 1作为鹰眼和地址解析使用，最好能够藏在您的服务端，防止泄露。AK 2作为JSAPI使用，只能放在页面前端，会暴露给系统用户。</mark>


<h3 id="2">2 开发说明</h3>
<h4 id="2.1">2.1 代码结构和功能点对应</h4>
>component  ----------------------------------  依赖库，一般不用修改  
>node_modules  -------------------------------  依赖库，一般不用修改  
>script  -------------------------------------  核心逻辑部分   
>>common  ------------------------------------  全局公共方法
>>>commonfun.js  -----------------------------  全局公共方法  
>>>mapControl.js  ----------------------------  地图初始化和操作逻辑  
>>>urls.js  ----------------------------------  所有鹰眼相关数据请求配置   
>>
>>modules  -----------------------------------  功能模块
>>>common  -----------------------------------  公共模块，包括顶栏等  
>>>entitycontrol  ----------------------------  终端管理模块  
>>>trackcontrol   ----------------------------  轨迹监控模块  
>>
>
>static  -------------------------------------  样式、图片和第三方库  
>componet.json  ------------------------------  fis3 安装包配置文件  
>fis-conf.js  -------------------------------- fis3编译配置文件  
>manager.html  -------------------------------  系统入口HTML文件  
>package.json  -------------------------------  npm 配置文件  

如果大家在做二开的时候，只是简单的修改样式，那么修改./static/css/common.css文件应该就可以满足需求了。  
如果需要对模块的内部逻辑进行修改需要修改./script/modules/下对应的路径了。modules路径下的三个文件夹中的结构相似。以entitycontrol为例说明，结构为

>entitycontrol  ------------------------------  终端管理模块
>>actions  -----------------------------------  reflux actions  
>>>entityAction.js  -------------------------- 所有终端管理中的actions列表  
>>
>>stores  ------------------------------------ reflux stores 
>>>entityStores.js  --------------------------  终端管理中的数据请求，处理  
>>
>>views  -------------------------------------  reflux views  
>>>bottomcontrol.js  ------------------------- 数据表下方控件  
>>>control.js  -------------------------------  数据表上方控件  
>>>entitycontrol.js  -------------------------  终端管理总view  
>>>entitylist.js  ---------------------------- 终端列表  
>>>page.js  ---------------------------------- 页码控件  
>>>remove.js  -------------------------------- 删除控件  
>>>search.js  -------------------------------- 检索控件  
>>>selectall.js  -----------------------------  全选控件  

利用Reflux将entitycontrol模块分为了三部分：views，actions，stores。  
views之间像组件一样拼合成完整的页面。仅仅负责展示。  
actions中定义了views中的数据交互操作。  
stores中接受views触发的actions，执行响应的操作。并触发回调，进而改变views的样式。  
更详细的解释可以百度Reflux和React相关资料。


<h4 id="2.2">2.2 举个栗子</h4>
做了这么多铺垫，下面进入整体。用一个完整的例子来说明DEMO的使用方式。




             
