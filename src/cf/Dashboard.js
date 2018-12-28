'use strict'

class Dashboard {
  constructor (name, widgets) {
    this.name = name
    this.widgets = widgets
  }

  create () {
    return {
      Type: 'AWS::CloudWatch::Dashboard',
      Properties: {
        DashboardName: this.name,
        DashboardBody: JSON.stringify({ widgets: this.widgets })
      }
    }
  }
}

module.exports = Dashboard