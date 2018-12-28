const state = {
  shapes: {}
}

const FPS = 60
const Screen = {}
const Time = {
  deltaTime: 0
}

const Input = {
  mouse: {
    x: 0,
    y: 0
  }
}

const Main = (() => {
  
  let nextId = 0
  let canvas
  let interval

  let startRenderTime = performance.now()
  let endRenderTime = performance.now()

  function start() {
    console.log('app started');
    canvas = document.getElementById('canvas')

    Screen.width = canvas.width
    Screen.height = canvas.height

    render()
    setObservables()
  }

  function setObservables() {
    const starts = Rx.Observable.fromEvent(canvas, 'mousedown')
    const moves = Rx.Observable.fromEvent(canvas, 'mousemove')

    const mouseups = Rx.Observable.fromEvent(canvas, 'mouseup')
    const mouseleaves = Rx.Observable.fromEvent(canvas, 'mouseleave')
    const ends = mouseups.merge(mouseleaves)

    const clicks = starts.concatMap(mouseDownEvent => {
      return ends.takeUntil(moves).map(mouseUpEvent => {
        const x = mouseUpEvent.x
        const y = mouseUpEvent.y
        return {x, y}
      })
    })

    const selects = clicks
    .filter(point => rectsAt(point).length > 0)
    .concatMap(point => Rx.Observable.from(rectsAt(point)).take(1))

    const unselects = clicks
    .filter(point => rectsAt(point).length === 0)

    const drags = starts
    .filter(() => !state.selected)
    .concatMap(dragStartEvent => {
      const id = nextId++
      return moves.takeUntil(ends).map(dragEvent => ({
        id,
        square: {
          p1: {
            x: dragStartEvent.x,
            y: dragStartEvent.y
          },
          p2: {
            x: dragEvent.x,
            y: dragEvent.y
          }
        }
      }))
    })

    const rectDrags = starts
    .filter(() => state.selected)
    .filter(e => rectsAt({x: e.x, y: e.y}).includes(state.selected))
    .concatMap(dragStartEvent => {
      const initialRect = state.shapes[state.selected]
      const offset = {
        x: initialRect.x - dragStartEvent.x,
        y: initialRect.y - dragStartEvent.y
      }
      return moves.takeUntil(ends).map(dragEvent => ({
        id: state.selected,
        to: {
          x: dragEvent.x,
          y: dragEvent.y
        },
        offset
      }))
    })

    const drops = starts.concatMap(dragStartEvent =>
      ends.first().map(dragEndEvent => {
        const x = dragEndEvent.x - dragStartEvent.x
        const y = dragEndEvent.y - dragStartEvent.y
        return {x, y}
      })
    )

    selects.forEach(id => {
      state.selected = id
      render()
    })

    unselects.forEach(() => {
      state.selected = undefined
      render()
    })

    drags.forEach(data => {
      const square = data.square
      const x = Math.min(square.p1.x, square.p2.x)
      const y = Math.min(square.p1.y, square.p2.y)
      const width = Math.max(square.p1.x, square.p2.x) - x
      const height = Math.max(square.p1.y, square.p2.y) - y
      state.shapes[data.id] = { x, y, width, height }
      render()
    })

    rectDrags.forEach(data => {
      state.shapes[data.id].x = data.to.x + data.offset.x
      state.shapes[data.id].y = data.to.y + data.offset.y
      render()
    })
  }

  function rectsAt(point) {
    return Object.keys(state.shapes).filter(key => rectContains(state.shapes[key], point))
  }

  function rectContains(rect, point) {
    return rect.x <= point.x && rect.y <= point.y && point.x <= (rect.x + rect.width) && point.y <= (rect.y + rect.height)
  }

  function render() {
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ccc'
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.stroke()
    ctx.closePath();

    ctx.fillStyle = '#f00'
    Object.keys(state.shapes).map(key => state.shapes[key]).forEach(rect => {
      ctx.beginPath();
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
      ctx.closePath();
    })

    if (state.selected) {
      ctx.strokeStyle = '#00f'
      const rect = state.shapes[state.selected]
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height)
      ctx.stroke()
      ctx.closePath();
    }
  }

  return {
    start
  }
})()

window.addEventListener('load', Main.start)
