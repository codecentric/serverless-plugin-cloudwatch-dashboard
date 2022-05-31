'use strict'

const createDailyDashboard = require('./dailyDashboard')

/**
 * @module serverless-lambda-daily-cloudwatch-dashboard
 *
 * @see {@link https://serverless.com/framework/docs/providers/aws/guide/plugins/}
 * */
module.exports = class Plugin {
  /**
   * @description Serverless lambda daily cloudWatch dashboard
   * @constructor
   *
   * @param {!Object} serverless - Serverless object
   * @param {!Object} options - Serverless options
   * */
  constructor(serverless, options) {
    this.logger = msg => serverless.cli.log('[serverless-lambda-plugin-cloudwatch-dashboard]: ' + msg)

    this.service = serverless.service
    this.stage = options.stage

    this.hooks = {
      'before:package:finalize': () => this.addDashboards()
    }
  }

  addDashboards() {
    const dailyDashboardResource = createDailyDashboard(this.service, this.stage);

    const template = this.service.provider.compiledCloudFormationTemplate
    template.Resources = Object.assign(dailyDashboardResource, template.Resources)
    this.service.provider.compiledCloudFormationTemplate = template
  }
}