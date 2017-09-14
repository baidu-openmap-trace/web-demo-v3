
# 百度地图鹰眼轨迹管理台demo-v3.1.1   
**相关链接：**  
[百度地图开放平台](http://lbsyun.baidu.com/)  
[百度地图鹰眼轨迹服务](http://lbsyun.baidu.com/trace)  
[百度地图鹰眼轨迹管理台](http://lbsyun.baidu.com/index.php?title=yingyan/manage)  
[百度地图鹰眼开发者社区](http://bbs.lbsyun.baidu.com/forum.php?mod=forumdisplay&fid=26)  

##更新日志##
2016.11.21:修复城市列表控件位置错误导致不可见的bug  
2016.11.28:修复bug，更新V3 search接口的返回字段  
2016.12.08:修复查看entity实时监控详情的bug  
2016.12.09:修复少量用户因为轨迹点过多无法去噪抽稀的bug  
2016.12.19:修复终端管理页面最后位置显示错误的bug  
2016.12.27:修正了script/modules/trackcontrol/views/trackcontent.js的中文注释乱码  
2017.04.16:本次更新的项目很多，版本整体升级到了v3.2版本，功能上主要增加了：切换所有的接口为鹰眼Web API V3接口、添加动态查看视野范围内所有设备、支持拖动时间轴卡尺灵活查看轨迹、添加轨迹绑路交通方式选项、优化了历史轨迹的显示样式、支持历史轨迹点点击查看详细信息等等。可以参考这个帖子：http://bbs.lbsyun.baidu.com/forum.php?mod=viewthread&tid=119502&extra=page%3D1&page=1  

       
## 参考文档
###目录###
>[1 前言](#1)  
>>[1.1 版本说明](#1.1)  
>>[1.2 开发准备](#1.2)  
>
>[2 开发说明](#2)  
>>[2.1 代码结构和功能点对应](#2.1)  
>>[2.2 举个栗子](#2.2)  
>>[2.3 帐号配置](#2.3)   
>>[2.4 关于POST功能](#2.4)   
>>[2.5 接口版本说明](#2.5)  
>
>**[3 注意事项](#3)**
>>**[3.1 版权声明](#3.1)**    

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
如果目前位置您还没有申请百度地图开发者帐号或没有AK，也请提前[申请配置好ak](http://lbsyun.baidu.com/apiconsole/key)。此处为了帐号安全，**强烈建议您为项目单独申请2个AK，并且分别开启不同的权限。AK 1作为JSAPI使用，只能放在页面前端，会暴露给系统用户。AK 2作为鹰眼和地址解析使用，最好能够藏在您的服务端，防止泄露。**


<h3 id="2">2 开发说明</h3>
<h4 id="2.1">2.1 代码结构和功能点对应</h4>

>component  ----------------------------------  依赖库，一般不用修改  
>node_modules  -------------------------------  依赖库，一般不用修改，需要运行npm install自动安装  
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
>fis-conf.js  --------------------------------  fis3编译配置文件  
>manager.html  -------------------------------  系统入口HTML文件  
>package.json  -------------------------------  npm 配置文件  
>README.md  ----------------------------------  说明文档 项目中建议删除  
>readmeImages  -------------------------------  说明文档中用到的图片 项目指令建议删除

如果大家在做二开的时候，只是简单的修改样式，那么修改./static/css/common.css文件应该就可以满足需求了。  
如果需要对模块的内部逻辑进行修改需要修改./script/modules/下对应的路径了。modules路径下的三个文件夹中的结构相似。以entitycontrol为例说明，结构为

>entitycontrol  ------------------------------  终端管理模块
>>actions  -----------------------------------  reflux actions  
>>>entityAction.js  --------------------------  所有终端管理中的actions列表  
>>
>>stores  ------------------------------------  reflux stores 
>>>entityStores.js  --------------------------  终端管理中的数据请求，处理  
>>
>>views  -------------------------------------  reflux views  
>>>bottomcontrol.js  -------------------------  数据表下方控件  
>>>control.js  -------------------------------  数据表上方控件  
>>>entitycontrol.js  -------------------------  终端管理总view  
>>>entitylist.js  ----------------------------  终端列表  
>>>page.js  ----------------------------------  页码控件  
>>>remove.js  --------------------------------  删除控件  
>>>search.js  --------------------------------  检索控件  
>>>selectall.js  -----------------------------  全选控件  

利用Reflux将entitycontrol模块分为了三部分：views，actions，stores。  
views之间像组件一样拼合成完整的页面。仅仅负责展示。  
actions中定义了views中的数据交互操作。  
stores中接受views触发的actions，执行响应的操作。并触发回调，进而改变views的样式。  
更详细的解释可以百度Reflux和React相关资料。


<h4 id="2.2">2.2 举个栗子</h4>
做了这么多铺垫，下面进入整体。用一个完整的例子来说明DEMO的使用方式。  
(1) 首先通过[安装nodejs](https://nodejs.org/en/)获取到npm工具包。  
    
(2) 接着打开命令行使用npm安装FIS3:  `npm install -g fis3`  更多FIS3资料请[参考官网](http://fis.baidu.com/) 。之后输入`fis3`验证安装成功。 
![npminstall](https://raw.githubusercontent.com/baidu-openmap-trace/web-demo-v3/master/readmeImages/fis3install.png)   
(3) 之后将代码库完整下载并解压到项目路径，执行`npm install`安装package.json中定义的依赖的包内容。  
![npminstall](https://raw.githubusercontent.com/baidu-openmap-trace/web-demo-v3/master/readmeImages/npminstall.png)  
(4) 在1.2节的最后，提到了推荐申请两个AK。接下来对调用JSAPI的AK进行配置(下文统一称AK 1)。选择自己常用的编辑器。打开./manager.html。查看代码24行  
`<script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=您的AK1&callback=mapControl.initMap"></script>`  
此处将AK 1替换掉"您的AK1"并保存修改。  

(5) 配置好AK 1后重新回到命令行，cd到项目的根目录。执行`fis3 release demo` 如果已经看过了FIS3的文档，那么就会理解这行命令的作用是根据fis-config.js文件的配置去编译DEMO。在fis-config.js中，已经写好了默认的编译规则。 
![npminstall](https://raw.githubusercontent.com/baidu-openmap-trace/web-demo-v3/master/readmeImages/fis3release.png)   
按照默认的配置，项目此时已经被发布到本地的Web Server。接着在命令行输入`fis3 server start`来启动打开网页。  
![npminstall](https://raw.githubusercontent.com/baidu-openmap-trace/web-demo-v3/master/readmeImages/serverstart.png)  
![npminstall](https://raw.githubusercontent.com/baidu-openmap-trace/web-demo-v3/master/readmeImages/page.png)  
如果看到上图的目录结构，就说明项目已经发布成功了。接下来点击目录中的manager.html进入到管理台界面，此时的URL是`http://127.0.0.1:8080/manager.html`  
![npminstall](https://raw.githubusercontent.com/baidu-openmap-trace/web-demo-v3/master/readmeImages/nodata.png) 
(6) 到此为止我们已经能够在自己的本地环境中查看没有任何数据管理台了，接下来需要将您的鹰眼service_id和之前准备好的AK 2以参数的形式添加到URL中。例如`http://127.0.0.1:8080/manager.html?service_id=111111&ak=FDe8fsahjkfaskhfcz`就可以看到自己的数据了。  
![npminstall](https://raw.githubusercontent.com/baidu-openmap-trace/web-demo-v3/master/readmeImages/data.png) 
**再次提醒，管理台DEMO默认获取service\_id和AK的方式是通过解析URL，为了您的数据安全，强烈将他们隐藏在后端。**

(7) 截至上一步，项目环境已经走通了。大家在开发过程中，可以使用`fis3 release demo -wl`组合命令，这样代码更新保存之后，FIS3会自动编译，并刷新浏览器查看最新效果。如果有更多的构建需求，请参考[FIS3文档](http://fis.baidu.com/)。

<h4 id="2.3">2.3 帐号配置</h4>
2.2节(6)中提到目前管理台DEMO是通过URL配置获取的service\_id和AK 2的。这块逻辑代码位于./script/common/urls.js的64行。  
所有的鹰眼数据请求和地址解析的请求都会使用JSONP的形式加载，在jsonp函数中，统一获取url中的ak和service\_id添加到请求的参数中。如果需要配置ak和service\_id，可以在修改此处代码。  
![npminstall](https://raw.githubusercontent.com/baidu-openmap-trace/web-demo-v3/master/readmeImages/ak.png) 


<h4 id="2.4">2.4 关于POST功能</h4>
鹰眼Web服务API的接口分为GET和POST两大类，涉及数据查看的基本上是GET，涉及到增删改敏感操作的基本上POST。  
因为浏览器前端存在跨域的限制，不能直接用AJAX请求数据。所以DEMO对于所有的GET请求都使用了JSONP的方案进行实现。对于终端管理中的删除终端、编辑自定义字段两个功能，使用的是POST，因此没有进行实现。开发者如果对这两个接口有需求的话，需要自己编写一个和DEMO同域的代理服务，转发DEMO的POST请求到鹰眼Web API服务。**实际上我们是强烈推荐这么做的，最好的方式是将所有的请求（包括GET）都走自己的代理服务器，这样就能将自己的service_id和AK 2隐藏起来了。**

<h4 id="2.5">2.5 接口版本说明</h4>
细心的同学可能会发现，目前我们DEMO在./script/common/urls.js中定义的鹰眼Web服务API的接口和文档中的不一致，而且多出了entity/search接口。这是因为在v3版本的管理台中我们率先使用了鹰眼最新版本web服务 API，这也是管理台能够如此给力的强大基础。不过大家不用着急，这些最新版本的接口很快就会正式公布了！

<h3 id="3">3 注意事项</h3>
<h4 id="3.1">版权声明</h4>
本源码开放的初衷是方便各位百度地图鹰眼的用户对轨迹管理台进行个性化的开发，融合到自己的现有系统中。
严禁对轨迹监控页面左下角的百度地图LOGO进行遮挡或删除。

<h3 id="4"> LICENSE</h3>
MIT License

Copyright (c) 2017 Baidu Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

             
