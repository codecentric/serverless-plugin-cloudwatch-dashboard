'use strict';

module.exports = class DashboardPlugin {

  constructor(serverless, options) {
    const service = serverless.service;

    const Dashboard = require('./Dashboard');
    const dashboardFactory = new Dashboard();

    this.hooks = {
      'before:package:finalize': () => this.addDashboards(service, dashboardFactory),
    };
  }

  addDashboards(service, dashboardFactory) {
    const functions = DashboardPlugin.getFunctionNames(service);
    const config = DashboardPlugin.getConfig(service);

    const dashboards = config.metrics.map(metric => dashboardFactory.create(
        service.provider.region,
        metric,
        config.stats,
        functions
    ));

    const template = service.provider.compiledCloudFormationTemplate;
    template.Resources = template.Resources || {};

    dashboards
        .filter(v => typeof v !== 'undefined')
        .forEach(dashboard => template.Resources[dashboard.Properties.DashboardName] = dashboard);
  }

  static getConfig(service) {
    const custom = service.custom || {};
    const config = custom.dashboard || {};

    const defaultConfig = {
      metrics: ['Duration', 'Errors', 'Invocations', 'Throttles'],
      stats: ['p99', 'p95', 'p90', 'p50']
    };

    return Object.assign(defaultConfig, config);
  }

  static getFunctionNames(service) {
    const functions = service.functions;

    return Object.keys(functions).map(name => {
      const config = functions[name].dashboard;
      if (config === false || config === 'false') return undefined;
      else return name;
    }).filter(v => typeof v !== 'undefined');
  }
};
