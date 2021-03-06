/*
Global variables referenced:
 - Rx (RxJs dependency)
 - document (DOM)
*/

const Observables = (function() {

  function getClickableObservables(selector) {
    const result = document.querySelectorAll(selector)
    const obs = []
    for (let i = 0; i < result.length; i++) {
      obs.push(Rx.Observable.fromEvent(result[i], 'click'))
    }
    return obs
  }

  function getCanvasObservables(canvas, providers) {
    const mousedowns = Rx.Observable.fromEvent(canvas, 'mousedown')
    .map(e => {
      e.preventDefault()
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

    const starts = mousedowns
    const mouseleaves = Rx.Observable.fromEvent(canvas, 'mouseleave')
    const ends = mouseups.merge(mouseleaves)

    const moves = Rx.Observable.fromEvent(canvas, 'mousemove')
    .map(e => {
      e.preventDefault()
      const rect = e.target.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    })

    const clicks = starts.concatMap(() => ends.takeUntil(moves))

    const selects = clicks
    .filter(point => Util.shapesAt(providers.shapes(), point).length > 0)
    .concatMap(point => Rx.Observable.from(Util.shapesAt(providers.shapes(), point)).take(1))

    const unselects = clicks
    .filter(point => Util.shapesAt(providers.shapes(), point).length === 0)

    const drags = starts
    .filter(() => !providers.hasSelected())
    .concatMap(dragStartEvent => {

      return moves.first().takeUntil(ends).concatMap(() => {
        const id = providers.nextId()
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
    })

    const rectDrags = starts
    .filter(() => providers.hasSelected())
    .filter(e => Util.shapesAt(providers.shapes(), {x: e.x, y: e.y}).includes(providers.selectedId()))
    .concatMap(dragStartEvent => {
      const initialRect = providers.shape(providers.selectedId())
      const offset = {
        x: initialRect.x - dragStartEvent.x,
        y: initialRect.y - dragStartEvent.y
      }
      return moves.takeUntil(ends).map(dragEvent => ({
        id: providers.selectedId(),
        to: {
          x: dragEvent.x,
          y: dragEvent.y
        },
        offset
      }))
    })

    return {
      starts,
      ends,
      moves,
      clicks,
      selects,
      unselects,
      drags,
      rectDrags
    }
  }

  return {
    getCanvasObservables,
    getColorObservables: () => getClickableObservables('.panel .colors div'),
    getLayerObservables: () => getClickableObservables('.panel .layers li')
  }
})()
