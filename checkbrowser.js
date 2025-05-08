(function () {
  // 判断是否是ie浏览器
  var isIEBrowser = function () {
    return !!window.ActiveXObject || 'ActiveXObject' in window
  }

  var apis = {
    // 获取config的初始化信息
    fetchGetConfig: function () {
      var presetUrl = 'unique/public.json?timestamp=' + Date.now()
      return new Promise(function (resolve, reject) {
        axios.get(presetUrl).then(function (res) {
          resolve(res.data)
        }).catch(function (err) {
          reject(err)
        })
      })
    },
    // 获取定制的初始化信息
    fetchGetMade: function (data) {
      var presetUrl = data + '?timestamp=' + Date.now()
      return new Promise(function (resolve, reject) {
        axios.get(presetUrl).then(function (res) {
          resolve(res.data)
        }).catch(function (err) {
          reject(err)
        })
      })
    }
  }

  var checkLocalFiles = function () {
    apis.fetchGetConfig().then(function (res) {
      getPrivateConfig(res.private || '')
    })
  }

  // 注册插件
  var registerScripts = function (key) {
    var script = document.createElement('script')
    script.src = './unique/' + key + '/index.js'
    document.head.appendChild(script)
  }

  // 获取私有化地址路径
  var getPrivateConfig = function (path) {
    if (!path) return
    apis.fetchGetMade(path).then(function (res) {
      if (res.checkbrowser && res.checkbrowser.enable) {
        registerScripts('checkbrowser')
      }
    })
  }

  // 请求public.json
  if (isIEBrowser()) {
    console.log('ie浏览器')
    checkLocalFiles()
  }

})()
