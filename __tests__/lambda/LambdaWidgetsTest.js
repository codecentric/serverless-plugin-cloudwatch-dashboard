'use strict'

const sinon = require('sinon')
const test = require('ava')

const LambdaWidgets = require('../../src/lambda/LambdaWidgets')

const durationWidgets = [
  {
    type: 'metric',
    width: 24,
    height: 6,
    properties: {
      region: 'eu-central-1',
      title: 'Lambda Duration Across All',
      metrics: [
        [ 'AWS/Lambda', 'Duration', { stat: 'Maximum' } ],
        [ 'AWS/Lambda', 'Duration', { stat: 'Average' } ],
        [ 'AWS/Lambda', 'Duration', { stat: 'Minimum' } ],
      ],
      view: 'timeSeries',
      stacked: false,
      period: 300
    }
  },
  {
    type: 'metric',
    width: 24,
    height: 6,
    properties: {
      region: 'eu-central-1',
      title: 'Lambda Duration By Function (p99)',
      metrics: [
        [ 'AWS/Lambda', 'Duration', 'FunctionName', 'fn-1', { stat: 'p99' } ],
        [ 'AWS/Lambda', 'Duration', 'FunctionName', 'fn-2', { stat: 'p99' } ]
      ],
      view: 'timeSeries',
      stacked: false,
      period: 300
    }
  },
  {
    type: 'metric',
    width: 24,
    height: 6,
    properties: {
      region: 'eu-central-1',
      title: 'Lambda Duration By Function (p50)',
      metrics: [
        [ 'AWS/Lambda', 'Duration', 'FunctionName', 'fn-1', { stat: 'p50' } ],
        [ 'AWS/Lambda', 'Duration', 'FunctionName', 'fn-2', { stat: 'p50' } ],
      ],
      view: 'timeSeries',
      stacked: false,
      period: 300
    }
  }
]

test('test create lambda widgets', t => {
  const lambdaWidgetsFactory = new LambdaWidgets('eu-central-1', ['Duration', 'Errors'], ['p99', 'p50'], ['fn-1', 'fn-2'])
  const widgets = lambdaWidgetsFactory.create()

  t.deepEqual(Object.keys(widgets), ['Duration', 'Errors'])
  t.deepEqual(widgets['Duration'], durationWidgets)
})
