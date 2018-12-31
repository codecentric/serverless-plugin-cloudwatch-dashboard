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
    this.logger = msg => serverless.cli.log('[serverless-plugin-cloudwatch-dashboard]: ' + msg)
    this.service = serverless.service

    this.hooks = {
      'before:package:finalize': () => this.addDashboards()
    }
  }

  addDashboards () {
    const allDashboards = this.createAllDashboards()

    if (allDashboards.length > 0) {
      const newResources = allDashboards.reduce((acc, dashboard) => {
        acc[dashboard.Properties.DashboardName] = dashboard
        return acc
      }, {})

      const template = this.service.provider.compiledCloudFormationTemplate
      template.Resources = Object.assign(newResources, template.Resources)
      this.service.provider.compiledCloudFormationTemplate = template
    }
  }

  createAllDashboards () {
    return [].concat(this.createLambdaDashboards()) // TODO add dynamoDB dashboards here
  }

  createLambdaDashboards () {
    const customConfig = this.service.custom || {}
    const dashboardConfig = customConfig.dashboard || {}
    const lambdaConfig = dashboardConfig.lambda || {}
    const functions = this.service.functions || {}

    const lambdaDashboardsFactory = new LambdaDashboards(this.logger, this.service.provider.region, lambdaConfig, functions)
    return lambdaDashboardsFactory.createDashboards()
  }
}

module.exports = DashboardPlugin
