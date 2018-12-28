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


test('add dashboards to existing resources', t => {
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

