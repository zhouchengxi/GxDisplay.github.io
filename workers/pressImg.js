// 压缩图片
onmessage = function (e) {
  // 根据blob获取imgBit
  createImageBitmap(e.data.blob).then(function (imgBit) {
    // 真实图片比例
    const nsize = getCorrectSize({x: imgBit.width, y: imgBit.height}, {
      x: pressImgConfig.maxWidth,
      y: pressImgConfig.maxHeight
    })
    // 创建离屏canvas
    if (!pressImgConfig.canvas) {
      pressImgConfig.canvas = new OffscreenCanvas(nsize.x, nsize.y)
      pressImgConfig.ctx = pressImgConfig.canvas.getContext('2d')
    }
    pressImgConfig.canvas.width = nsize.x
    pressImgConfig.canvas.height = nsize.y
    pressImgConfig.ctx.clearRect(0, 0, pressImgConfig.canvas.width, pressImgConfig.canvas.height)
    pressImgConfig.ctx.drawImage(imgBit, 0, 0, imgBit.width, imgBit.height, 0, 0, pressImgConfig.canvas.width, pressImgConfig.canvas.height)
    // 转imageBit
    const newImgBit = pressImgConfig.canvas.transferToImageBitmap()
    // 通知主线程
    postMessage({
      key: e.data.key,
      index: e.data.index,
      imageBit: newImgBit
    })
  })
}

var pressImgConfig = {
  canvas: null,
  ctx: null,
  maxWidth: 600,
  maxHeight: 600
}

// 获取真实图片比例
function getCorrectSize(size, wrapSize) {
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