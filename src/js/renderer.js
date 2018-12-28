const Renderer = (function() {

  function render(canvas, providers) {
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#aaa'
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.stroke()
    ctx.closePath();

    Object.keys(providers.shapes()).map(key => providers.shapes()[key]).forEach(rect => {
      ctx.fillStyle = rect.color
      ctx.beginPath();
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
      ctx.closePath();
    })

    if (providers.selected()) {
      ctx.strokeStyle = 'gold'
      const rect = providers.shapes()[providers.selected()]
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height)
      ctx.stroke()
      ctx.closePath();
    }
  }

  return {
    render
  }
})()
