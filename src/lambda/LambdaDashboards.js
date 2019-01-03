'use strict'

const LambdaWidgets = require('./LambdaWidgets')
const Dashboard = require('../cf/Dashboard')
const ArrayUtil = require('../ArrayUtil')

class LambdaDashboards {

  constructor (logger, region, customConfig, functions) {
    this.logger = logger
    this.region = region
    this.customConfig = customConfig
    this.functions = functions
  }

  createDashboards () {
    const config = this.getConfig()
    const functionNames = this.getFunctionNames()

    if (ArrayUtil.notEmpty(functionNames, config.stats, config.metrics)) {
      return this.doCreateDashboards(functionNames, config)
    }
    else {
      return []
    }
  }

  doCreateDashboards(functionNames, config) {
    const widgetFactory = new LambdaWidgets(this.region, config.metrics, config.stats, functionNames)
    const allWidgets = widgetFactory.create()

    const dashboards = Object.keys(allWidgets).map( metricName => {
      const dashboardName = `LambdaDashboard${metricName}`
      const metricWidgets = allWidgets[metricName]
      const dashboardFactory = new Dashboard(dashboardName, metricWidgets)
      return dashboardFactory.create()
    })

    this.logger(`Summary: created ${dashboards.length} dashboards for ${functionNames.length} Lambda functions.`)
    return dashboards
  }

  getConfig () {
    const result = {
      metrics: ['Duration', 'Errors', 'Invocations', 'Throttles'],
      stats: ['p99', 'p95', 'p90', 'p50'],
      enabled: false
    }

    Object.assign(result, this.customConfig)
    return result
  }

  getFunctionNames () {
    const allEnabled = this.getConfig().enabled
    const isEnabled = functionEnabled => (allEnabled && functionEnabled !== false) || functionEnabled

    return Object.values(this.functions)
      .filter(f => isEnabled(f.dashboard))
      .map(f => f.name)
  }
}

module.exports = LambdaDashboards