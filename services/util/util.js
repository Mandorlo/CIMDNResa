// this module adds some helpers for this project

// adds some functional skills to the Array type
Array.prototype.sum = function() {
    return this.reduce((a,b) => a+b, 0)
}

Array.prototype.mean = function() {
    if (this.length == 0) return 0;
    return this.reduce((a,b) => a+b, 0) / this.length
}

Array.prototype.square = function() {
  return this.map(el => Math.pow(el, 2))
}

Array.prototype.variance = function() {
  return this.square().mean() - Math.pow(this.mean(), 2)
}