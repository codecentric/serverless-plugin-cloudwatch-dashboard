'use strict'

const sinon = require('sinon')
const test = require('ava')

const Dashboard = require('../../src/cf/Dashboard')

const widgets = [
  {
    "type": "metric",
    "properties": {
      "region": "eu-central-1",
      "title": "Lambda Errors Across All",
      "metrics": [
        [ "AWS/Lambda", "Errors", { "stat": "Maximum" } ],
        [ "AWS/Lambda", "Errors", { "stat": "Minimum" } ]
      ],
      "view": "timeSeries",
      "stacked": false,
      "period": 300
    }
  },
  {
    "type": "metric",
    "properties": {
      "region": "eu-central-1",
      "title": "Lambda Errors By Function (p99)",
      "metrics": [
        [ "AWS/Lambda", "Errors", "FunctionName", "test-function-1", { "stat": "p99" } ]
      ],
      "view": "timeSeries",
      "stacked": false,
      "period": 300
    }
  }
]

test('create dashboard', t => {
  const dashboardFactory = new Dashboard('test-dashboard', widgets)
  const dashboard = dashboardFactory.create()

  t.is(dashboard.Type, 'AWS::CloudWatch::Dashboard')
  t.is(dashboard.Properties.DashboardName, 'test-dashboard')
  t.deepEqual(dashboard.Properties.DashboardBody, JSON.stringify({widgets: widgets}))
})