'use strict'

const sinon = require('sinon')
const test = require('ava')

const DashboardPlugin = require('../src/DashboardPlugin')

const dummyDashboard = {
  Properties: {
    DashboardName: 'test-dashboard'
  }
}

test('do nothing if no dashboards available', t => {
  const serverless = {
    service: {
      provider: {
        region: 'eu-central-1',
        compiledCloudFormationTemplate: {}
      }
    }
  }

  const dashboardPlugin = new DashboardPlugin(serverless, {})
  sinon.stub(dashboardPlugin, 'createLambdaDashboards').returns([])
  dashboardPlugin.addDashboards()

  t.deepEqual(serverless.service.provider.compiledCloudFormationTemplate, {})
})

test('creates new resources for dashboards, when missing', t => {
  const serverless = {
    service: {
      provider: {
        region: 'eu-central-1',
        compiledCloudFormationTemplate: {}
      }
    }
  }

  const dashboardPlugin = new DashboardPlugin(serverless, {})
  sinon.stub(dashboardPlugin, 'createLambdaDashboards').returns([dummyDashboard])
  dashboardPlugin.addDashboards()

  t.deepEqual(serverless.service.provider.compiledCloudFormationTemplate, {
    Resources: {
      'test-dashboard': dummyDashboard
    }
  })
})

test('add dashboards to existing resources when not missing', t => {
  const serverless = {
    service: {
      provider: {
        region: 'eu-central-1',
        compiledCloudFormationTemplate: {
          Resources: {
            otherResource: 'dont touch me'
          }
        }
      }
    }
  }

  const dashboardPlugin = new DashboardPlugin(serverless, {})
  sinon.stub(dashboardPlugin, 'createLambdaDashboards').returns([dummyDashboard])
  dashboardPlugin.addDashboards()

  t.deepEqual(serverless.service.provider.compiledCloudFormationTemplate, {
    Resources: {
      otherResource: 'dont touch me',
      'test-dashboard': dummyDashboard
    }
  })
})

test('create all dashboards creates lambda and dynamoDB dashboards', t => {
  const serverless = {
    service: {
      provider: {
        region: 'eu-central-1'
      }
    }
  }

  const dashboardPlugin = new DashboardPlugin(serverless, {})
  sinon.stub(dashboardPlugin, 'createLambdaDashboards').returns(['lambda-dashboard-1', 'lambda-dashboard-2'])
  sinon.stub(dashboardPlugin, 'createDynamoDBDashboards').returns(['dynamoDB-dashboard-1', 'dynamoDB-dashboard-2'])
  t.deepEqual(dashboardPlugin.createAllDashboards(), ['dynamoDB-dashboard-1', 'dynamoDB-dashboard-2', 'lambda-dashboard-1', 'lambda-dashboard-2'])
})

test('create lambda dashboards', t => {
  const serverless = {
    cli: {
      log: msg => {}
    },
    service: {
      custom: {
        dashboard: {
          lambda: {
            metrics: ['Duration'],
            stats: ['p99'],
            enabled: true
          }
        }
      },
      functions: {
        's-dev-f1': {},
        's-dev-f2': {}
      },
      provider: {
        region: 'eu-central-1',
        compiledCloudFormationTemplate: {
          Resources: {
            otherResource: 'dont touch me'
          }
        }
      }
    }
  }

  const dashboardPlugin = new DashboardPlugin(serverless, {})
  const dashboards = dashboardPlugin.createLambdaDashboards()

  t.is(dashboards.length, 1)
  t.is(dashboards[0].Type, 'AWS::CloudWatch::Dashboard')
  t.deepEqual(JSON.parse(dashboards[0].Properties.DashboardBody).widgets.length, 2)
})
