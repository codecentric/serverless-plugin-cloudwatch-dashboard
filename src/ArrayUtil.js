'use strict'

class ArrayUtil {
  static notEmpty (...arrays) {
    return arrays
      .map(array => typeof array !== 'undefined' && array.length > 0)
      .reduce(function (acc, next) {
        return acc && next
      }, true)
  }
}

module.exports = ArrayUtil
