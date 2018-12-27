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
    const logger = msg => serverless.cli.log('[serverless-plugin-cloudwatch-dashboard]: ' + msg)
    this.hooks = {
      'before:package:finalize': () => this.addDashboards(serverless.service, logger)
    }
  }

  addDashboards (service, logger) {
    const config = DashboardPlugin.getConfig(service)
    const stats = config.stats
    const metrics = config.metrics
    const enabled = config.enabled

    const functions = DashboardPlugin.getFunctionNames(service, enabled)

    if (DashboardPlugin.notEmpty(functions, stats, metrics)) {
      logger('Adding stats:')
      stats.forEach(s => logger('- ' + s))

      logger('... of functions:')
      functions.forEach(f => logger('- ' + f))

      logger('... to dashboards:')
      metrics.forEach(m => logger('- ' + m))

      const dashboards = this.createDashboards(service.provider.region, functions, metrics, stats)
      const dashboardResources = dashboards.reduce(function (acc, next) {
        acc[next.Properties.DashboardName] = next
        return acc
      }, {})

      logger(`Summary: added ${stats.length} statistics of ${functions.length} functions to ${dashboards.length} dashboards.`)

      const template = service.provider.compiledCloudFormationTemplate
      template.Resources = Object.assign(dashboardResources, template.Resources)
    }
  }

  createDashboards (region, functions, metrics, stats) {
    const Dashboard = require('./Dashboard')
    const dashboardFactory = new Dashboard()
    return metrics.map(metric => dashboardFactory.create(region, metric, stats, functions))
  }

  static getConfig (service) {
    const custom = service.custom || {}
    const config = custom.dashboard || {}

    const defaultConfig = {
      metrics: ['Duration', 'Errors', 'Invocations', 'Throttles'],
      stats: ['p99', 'p95', 'p90', 'p50']
    }

    return Object.assign(defaultConfig, config)
  }

  static getFunctionNames (service, pluginEnabled) {
    const functions = service.functions

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
