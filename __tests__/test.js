'use strict'

const sinon = require('sinon')
const test = require('ava')

const Plugin = require('..')

const defaultConfig = {
  metrics: ['Duration', 'Errors', 'Invocations', 'Throttles'],
  stats: ['p99', 'p95', 'p90', 'p50'],
  enabled: true
}

test('default config is used when no config is provided', t => {
  const serverless = {
    service: {}
  }

  const plugin = new Plugin(serverless, {})
  t.deepEqual(plugin.getConfig(), defaultConfig)
})

test('custom config overwrites default config', t => {
  const customConfig = {
    metrics: ['Duration'],
    stats: ['p99', 'p90', 'p50'],
    enabled: false
  }

  const serverless = {
    service: {
      custom: {
        dashboard: customConfig
      }
    }
  }

  const plugin = new Plugin(serverless, {})
  t.deepEqual(plugin.getConfig(), customConfig)
})

test('does nothing when there are no functions', t => {
  const serverless = {
    service: {
      provider: {}
    }
  }

  const plugin = new Plugin(serverless, {})
  plugin.addDashboards()
  t.is(serverless.service.provider.compiledCloudFormationTemplate, undefined)
})

test('does nothing when there are functions but no metrics', t => {
  const serverless = {
    service: {
      provider: {},
      custom: {
        dashboard: {
          metrics: [],
          stats: ['p99', 'p90', 'p50']
        }
      }
    }
  }

  const plugin = new Plugin(serverless, {})
  sinon.stub(plugin, 'getFunctionNames').returns(['F1', 'F2'])
  plugin.addDashboards()
  t.is(serverless.service.provider.compiledCloudFormationTemplate, undefined)
})

test('does nothing when there are functions but no stats', t => {
  const serverless = {
    service: {
      provider: {},
      custom: {
        dashboard: {
          metrics: ['Duration'],
          stats: []
        }
      }
    }
  }

  const plugin = new Plugin(serverless, {})
  sinon.stub(plugin, 'getFunctionNames').returns(['F1', 'F2'])
  plugin.addDashboards()
  t.is(serverless.service.provider.compiledCloudFormationTemplate, undefined)
})

test('local and global enabled flags are respected', t => {
  const serverless = {
    service: {
      functions: {
        F1: {
          name: 's-dev-F1',
          dashboard: true
        },
        F2: {
          name: 's-dev-F2',
          dashboard: false
        },
        F3: {
          name: 's-dev-F3'
        }
      }
    }
  }

  const plugin = new Plugin(serverless, {})
  t.deepEqual(plugin.getFunctionNames(true), ['s-dev-F1', 's-dev-F3'])
  t.deepEqual(plugin.getFunctionNames(false), ['s-dev-F1'])
})

test('empty Resources is initiated with dashboards', t => {
  const serverless = {
    cli: {
      log: msg => {}
    },
    service: {
      provider: {
        region: 'eu-central-1',
        compiledCloudFormationTemplate: {}
      },
      custom: {
        dashboard: {
          metrics: ['Duration', 'Errors'],
          stats: ['p99', 'p90']
        }
      },
      functions: {
        F1: {
          name: 's-dev-F1'
        },
        F2: {
          name: 's-dev-F2'
        }
      }
    }
  }

  const plugin = new Plugin(serverless, {})
  plugin.addDashboards()
  const resources = serverless.service.provider.compiledCloudFormationTemplate.Resources
  t.is(Object.keys(resources).length, 2)
  Object.values(resources).forEach(r => t.is(r.Type, 'AWS::CloudWatch::Dashboard'))
})

test('other Resources are preserved', t => {
  const serverless = {
    cli: {
      log: msg => {}
    },
    service: {
      provider: {
        region: 'eu-central-1',
        compiledCloudFormationTemplate: {
          Resources: {
            dontTouch1: {},
            dontTouch2: {}
          }
        }
      },
      custom: {
        dashboard: {
          metrics: ['Duration', 'Errors'],
          stats: ['p99', 'p90']
        }
      },
      functions: {
        F1: {
          name: 's-dev-F1'
        },
        F2: {
          name: 's-dev-F2'
        }
      }
    }
  }

  const plugin = new Plugin(serverless, {})
  plugin.addDashboards()
  const resources = serverless.service.provider.compiledCloudFormationTemplate.Resources
  t.is(Object.keys(resources).length, 4)
})
