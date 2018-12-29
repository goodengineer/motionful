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
    shape: id => Util.clone(state.shapes.find(shape => shape.id === id)),
    shapeIds: () => state.shapes.map(shape => shape.id),
    shapes: () => Util.clone(state.shapes),
    colors: () => Util.clone(state.colors),
    selectedColor: () => Util.clone(state.colors.find(color => color.selected))
  }

  const stateModifiers = {
      selectedId: id => state.selected = id,
      removeSelected: () => state.selected = undefined,
      selectedColor: targetColor => (
          state.colors = state.colors.map(color => (
              color.color !== targetColor
                ? ({...color, selected: false})
                : ({...color, selected: true})
          ))
      ),
      shapeColor: (id, targetColor) => (
          state.shapes = state.shapes.map(shape => (
              shape.id !== id
                ? shape
                : ({...shape, color: targetColor})
          ))
      ),
      removeShape: id => (
          state.shapes = state.shapes.filter(x => x.id !== id)
      ),
      appendShape: data => (
          state.shapes = [...state.shapes, data]
      ),
      shapePosition: (id, x, y) => (
          state.shapes = state.shapes.map(shape => (
              shape.id !== id
                ? shape
                : ({...shape, x, y})
          ))
      )
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
        stateModifiers.selectedColor(targetColor)

        if(stateProviders.hasSelected()) {
          stateModifiers.shapeColor(stateProviders.selectedId(), targetColor)
          Renderer.render(canvas, stateProviders)
        }

        redrawPanel()
      })
    })

    layerObservables.forEach(obs => obs.forEach(e => {
      const shapeId = parseInt(e.toElement.getAttribute('shapeId'))
      stateModifiers.selectedId(shapeId)
      Renderer.render(canvas, stateProviders)
      redrawPanel()
    }))
  }

  function subscribeCanvasObservables(canvas) {

    const canvasObservables = Observables.getCanvasObservables(canvas, stateProviders)

    canvasObservables.selects.forEach(id => {
      stateModifiers.selectedId(id)
      Renderer.render(canvas, stateProviders)
      redrawPanel()
    })

    canvasObservables.unselects.forEach(() => {
      if (stateProviders.hasSelected()) {
        stateModifiers.removeSelected()
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

      const shape = {id, name, x, y, width, height, color}

      stateModifiers.removeShape(data.id)
      stateModifiers.appendShape(shape)
      Renderer.render(canvas, stateProviders)
      redrawPanel()
    })

    canvasObservables.rectDrags.forEach(data => {
      const newX = data.to.x + data.offset.x
      const newY = data.to.y + data.offset.y
      stateModifiers.shapePosition(data.id, newX, newY)
      Renderer.render(canvas, stateProviders)
    })
  }

  function redrawPanel() {
    Renderer.renderPanel(stateProviders)
    subscribePanelObservables()
  }

  function trace() {
      console.log(state)
  }

  return {
    start,
    trace
  }
})()

window.addEventListener('load', Main.start)
