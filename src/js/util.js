const Util = (function() {

  function rectsAt(rects, point) {
    return Object.keys(rects).filter(key => rectContains(rects[key], point))
  }

  function rectContains(rect, point) {
    return rect.x <= point.x && rect.y <= point.y && point.x <= (rect.x + rect.width) && point.y <= (rect.y + rect.height)
  }

  return {
    rectsAt,
    rectContains
  }
})()
