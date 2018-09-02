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

Array.prototype.sortBy = function(fn) {
  if (typeof fn == 'string') fn = (el) => el[fn];
  return this.sort((a,b) => {
    if (fn(a) < fn(b)) return -1;
    return 1
  })
}

// renvoie l'array intersection de @arr1 et @arr2
function intersection(arr1, arr2) {
  let res = []
  for (let o of arr1) {
    if (arr2.indexOf(o) > -1) res.push(o)
  }
  return res
}

module.exports = {
  sortBy: (arr, fn) => arr.sortBy(fn),
  intersection
}