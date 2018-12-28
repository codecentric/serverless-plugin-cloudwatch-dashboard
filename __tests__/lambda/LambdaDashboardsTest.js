'use strict'

const sinon = require('sinon')
const test = require('ava')

const LambdaDashboards = require('../../src/lambda/LambdaDashboards')

const logger = msg => {}
const region = 'eu-central-1'
const defaultMetrics = ['Duration', 'Errors', 'Invocations', 'Throttles']
const defaultStats = ['p99', 'p95', 'p90', 'p50']

// ---------------------------------- tests for getConfig() ---------------------------------- //

test('default config is used when no config provided', t => {
  const customConfig = {}
  const functions = {}
  const lambdaDashboardsFactory = new LambdaDashboards(logger, region, customConfig, functions)
  const config = lambdaDashboardsFactory.getConfig()

  t.deepEqual(config.stats, defaultStats)
  t.deepEqual(config.metrics, defaultMetrics)
  t.is(config.enabled, false)
})

test('override default enabled flag', t => {
  const customConfig = {
    enabled: true
  }
  const functions = {}
  const lambdaDashboardsFactory = new LambdaDashboards(logger, region, customConfig, functions)
  const config = lambdaDashboardsFactory.getConfig()

  t.deepEqual(config.stats, defaultStats)
  t.deepEqual(config.metrics, defaultMetrics)
  t.is(config.enabled, true)
})

test('override default metrics', t => {
  const customConfig = {
    metrics: ['Duration', 'Errors']
  }
  const functions = {}
  const lambdaDashboardsFactory = new LambdaDashboards(logger, region, customConfig, functions)
  const config = lambdaDashboardsFactory.getConfig()

  t.deepEqual(config.metrics, ['Duration', 'Errors'])
  t.deepEqual(config.stats, defaultStats)
  t.is(config.enabled, false)
})

test('override default stats', t => {
  const customConfig = {
    stats: ['p99', 'p95']
  }
  const functions = {}
  const lambdaDashboardsFactory = new LambdaDashboards(logger, region, customConfig, functions)
  const config = lambdaDashboardsFactory.getConfig()

  t.deepEqual(config.metrics, defaultMetrics)
  t.deepEqual(config.stats, ['p99', 'p95'])
  t.is(config.enabled, false)
})

test('override all default configs', t => {
  const customConfig = {
    metrics: ['Duration', 'Errors'],
    stats: ['p99', 'p95'],
    enabled: true
  }
  const functions = {}
  const lambdaDashboardsFactory = new LambdaDashboards(logger, region, customConfig, functions)
  const config = lambdaDashboardsFactory.getConfig()

  t.deepEqual(config.metrics, ['Duration', 'Errors'])
  t.deepEqual(config.stats, ['p99', 'p95'])
  t.is(config.enabled, true)
})

// ---------------------------------- tests for getFunctionNames() ---------------------------------- //

test('get functions when custom enabled flag false', t => {
  const customConfig = {
    enabled: false
  }

  const functions = {
    f1: {
      name: 's-dev-f1',
      dashboard: true
    },
    f2: {
      name: 's-dev-f2',
      dashboard: false
    },
    f3: {
      name: 's-dev-f3'
    }
  }

  const lambdaDashboardsFactory = new LambdaDashboards(logger, region, customConfig, functions)
  const functionNames = lambdaDashboardsFactory.getFunctionNames()

  t.deepEqual(functionNames, ['s-dev-f1'])
})

test('get functions when custom enabled flag true', t => {
  const customConfig = {
    enabled: true
  }

  const functions = {
    f1: {
      name: 's-dev-f1',
      dashboard: true
    },
    f2: {
      name: 's-dev-f2',
      dashboard: false
    },
    f3: {
      name: 's-dev-f3'
    }
  }

  const lambdaDashboardsFactory = new LambdaDashboards(logger, region, customConfig, functions)
  const functionNames = lambdaDashboardsFactory.getFunctionNames()

  t.deepEqual(functionNames, ['s-dev-f1', 's-dev-f3'])
})

// ---------------------------------- tests for createDashboards() ---------------------------------- //

test('create nothing if no functions selected', t => {
  const lambdaDashboardsFactory = new LambdaDashboards(logger, region, {}, {})

  sinon.stub(lambdaDashboardsFactory, 'getFunctionNames').returns([])

  sinon.stub(lambdaDashboardsFactory, 'getConfig').returns({
    metrics: ['Duration', 'Errors'],
    stats: ['p99', 'p95', 'p90'],
    enabled: true
  })

  const dashboards = lambdaDashboardsFactory.createDashboards()

  t.is(dashboards.length, 0)
})

test('create nothing if no metrics selected', t => {
  const lambdaDashboardsFactory = new LambdaDashboards(logger, region, {}, {})

  sinon.stub(lambdaDashboardsFactory, 'getFunctionNames').returns(['s-dev-f1'])

  sinon.stub(lambdaDashboardsFactory, 'getConfig').returns({
    metrics: [],
    stats: ['p99', 'p95', 'p90'],
    enabled: true
  })

  const dashboards = lambdaDashboardsFactory.createDashboards()

  t.is(dashboards.length, 0)
})

test('create nothing if no stats selected', t => {
  const lambdaDashboardsFactory = new LambdaDashboards(logger, region, {}, {})

  sinon.stub(lambdaDashboardsFactory, 'getFunctionNames').returns(['s-dev-f1'])

  sinon.stub(lambdaDashboardsFactory, 'getConfig').returns({
    metrics: ['Duration', 'Errors'],
    stats: [],
    enabled: true
  })

  const dashboards = lambdaDashboardsFactory.createDashboards()

  t.is(dashboards.length, 0)
})

test('create dashboards', t => {
  const lambdaDashboardsFactory = new LambdaDashboards(logger, region, {}, {})

  sinon.stub(lambdaDashboardsFactory, 'getFunctionNames').returns([
    's-dev-f1',
    's-dev-f2',
    's-dev-f3'
  ])

  sinon.stub(lambdaDashboardsFactory, 'getConfig').returns({
    metrics: ['Duration', 'Errors'],
    stats: ['p99', 'p95', 'p90'],
    enabled: true
  })

  const dashboards = lambdaDashboardsFactory.createDashboards()

  t.is(dashboards.length, 2) // one dashboard for each metric

  dashboards.forEach(dashboard => {
    t.is(dashboard.Type, "AWS::CloudWatch::Dashboard")
    const widgets = JSON.parse(dashboard.Properties.DashboardBody).widgets
    t.is(widgets.length, 4) // one across all widget + one widget for each stat
  })
})
