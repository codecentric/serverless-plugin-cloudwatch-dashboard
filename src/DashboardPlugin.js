'use strict'

/**
 * @module serverless-plugin-cloudwatch-dashboard
 *
 * @see {@link https://serverless.com/framework/docs/providers/aws/guide/plugins/}
 * */
class DashboardPlugin {
  /**
   * @description Serverless CloudWatch Dashboards for Lambdas
   * @constructor
   *
   * @param {!Object} serverless - Serverless object
   * @param {!Object} options - Serverless options
   * */
  constructor (serverless, options) {
    this.service = serverless.service
    this.logger = msg => serverless.cli.log('[serverless-plugin-cloudwatch-dashboard]: ' + msg)
    this.hooks = {
      'before:package:finalize': () => this.addDashboards()
    }
  }

  addDashboards () {
    const config = this.getConfig()
    const stats = config.stats
    const metrics = config.metrics
    const enabled = config.enabled

    const functions = this.getFunctionNames(enabled)

    if (DashboardPlugin.notEmpty(functions, stats, metrics)) {
      this.logger('Adding stats:')
      stats.forEach(s => this.logger('- ' + s))

      this.logger('... of functions:')
      functions.forEach(f => this.logger('- ' + f))

      this.logger('... to dashboards:')
      metrics.forEach(m => this.logger('- ' + m))

      const dashboards = this.createDashboards(this.service.provider.region, functions, metrics, stats)
      const dashboardResources = dashboards.reduce(function (acc, next) {
        acc[next.Properties.DashboardName] = next
        return acc
      }, {})

      this.logger(`Summary: added ${stats.length} statistics of ${functions.length} functions to ${dashboards.length} dashboards.`)

      const template = this.service.provider.compiledCloudFormationTemplate
      template.Resources = Object.assign(dashboardResources, template.Resources)
      this.service.provider.compiledCloudFormationTemplate = template
    }
  }

  createDashboards (region, functions, metrics, stats) {
    const Dashboard = require('./Dashboard')
    const dashboardFactory = new Dashboard()
    return metrics.map(metric => dashboardFactory.create(region, metric, stats, functions))
  }

  getConfig () {
    const custom = this.service.custom || {}
    const config = custom.dashboard || {}

    const defaultConfig = {
      metrics: ['Duration', 'Errors', 'Invocations', 'Throttles'],
      stats: ['p99', 'p95', 'p90', 'p50'],
      enabled: true
    }

    return Object.assign(defaultConfig, config)
  }

  getFunctionNames (pluginEnabled) {
    const functions = this.service.functions || []

    return Object.keys(functions).map(name => {
      const functionEnabled = functions[name].dashboard
      if (pluginEnabled && functionEnabled !== false) return functions[name].name
      else if (functionEnabled) return functions[name].name
      else return undefined
    }).filter(v => typeof v !== 'undefined')
  }

  static notEmpty (...arrays) {
    return arrays.map(array => typeof array !== 'undefined' && array.length > 0)
      .reduce(function (acc, next) {
        return acc && next
      }, true)
  }
}

module.exports = DashboardPlugin
