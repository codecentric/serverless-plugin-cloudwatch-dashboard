'use strict'

const LambdaDashboards = require('./lambda/LambdaDashboards')

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
    this.serverless = serverless
    this.service = serverless.service
    this.region = this.service.provider.region
    this.customConfig = this.service.custom || {}

    this.hooks = {
      'before:package:finalize': () => this.addDashboards()
    }
  }

  addDashboards () {
    const allDashboards = [].concat(this.createLambdaDashboards()) // TODO add other dashboards here

    if (allDashboards.length > 0) {
      const newResources =  allDashboards.reduce((acc, dashboard) => {
        acc[dashboard.Properties.DashboardName] = dashboard
        return acc
      }, {})

      const template = this.service.provider.compiledCloudFormationTemplate
      template.Resources = Object.assign(newResources, template.Resources)
      this.service.provider.compiledCloudFormationTemplate = template
    }
  }

  createLambdaDashboards () {
    const logger = msg => this.serverless.cli.log('[serverless-plugin-cloudwatch-dashboard]: Lambda: ' + msg)

    const dashboardConfig = this.customConfig.dashboard || {}
    const lambdaConfig = dashboardConfig.lambda || {}
    const functions = this.service.functions || {}

    const lambdaDashboardsFactory = new LambdaDashboards(logger, this.region, lambdaConfig, functions)
    return lambdaDashboardsFactory.createDashboards()
  }
}

module.exports = DashboardPlugin
