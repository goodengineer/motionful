const Util = (function() {

  function shapesAt(shapes, point) {
    // return Object.keys(rects).filter(key => rectContains(rects[key], point))
    return shapes.filter(shape => shapeContains(shape, point)).map(shape => shape.id)
  }

  function shapeContains(shape, point) {
    return shape.x <= point.x && shape.y <= point.y && point.x <= (shape.x + shape.width) && point.y <= (shape.y + shape.height)
  }

  return {
    shapesAt,
    shapeContains
  }
})()
