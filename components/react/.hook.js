var path = require('path');

module.exports = function(json, files) {
  var hasAddons = false;

  Object.keys(files).every(function(subpath) {
    var cName = path.basename(path.dirname(subpath));

    // some thing like `react-addons-create-fragment`
    if (cName.substring(0, 13) === 'react-addons-') {
      hasAddons = true;
      return false;
    }

    return true;
  });

  // 自动切换到 react-with-addons 如果依赖列表中有 react-addons 的话。
  // 实在不想再把 react 给拆了。
  if (hasAddons) {
    json.main = 'react-with-addons.js';
  }
};