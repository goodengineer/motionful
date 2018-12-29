const Renderer = (function() {

  function renderPanel(providers) {
    const colors = document.querySelector('.panel .colors')
    const layers = document.querySelector('.panel .layers')

    const createLayer = shape => {
      const className = providers.selectedId() === shape.id ? 'simple selected' : 'simple'
      return `<li class='${className}' shapeId='${shape.id}' draggable='true'>${shape.name}</li>`
    }

    const createColor = color => {
      const className = color.selected ? 'selected' : ''
      return `<div class='${className}' color='${color.color}' style='background:${color.color};'></div>`
    }

    layers.innerHTML = providers.shapes().map(createLayer).join('\n')
    colors.innerHTML = providers.colors().map(createColor).join('\n')
  }

  function render(canvas, providers) {
    const ctx = canvas.getContext('2d')
    drawBackground(ctx)
    drawShapes(ctx, providers)
    if (providers.hasSelected()) {
      const shape = providers.shape(providers.selectedId())
      drawSelectedBorder(ctx, shape)
    }
  }

  function drawBackground(ctx) {
    ctx.fillStyle = '#aaa'
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.stroke()
    ctx.closePath();
  }

  function drawShapes(ctx, providers) {
    providers.shapes().forEach(shape => {
      drawShape(ctx, shape)
    })
  }

  function drawShape(ctx, shape) {
    ctx.fillStyle = shape.color
    ctx.beginPath();
    ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
    ctx.closePath();
  }

  function drawSelectedBorder(ctx, shape) {
    ctx.strokeStyle = 'gold'
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.rect(shape.x, shape.y, shape.width, shape.height)
    ctx.stroke()
    ctx.closePath();
  }

  return {
    render,
    renderPanel
  }
})()
