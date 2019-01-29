'use strict'

const LambdaDashboards = require('./lambda/LambdaDashboards')
const DynamoDBDashboards = require('./dynamoDB/DynamoDBDashboards')

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
    this.region = this.service.provider.region

    this.hooks = {
      'before:package:finalize': () => this.addDashboards()
    }
  }

  addDashboards () {
    const allDashboards = this.createAllDashboards()

    if (allDashboards.length > 0) {
      const newResources = allDashboards.reduce((acc, dashboard) => {
        const resourceName = dashboard.Properties.DashboardName
        dashboard.Properties.DashboardName = this.service.service + "-" + resourceName;
        acc[resourceName] = dashboard
        return acc
      }, {})

      const template = this.service.provider.compiledCloudFormationTemplate
      template.Resources = Object.assign(newResources, template.Resources)
      this.service.provider.compiledCloudFormationTemplate = template
    }
  }

  createAllDashboards () {
    return []
      .concat(this.createDynamoDBDashboards())
      .concat(this.createLambdaDashboards())
  }

  createDynamoDBDashboards () {
    const dashboardConfig = this.getDashboardConfig()
    const dynamoDBConfig = dashboardConfig.dynamoDB || {}

    const serverlessResources = this.service.resources || {}
    const cfResources = serverlessResources.Resources || {}

    const dynamoDBDashboardsFactory = new DynamoDBDashboards(this.logger, this.region, dynamoDBConfig, cfResources)
    return dynamoDBDashboardsFactory.createDashboards()
  }

  createLambdaDashboards () {
    const dashboardConfig = this.getDashboardConfig()
    const lambdaConfig = dashboardConfig.lambda || {}

    const functions = this.service.functions || {}

    const lambdaDashboardsFactory = new LambdaDashboards(this.logger, this.region, lambdaConfig, functions)
    return lambdaDashboardsFactory.createDashboards()
  }

  getDashboardConfig () {
    const customConfig = this.service.custom || {}
    return customConfig.dashboard || {}
  }
}

module.exports = DashboardPlugin
