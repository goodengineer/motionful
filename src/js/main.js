const Main = (() => {

  let canvas
  const state = {
    nextId: 0,
    shapes: [],
    colors: [
      {color: '#f00', selected: true},
      {color: '#0f0', selected: false},
      {color: '#00f', selected: false},
      {color: '#ff0', selected: false},
      {color: '#f0f', selected: false},
      {color: '#0ff', selected: false}
    ]
  }

  const stateProviders = {
    nextId: () => state.nextId++,
    hasSelected: () => state.selected !== undefined,
    selectedId: () => state.selected,
    shape: id => state.shapes.find(shape => shape.id === id),
    shapeIds: () => state.shapes.map(shape => shape.id),
    shapes: () => state.shapes,
    colors: () => state.colors,
    selectedColor: () => state.colors.find(color => color.selected)
  }

  function start() {
    console.log('app started');
    canvas = document.getElementById('canvas')

    Renderer.render(canvas, stateProviders)
    subscribeCanvasObservables(canvas)

    redrawPanel()
  }

  function subscribePanelObservables() {

    const colorObservables = Observables.getColorObservables()
    const layerObservables = Observables.getLayerObservables()

    colorObservables.forEach(obs => {
      obs.forEach(e => {
        const targetColor = e.toElement.getAttribute('color')
        stateProviders.colors().forEach(color => {
          color.selected = color.color === targetColor
        })

        if(stateProviders.hasSelected()) {
          stateProviders.shape(stateProviders.selectedId()).color = targetColor
          Renderer.render(canvas, stateProviders)
        }

        redrawPanel()
      })
    })

    layerObservables.forEach(obs => obs.forEach(e => {
      const shapeId = parseInt(e.toElement.getAttribute('shapeId'))
      stateProviders.shapes().forEach(shape => {
        shape.selected = shape.id === shapeId
      })
      state.selected = shapeId
      Renderer.render(canvas, stateProviders)
      redrawPanel()
    }))
  }

  function subscribeCanvasObservables(canvas) {

    const canvasObservables = Observables.getCanvasObservables(canvas, stateProviders)

    canvasObservables.selects.forEach(id => {
      if (stateProviders.hasSelected()) {
        stateProviders.shape(stateProviders.selectedId()).selected = false
      }
      state.selected = id
      stateProviders.shape(id).selected = true
      Renderer.render(canvas, stateProviders)
      redrawPanel()
    })

    canvasObservables.unselects.forEach(() => {
      if (stateProviders.hasSelected()) {
        stateProviders.shape(stateProviders.selectedId()).selected = false
        state.selected = undefined
        Renderer.render(canvas, stateProviders)
        redrawPanel()
      }
    })

    canvasObservables.drags.forEach(data => {
      const square = data.square

      const id = data.id
      const name = `unnamed${data.id}`
      const x = Math.min(square.p1.x, square.p2.x)
      const y = Math.min(square.p1.y, square.p2.y)
      const width = Math.max(square.p1.x, square.p2.x) - x
      const height = Math.max(square.p1.y, square.p2.y) - y
      const color = stateProviders.selectedColor().color
      const selected = false

      state.shapes = state.shapes.filter(x => x.id !== data.id)
      state.shapes.push({id, name, x, y, width, height, color, selected})
      Renderer.render(canvas, stateProviders)
      redrawPanel()
    })

    canvasObservables.rectDrags.forEach(data => {
      const shape = state.shapes.find(x => x.id === data.id)
      shape.x = data.to.x + data.offset.x
      shape.y = data.to.y + data.offset.y
      Renderer.render(canvas, stateProviders)
    })
  }

  function redrawPanel() {
    Renderer.renderPanel(stateProviders)
    subscribePanelObservables()
  }

  return {
    start
  }
})()

window.addEventListener('load', Main.start)
