'use strict'

const sinon = require('sinon')
const test = require('ava')

const Widget = require('../../src/cf/Widget')

const metrics = [
  [ "AWS/Lambda", "Duration", "FunctionName", "test-function-1", { "stat": "p99" } ],
  [ "AWS/Lambda", "Duration", "FunctionName", "test-function-2", { "stat": "p99" } ],
  [ "AWS/Lambda", "Errors",   "FunctionName", "test-function-1", { "stat": "p50" } ]
]

test('create widget', t => {
  const widgetFactory = new Widget('eu-central-1', 'test-widget', metrics)
  const widget = widgetFactory.create()

  t.is(widget.type, 'metric')
  t.is(widget.properties.title, 'test-widget')
  t.is(widget.properties.region, 'eu-central-1')
  t.deepEqual(widget.properties.metrics, metrics)
})