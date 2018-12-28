'use strict'

const sinon = require('sinon')
const test = require('ava')

const ArrayUtil = require('../src/ArrayUtil')

test('notEmpty', t => {
  t.is(ArrayUtil.notEmpty([]), false)
  t.is(ArrayUtil.notEmpty([], []), false)

  t.is(ArrayUtil.notEmpty(['a']), true)
  t.is(ArrayUtil.notEmpty(['a'], ['b', 'c']), true)
  t.is(ArrayUtil.notEmpty(['a'], [], ['b', 'c']), false)
})