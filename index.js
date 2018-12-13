'use strict';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'before:package:finalize': this.addDashboards.bind(this),
    };
  }

  addDashboards() {
    this.addDurationDashboard();
  }

  addDurationDashboard() {
    const statistics = ['p99', 'p95', 'p90', 'p50']; // TODO make configurable
    const widgets = statistics.map(statistic => this.createLambdaWidget('Duration', statistic));

    const dashboardName = this.serverless.service.service + '-' + this.serverless.service.provider.stage + '_LambdaDuration';
    const dashboardBody = { widgets: widgets};
    const dashboard = {
      Type : "AWS::CloudWatch::Dashboard",
      Properties : {
        DashboardName : dashboardName,
        DashboardBody : JSON.stringify(dashboardBody),
      }
    };

    const resources = this.serverless.service.provider.compiledCloudFormationTemplate.Resources;
    resources['LambdaDurationDashboard'] = dashboard;
  }

  createLambdaWidget(metric, statistic) {
    const metrics = this.serverless.service.getAllFunctions()
        .map(functionName => this.serverless.service.getFunction(functionName).name)
        .map(functionName => [ 'AWS/Lambda', metric, 'FunctionName', functionName, { "stat": statistic } ])
        .reduce((acc, next) => {
          acc.push(next);
          return acc;
        }, []);

    return this.createWidget(`Lambda ${metric} By Function (${statistic})`, metrics);
  }

  createWidget(name, metrics) {
    return {
      type: 'metric',
      width: 24,
      height: 6,
      properties: {
        metrics: metrics,
        view: 'timeSeries',
        stacked: false,
        region: this.serverless.service.provider.region,
        title: name,
        period: 300
      }
    }
  }
}

module.exports = ServerlessPlugin;
