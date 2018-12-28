'use strict'

class Widget {

  constructor (region, name, metrics) {
    this.region = region
    this.name = name
    this.metrics = metrics
  }

  create () {
    return {
      type: 'metric',
      width: 24,
      height: 6,
      properties: {
        region: this.region,
        title: this.name,
        metrics: this.metrics,
        view: 'timeSeries',
        stacked: false,
        period: 300
      }
    }
  }
}

module.exports = Widget