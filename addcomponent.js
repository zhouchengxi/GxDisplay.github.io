(function () {
  var options = {
    moduleCache: { vue: Vue },
    getFile: async function (url) {
      const res = await fetch(url);
      if (!res.ok)
        throw Object.assign(new Error(url + ' ' + res.statusText), { res });
      return await res.text();
    },
    addStyle: function (textContent) {
      const style = Object.assign(document.createElement('style'), { textContent });
      const ref = document.head.getElementsByTagName('style')[0] || null;
      document.head.insertBefore(style, ref);
    },
    handleModule: async function (type, getContentData, path, options) {
      switch (type) {
        case '.css':
          options.addStyle(await getContentData(false))
          return null;
      }
    }
  }

  var sfcLoader = window['vue3-sfc-loader']
  var loadModule = sfcLoader ? sfcLoader.loadModule : null

  var registerSingleComponent = (app, jsonData, key) => {
    var component = {}
    if (jsonData[key] && jsonData[key].enable) {
      component = Vue.defineAsyncComponent(() => loadModule('./unique/' + key + '/index.vue', options))
    }
    app.component('private__' + key, component)
  }

  if (Vue) {
    window.registerVueComponent = function (app, jsonData) {
      var onlineCount = {}
      if (jsonData['onlineCount'] && jsonData['onlineCount'].enable) {
        onlineCount = Vue.defineAsyncComponent(() => loadModule('./unique/onlineCount/index.vue', options))
      }
      app.component('private__onlinecount', onlineCount)

      var sceneTitle = {}
      if (jsonData['sceneTitle'] && jsonData['sceneTitle'].enable) {
        sceneTitle = Vue.defineAsyncComponent(() => loadModule('./unique/sceneTitle/index.vue', options))
      }
      app.component('private__scenetitle', sceneTitle)

      var menu = {}
      var activity = {}
      if (jsonData['menuNav'] && jsonData['menuNav'].enable) {
        menu = Vue.defineAsyncComponent(() => loadModule('./unique/menu/index.vue', options))
        activity = Vue.defineAsyncComponent(() => loadModule('./unique/activity/index.vue', options))
      }
      app.component('private__menu', menu)
      app.component('private__activity', activity)

      registerSingleComponent(app, jsonData, 'comment')
    }
  }

})()
