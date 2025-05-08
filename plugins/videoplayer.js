var krpanoplugin = function () {
  var pluginConfig = null
  var krpano = null
  var timeupdatetimer = 0
  var fps = 30

  // 注册
  this.registerplugin = function (krpanointerface, pluginpath, pluginobject) {
    krpano = krpanointerface
    // 全局插件对象
    pluginConfig = pluginobject
    // 初始化
    pluginSpace.init()
    // 是否为视频场景
    if (!pluginConfig.panovideo) {
      // 创建视频元素
      videoSpace.create()
      // 配置视频信息
      videoSpace.setConfig()
      // 添加视频进插件
      pluginSpace.addvideo()
      // 创建预览图
      posterSpace.create()
      // 配置预览图
      posterSpace.setConfig()
      // 添加预览图进插件
      pluginSpace.addposter()
      // 播放
      if (pluginConfig.autoplay && pluginConfig.isshow) {
        videoSpace.methods.play()
      }
    } else {
      // 创建视频元素
      videoSpace.create()
    }
    krpano.debugmode = false
  }

  // 卸载
  this.unloadplugin = function () {
    // 清空poster
    posterSpace && posterSpace.destroy()
    // 清空视频对象
    videoSpace && videoSpace.destroy()
    // 清空插件对象
    pluginSpace.removeListen()
    // 本地
    krpano = null
    timeupdatetimer = 0
  }

  // 插件
  var pluginSpace = {
    // 默认属性
    getConfig: function () {
      return {
        posterurl: '',
        html5preload: 'auto',
        loop: false,
        pausedonstart: true,
        muted: false,
        volume: 1.0,
        playbackrate: 1.0,
        autopause: true,
        autoresume: false,
        html5controls: false,
        playsinline: true,
        userinteractionworkarounds: true,
        videowidth: 0,
        videoheight: 0,
        // 默认为全景视频
        panovideo: false,
        // 视频是否准备好
        isvideoready: false,
        // 视频是否可以播放
        isvideocanplay: false,
        // 视频是否暂停
        ispaused: true,
        // 视频是否跳转
        isseeking: false,
        // 视频是否缓冲
        iswaiting: false,
        // 视频可以流畅播放
        iscanplaythrough: false,
        // 是否完成
        iscomplete: false,
        // 是否自动播放
        autoplay: false,
        // 是否需要用户触发
        needuserinteraction: false,
        // 是否播放过
        isplayed: false,
        // 暂停播放暂停回调输出
        ispauseactioncb: false,
        // currentTime
        time: 0,
        totaltime: 0,
        // buffer
        loadedbytes: 0,
        totalbytes: 0,
        // 外部dom
        externaldom: null,
        // 是否默认显示
        isshow: true
      }
    },
    // 初始化
    init: function () {
      var defConfig = this.getConfig()
      for (var attr in defConfig) {
        if (pluginConfig[attr] === undefined || pluginConfig[attr] === null) {
          pluginConfig[attr] = defConfig[attr]
        }
      }
      this.register()
    },
    // 添加缩略图
    addposter: function () {
      if (!pluginConfig || !posterSpace.el) return
      pluginConfig.posterDOM = posterSpace.el
      if (pluginConfig.sprite) {
        pluginConfig.sprite.appendChild(posterSpace.el)
      }
    },
    // 添加视频
    addvideo: function () {
      if (!pluginConfig || !videoSpace.el) return
      // 是否使用css3d渲染
      const isRenderCss3d = pluginConfig.renderer && pluginConfig.renderer === 'css3d'
      if (isRenderCss3d && pluginConfig.sprite) {
        pluginConfig.sprite.appendChild(videoSpace.el)
      } else {
        // 使用video渲染
        pluginConfig.videoDOM = videoSpace.el
      }
    },
    // 注册事件
    register: function () {
      if (!pluginConfig) return
      // 播放
      pluginConfig.registerattribute('onvideoplay', null)
      pluginConfig.registerattribute('onvideopaused', null)
      pluginConfig.registerattribute('onvideocanplay', null)
      pluginConfig.registerattribute('onvideocanplaythrough', null)
      pluginConfig.registerattribute('onvideowaiting', null)
      pluginConfig.registerattribute('onvideotimeupdate', null)
      // 加载新视频
      pluginConfig.registerattribute('playvideo', this.methods.playvideo.bind(this))
      pluginConfig.registerattribute('play', this.methods.play.bind(this))
      pluginConfig.registerattribute('pause', this.methods.pause.bind(this))
      pluginConfig.registerattribute('seek', this.methods.seek.bind(this))
      pluginConfig.registerattribute('changerate', this.methods.changerate.bind(this))
    },
    // 卸载事件
    removeListen: function () {
      if (!pluginConfig) return
      // 播放
      pluginConfig.onvideoplay = null
      pluginConfig.onvideopaused = null
      pluginConfig.onvideocanplay = null
      pluginConfig.onvideocanplaythrough = null
      pluginConfig.onvideowaiting = null
      pluginConfig.onvideotimeupdate = null
      pluginConfig.playvideo = null
      pluginConfig.play = null
      pluginConfig.pause = null
      pluginConfig.seek = null
      pluginConfig.changerate = null
      pluginConfig = null
    },
    // 加载
    load: function () {
      if (!pluginConfig.videowidth || !pluginConfig.videoheight || pluginConfig._loaded) {
        return
      }
      pluginConfig.registercontentsize(pluginConfig.videowidth, pluginConfig.videoheight)
      if (pluginConfig.onvideoreadyCB) {
        pluginConfig.onvideoreadyCB()
        pluginConfig._loaded = true
      }
    },
    // 方法
    methods: {
      // 播放新视频
      playvideo: function (videourl, posterurl = '', pausedonstart = false, starttime = 0) {
        pluginConfig.isdestroy = false
        pluginConfig.isvideoready = false
        pluginConfig.videourl = videourl
        pluginConfig.posterurl = posterurl
        pluginConfig.pausedonstart = pausedonstart
        pluginConfig.time = starttime
        // 缩略图
        if (pluginConfig.posterurl) {
          if (!posterSpace.el) {
            posterSpace.create()
            pluginSpace.addposter()
          } else {
            posterSpace.update()
          }
          posterSpace.setConfig()
        }
        // 存在资源地址
        if (videoSpace.el && pluginConfig.videourl) {
          // 设置属性
          videoSpace.setConfig()
          // 添加视频进插件
          pluginSpace.addvideo()
        }
        // 插件准备
        pluginConfig._loaded = false
        pluginSpace.load()
      },
      // 播放
      play: function () {
        videoSpace.methods.play()
        pluginSpace.events.ontimeupdate()
      },
      // 暂停
      pause: function (isActive = true) {
        pluginConfig.activepause = isActive
        videoSpace.methods.pause()
      },
      // 跳转
      seek: function (time = 0) {
        // if (time > pluginConfig.time) {
        //   videoSpace.methods.seek(time)
        // }
        videoSpace.methods.seek(time)
      },
      // 更改速率
      changerate: function (num = 1) {
        videoSpace.el.playbackRate = num
      }
    },
    events: {
      // 元数据加载
      onloadedmetadata: function () {
        pluginConfig.totaltime = videoSpace.el.duration
        pluginConfig.totalbytes = videoSpace.el.duration
        pluginConfig.isvideoready = true
        krpano.call(pluginConfig.onvideoready, pluginConfig)
      },
      // 播放
      onplay: function () {
        if (!pluginConfig.ispauseactioncb) {
          pluginConfig.ispaused = false
          krpano.call(pluginConfig.onvideoplay, pluginConfig)
          if (!pluginConfig.isplayed) {
            pluginConfig.isplayed = true
          }
        }
      },
      // 暂停
      onpause: function () {
        if (!pluginConfig.ispauseactioncb) {
          pluginConfig.ispaused = true
          krpano.call(pluginConfig.onvideopaused, pluginConfig)
        }
        cancelAnimationFrame(timeupdatetimer)
      },
      // 可以播放了
      oncanplay: function () {
        krpano.call(pluginConfig.onvideocanplay, pluginConfig)
      },
      // 可以流畅播放了
      oncanplaythrough: function () {
        // 去除封面
        if (!pluginConfig.ispaused && posterSpace.el) {
          posterSpace.destroy()
        }
        // 缓冲结束
        pluginConfig.iswaiting = false
        // 是否主动暂停
        if (!pluginConfig.isdestroy && !pluginConfig.activepause) {
          // window.console.log('流畅播放上的play')
          // 播放视频
          pluginConfig.play()
        }
        // 恢复
        pluginConfig.ispauseactioncb = false
        // 是否可以流畅播放
        pluginConfig.iscanplaythrough = true
        // 通知可以流畅播放了
        krpano.call(pluginConfig.onvideocanplaythrough, pluginConfig)
      },
      // 缓冲开始
      onwaiting: function () {
        pluginConfig.iswaiting = true
        pluginConfig.ispauseactioncb = true
        pluginConfig.pause(false)
        pluginConfig.iscanplaythrough = false
        krpano.call(pluginConfig.onvideowaiting, pluginConfig)
      },
      // 缓冲结束
      onplaying: function () {
        pluginConfig.iswaiting = false
        krpano.call(pluginConfig.onvideowaiting, pluginConfig)
      },
      // 缓冲进度变化
      onprogress: function () {
        const len = videoSpace.el.buffered.length
        pluginConfig.loadedbytes = videoSpace.el.buffered.length ? videoSpace.el.buffered.end(len - 1) : 0
        krpano.call(pluginConfig.onvideoprogress, pluginConfig)
      },
      // 结束
      onended: function () {
        pluginConfig.iscomplete = true
        krpano.call(pluginConfig.onvideocomplete, pluginConfig)
      },
      // 错误
      onerror: function () {
        console.log('Video Error')
      },
      // 放弃加载
      onabort: function () {
        console.log('Stop load video')
      },
      // 进度变化
      ontimeupdate: function () {
        // 计算默认帧率 调整fps 插帧
        cancelAnimationFrame(timeupdatetimer)
        let lasttime = 0
        const draw = () => {
          pluginConfig.time = videoSpace.el ? videoSpace.el.currentTime : 0
          krpano.call(pluginConfig.onvideotimeupdate, pluginConfig)
        }
        const startIframe = () => {
          const startTime = Date.now()
          const delta = startTime - lasttime
          if (delta >= (1000 / fps)) {
            lasttime = startTime
            if (pluginConfig) {
              draw()
            }
          }
          timeupdatetimer = requestAnimationFrame(startIframe)
        }
        startIframe()
      }
    }
  }

  // 视频
  var videoSpace = {
    el: null,
    // 方法
    methods: {
      play: function () {
        // window.console.log('准备播放', videoSpace.el.paused)
        videoSpace.el.play()
      },
      pause: function () {
        videoSpace.el.pause()
      },
      seek: function (time) {
        videoSpace.el.currentTime = time
      }
    },
    // 创建
    create: function () {
      if (!pluginConfig.externaldom) {
        const video = document.createElement('video')
        video.setAttribute('crossOrigin', 'anonymous')
        video.setAttribute('playsinline', '')
        video.setAttribute('webkit-playsinline', '')
        video.setAttribute('x5-video-player-type', 'h5')
        video.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      opacity: 1;
      object-fit: fill;
      background-color: #000;
      transform: translateZ(0);
      transform-origin: 0 0;`
        videoSpace.el = video
      } else {
        videoSpace.el = pluginConfig.externaldom
      }
      videoSpace.register()
    },
    // 初始化属性
    setConfig: function () {
      if (!pluginConfig) return
      videoSpace.el.preload = pluginConfig.html5preload
      videoSpace.el.autoplay = !pluginConfig.pausedonstart
      videoSpace.el.muted = pluginConfig.muted
      videoSpace.el.volume = pluginConfig.volume
      videoSpace.el.playbackrate = pluginConfig.playbackrate
      videoSpace.el.controls = pluginConfig.html5controls
      if (pluginConfig.posterurl) {
        videoSpace.el.poster = pluginConfig.posterurl
      }
      if (pluginConfig.videourl) {
        videoSpace.el.src = pluginConfig.videourl
      }
    },
    // 注册
    register: function () {
      if (!videoSpace.el) return
      videoSpace.el.addEventListener('loadedmetadata', pluginSpace.events.onloadedmetadata, false)
      videoSpace.el.addEventListener('canplay', pluginSpace.events.oncanplay, false)
      videoSpace.el.addEventListener('canplaythrough', pluginSpace.events.oncanplaythrough, false)
      videoSpace.el.addEventListener('play', pluginSpace.events.onplay, false)
      videoSpace.el.addEventListener('pause', pluginSpace.events.onpause, false)
      videoSpace.el.addEventListener('waiting', pluginSpace.events.onwaiting, false)
      videoSpace.el.addEventListener('playing', pluginSpace.events.onplaying, false)
      videoSpace.el.addEventListener('timeupdate', pluginSpace.events.ontimeupdate, false)
      videoSpace.el.addEventListener('progress', pluginSpace.events.onprogress, false)
      videoSpace.el.addEventListener('ended', pluginSpace.events.onended, false)
      videoSpace.el.addEventListener('error', pluginSpace.events.onerror, false)
      videoSpace.el.addEventListener('abort', pluginSpace.events.onabort, false)
    },
    // 解绑
    unbind: function () {
      if (!videoSpace.el) return
      videoSpace.el.removeEventListener('loadedmetadata', pluginSpace.events.onloadedmetadata, false)
      videoSpace.el.removeEventListener('canplay', pluginSpace.events.oncanplay, false)
      videoSpace.el.removeEventListener('canplaythrough', pluginSpace.events.oncanplaythrough, false)
      videoSpace.el.removeEventListener('play', pluginSpace.events.onplay, false)
      videoSpace.el.removeEventListener('pause', pluginSpace.events.onpause, false)
      videoSpace.el.removeEventListener('waiting', pluginSpace.events.onwaiting, false)
      videoSpace.el.removeEventListener('playing', pluginSpace.events.onplaying, false)
      videoSpace.el.removeEventListener('timeupdate', pluginSpace.events.ontimeupdate, false)
      videoSpace.el.removeEventListener('progress', pluginSpace.events.onprogress, false)
      videoSpace.el.removeEventListener('ended', pluginSpace.events.onended, false)
      videoSpace.el.removeEventListener('error', pluginSpace.events.onerror, false)
      videoSpace.el.removeEventListener('abort', pluginSpace.events.onabort, false)
    },
    // 移除
    delel: function () {
      if (videoSpace.el) {
        pluginConfig.videoDOM = null
        if (pluginConfig.sprite && pluginConfig.sprite.querySelector('video')) {
          pluginConfig.sprite.removeChild(videoSpace.el)
        }
        videoSpace.el = null
      }
    },
    // 卸载
    destroy: function () {
      videoSpace.unbind()
      videoSpace.delel()
    }
  }

  // 预览图
  var posterSpace = {
    el: null,
    // 创建
    create: function () {
      // 创建
      const posterImg = document.createElement('img')
      posterImg.setAttribute('crossOrigin', 'anonymous')
      posterImg.style.cssText = 'position: absolute;left: 0;top: 0;width: 100%;height: 100%;opacity: 1;'
      posterSpace.el = posterImg
    },
    // 设置属性
    setConfig: function () {
      if (!pluginConfig) return
      if (pluginConfig.posterurl) {
        posterSpace.el.src = pluginConfig.posterurl
      }
    },
    // 更新
    update: function () {
      if (pluginConfig.posterurl && pluginConfig.posterDOM) {
        pluginConfig.posterDOM.src = pluginConfig.posterurl
      }
    },
    // 隐藏
    hide: function () {
      if (pluginConfig.posterDOM) {
        pluginConfig.posterDOM.style.display = 'none'
      }
    },
    // 卸载
    destroy: function () {
      if (posterSpace.el) {
        pluginConfig.posterDOM = null
        if (pluginConfig.sprite) {
          pluginConfig.sprite.removeChild(posterSpace.el)
        }
        posterSpace.el = null
      }
    }
  }
}
