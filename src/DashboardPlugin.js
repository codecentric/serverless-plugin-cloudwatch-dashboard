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
    const functions = DashboardPlugin.getFunctionNames(service)
    const stats = config.stats
    const metrics = config.metrics

    if (DashboardPlugin.notEmpty(functions, stats, metrics)) {
      logger('Adding dashboards:')
      const dashboards = this.createDashboards(service.provider.region, functions, metrics, stats)
      const dashboardResources = dashboards.reduce(function (acc, next) {
        logger('- ' + next.Properties.DashboardName)
        acc[next.Properties.DashboardName] = next
        return acc
      }, {})

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

  static getFunctionNames (service) {
    const functions = service.functions

    return Object.keys(functions).map(name => {
      const config = functions[name].dashboard
      if (config === false || config === 'false') return undefined
      else return name
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
