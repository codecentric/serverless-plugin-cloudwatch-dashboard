'use strict'

const test = require('ava')

const ArrayUtil = require('../src/ArrayUtil')

test('notEmpty', t => {
  t.is(ArrayUtil.notEmpty([]), false)
  t.is(ArrayUtil.notEmpty([], []), false)

  t.is(ArrayUtil.notEmpty(['a']), true)
  t.is(ArrayUtil.notEmpty(['a'], ['b', 'c']), true)
  t.is(ArrayUtil.notEmpty(['a'], [], ['b', 'c']), false)
})

test('flatMap', t => {
  t.deepEqual(ArrayUtil.flatMap([1, 2, 3], entry => [entry]), [1, 2, 3])
  t.deepEqual(ArrayUtil.flatMap([1, 2, 3], entry => [5 * entry, 10 * entry]), [5, 10, 10, 20, 15, 30])
})
