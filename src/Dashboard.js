'use strict';

module.exports = class Dashboard {

    create(region, metric, stats, functions) {
        const dashboardName = `${metric}Dashboard`;

        const Widget = require('./Widget');
        const widgetFactory = new Widget();

        if (stats.length > 0) {
            const widgets = stats.map(stat => widgetFactory.perFunction(region, metric, stat, functions));
            widgets.unshift(widgetFactory.acrossAll(region, metric, stats));

            return Dashboard.dashboard(dashboardName, widgets);
        }
    }

    static dashboard(name, widgets) {
        return {
            Type : "AWS::CloudWatch::Dashboard",
            Properties : {
                DashboardName : name,
                DashboardBody : JSON.stringify({ widgets: widgets}),
            }
        };
    }
};