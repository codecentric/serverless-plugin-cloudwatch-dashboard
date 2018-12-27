'use strict'

module.exports = class Dashboard {
  create (region, metric, stats, functions) {
    const Widget = require('./Widget')
    const widgetFactory = new Widget()

    const dashboardName = `${metric}Dashboard`
    const widgets = stats.map(stat => widgetFactory.perFunction(region, metric, stat, functions))
    widgets.unshift(widgetFactory.acrossAll(region, metric))
    return Dashboard.dashboard(dashboardName, widgets)
  }

  static dashboard (name, widgets) {
    return {
      Type: 'AWS::CloudWatch::Dashboard',
      Properties: {
        DashboardName: name,
        DashboardBody: JSON.stringify({ widgets: widgets })
      }
    }
  }
}
