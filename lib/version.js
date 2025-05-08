(function () {
  // 获取版本列表
  var getVersion = function () {
    var isDev = ['192.168', 'localhost'].some(function (item){
      return new RegExp(item, 'g').test(location.host)
    })
    var devPrePath = 'https://test116.1919game.net/storese/creator/custom/version.txt?stamp=' + Date.now()
    fetch(isDev ? devPrePath : './version.txt').then(function (res) {
      return res.json()
    }).then(function (res) {
      createVersionFlag(res)
    })
  }

  getVersion()

  // 创建版本标识
  var createVersionFlag = function (data) {
    var div = document.createElement('div')
    div.innerHTML = '版本：' + data.version + '<br>' + '日期：' + data.creatime
    div.style.cssText = 'position:absolute;right:30px;bottom:50px;color:#fff;pointer-events:none;z-index:10;opacity:0.8;'
    document.body.appendChild(div)
  }
})()
