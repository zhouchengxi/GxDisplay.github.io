onmessage = function (e) {
  // blob
  var blobDataList = e.data
  var maxWidth = 600
  var maxHeight = 600
  let base64List = []

  // 是否支持离屏canvas
  let isAcceptOffscreen = false
  try {
    isAcceptOffscreen = !!OffscreenCanvas
  } catch (err) {
    console.log('非离屏渲染', err)
    postMessage(e.data)
  }
  console.log('是否支持离屏渲染', isAcceptOffscreen)
  // 使用离屏canvas
  if (isAcceptOffscreen) {
    var canvas = null, context = null
    blobDataList.forEach(function (item, idx) {
      // worker中无法创建Image对象, 因此需要根据blob格式的url生成Image
      createImageBitmap(item.blob).then(function (imageBitmap) {
        // 真实图片比例
        const nsize = getCorrectSize({ x: imageBitmap.width, y: imageBitmap.height }, {
          x: maxWidth,
          y: maxHeight
        })
        if (!canvas) {
          canvas = new OffscreenCanvas(nsize.x, nsize.y)
          context = canvas.getContext('2d')
        }
        canvas.width = nsize.x * item.ratio
        canvas.height = nsize.y * item.ratio
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height, 0, 0,canvas.width, canvas.height)
        canvas.convertToBlob({ type: 'image/webp' }).then((blob) => {
          const reader = new FileReader()
          reader.readAsDataURL(blob)
          return new Promise(resolve => {
            reader.onloadend = () => {
              resolve(reader.result)
            }
          })
        }).then(function (base64) {
          base64List.push({ base64, idx })
          if (base64List.length === blobDataList.length) {
            // 把处理好的base64列表 传给主线程
            base64List = base64List.sort(function (a, b) {
              return a.idx - b.idx
            })
            postMessage(base64List)
            // 关闭worker
            close()
          }
        })
      })
    })
  }
}

// 获取真实图片比例
function getCorrectSize (size, wrapSize) {
  const wrapW = wrapSize.x
  const wrapH = wrapSize.y
  let tw = size.x
  let th = size.y
  // 高度超出比例
  const heightOver = Math.max(size.y / wrapH, 1)
  // 宽度超出比例
  const widthOver = Math.max(size.x / wrapW, 1)
  if (widthOver > 1 || heightOver > 1) {
    if (widthOver >= heightOver) {
      // 已宽为准
      tw = wrapW
      th = wrapW * size.y / size.x
    } else {
      // 已高为准
      tw = wrapH * size.x / size.y
      th = wrapH
    }
  }
  return {
    x: Math.round(tw),
    y: Math.round(th)
  }
}
