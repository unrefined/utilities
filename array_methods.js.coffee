if!Array.prototype.indexOf
  window.Array.prototype.indexOf = ->
    for i, val of this
      if val==obj
        return i
    return -1

Array.prototype.remove = (value) ->
  if this.indexOf(value) != -1
    this.splice this.indexOf(value), 1
    return this.length
  else
    return false