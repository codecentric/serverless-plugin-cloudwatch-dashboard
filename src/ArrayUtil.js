'use strict'

class ArrayUtil {
  static notEmpty (...arrays) {
    return arrays
      .map(array => typeof array !== 'undefined' && array.length > 0)
      .reduce(function (acc, next) {
        return acc && next
      }, true)
  }

  static flatMap (array, op) {
    return array.reduce((acc, next) => {
      op(next).forEach(nextResult => acc.push(nextResult))
      return acc
    }, [])
  }
}

module.exports = ArrayUtil
