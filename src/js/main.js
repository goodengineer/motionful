const state = {
  selectedColor: 'red',
  shapes: {}
}

const Main = (() => {

  let nextId = 0
  let canvas

  function start() {
    console.log('app started');
    canvas = document.getElementById('canvas')

    Screen.width = canvas.width
    Screen.height = canvas.height

    render()
    setObservables()
    setListeners()
  }

  function setListeners() {
    const removeSelected = () => (
      document.querySelectorAll('.panel .colors div')
      .forEach(btn => btn.classList.remove('selected'))
    )
    document.querySelectorAll('.panel .colors div').forEach(btn => {
      btn.addEventListener('click', e => {
        removeSelected()
        e.toElement.classList.add('selected')
        const color = e.toElement.getAttribute('color')
        state.selectedColor = color
      })
    })
  }

  function setObservables() {
    const starts = Rx.Observable.fromEvent(canvas, 'mousedown')
    .map(e => {
      const rect = e.target.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    })

    const moves = Rx.Observable.fromEvent(canvas, 'mousemove')
    .map(e => {
      const rect = e.target.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    })

    const mouseups = Rx.Observable.fromEvent(canvas, 'mouseup')
    .map(e => {
      const rect = e.target.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    })

    const mouseleaves = Rx.Observable.fromEvent(canvas, 'mouseleave')

    const ends = mouseups.merge(mouseleaves)

    const clicks = starts.concatMap(() => ends.takeUntil(moves))

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
      state.shapes[data.id] = { x, y, width, height, color: state.selectedColor }
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

    ctx.fillStyle = '#aaa'
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.stroke()
    ctx.closePath();

    Object.keys(state.shapes).map(key => state.shapes[key]).forEach(rect => {
      ctx.fillStyle = rect.color
      ctx.beginPath();
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
      ctx.closePath();
    })

    if (state.selected) {
      ctx.strokeStyle = 'gold'
      const rect = state.shapes[state.selected]
      ctx.lineWidth = 4;
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
