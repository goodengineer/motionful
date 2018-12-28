const Main = (() => {

  let canvas
  const state = {
    nextId: 0,
    selectedColor: 'red',
    shapes: {}
  }

  const stateProviders = {
    nextId: () => state.nextId++,
    selected: () => state.selected,
    shapes: () => state.shapes
  }

  function start() {
    console.log('app started');
    canvas = document.getElementById('canvas')

    Renderer.render(canvas, stateProviders)
    subscribeCanvasObservables(canvas)
    subscribeColorObservables()
  }

  function subscribeColorObservables() {
    const removeSelected = () => (
      document.querySelectorAll('.panel .colors div')
      .forEach(btn => btn.classList.remove('selected'))
    )

    const colorObservables = Observables.getColorObservables()
    colorObservables.forEach(obs => {
      obs.forEach(e => {
        removeSelected()
        e.toElement.classList.add('selected')
        const color = e.toElement.getAttribute('color')
        state.selectedColor = color
      })
    })
  }

  function subscribeCanvasObservables(canvas) {

    const canvasObservables = Observables.getCanvasObservables(canvas, stateProviders)

    canvasObservables.selects.forEach(id => {
      state.selected = id
      Renderer.render(canvas, stateProviders)
    })

    canvasObservables.unselects.forEach(() => {
      state.selected = undefined
      Renderer.render(canvas, stateProviders)
    })

    canvasObservables.drags.forEach(data => {
      const square = data.square
      const x = Math.min(square.p1.x, square.p2.x)
      const y = Math.min(square.p1.y, square.p2.y)
      const width = Math.max(square.p1.x, square.p2.x) - x
      const height = Math.max(square.p1.y, square.p2.y) - y
      state.shapes[data.id] = { x, y, width, height, color: state.selectedColor }
      Renderer.render(canvas, stateProviders)
    })

    canvasObservables.rectDrags.forEach(data => {
      state.shapes[data.id].x = data.to.x + data.offset.x
      state.shapes[data.id].y = data.to.y + data.offset.y
      Renderer.render(canvas, stateProviders)
    })
  }

  return {
    start
  }
})()

window.addEventListener('load', Main.start)
