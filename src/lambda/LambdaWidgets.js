'use strict'

const Widget = require('../cf/Widget')

class LambdaWidgets {

  constructor (region, metrics, stats, functionNames) {
    this.region = region
    this.metrics = metrics
    this.stats = stats
    this.functionNames = functionNames
  }

  create () {
    return this.metrics.reduce((acc, metric) => {
      const widgets = this.stats.map(stat => this.perFunction(metric, stat))
      widgets.unshift(this.acrossAll(metric))
      acc[metric] = widgets
      return acc;
    }, {})
  }

  perFunction (metric, stat) {
    const widgetName = `Lambda ${metric} By Function (${stat})`

    const widgetMetrics = this.functionNames
      .map(name => [ 'AWS/Lambda', metric, 'FunctionName', name, { 'stat': stat } ])

    const widgetFactory = new Widget(this.region, widgetName, widgetMetrics)
    return widgetFactory.create()
  }

  acrossAll (metric) {
    const widgetName = `Lambda ${metric} Across All`
    const stats = ['Maximum', 'Average', 'Minimum'] // only these stats seem to have values for across all metrics

    const widgetMetrics = stats
      .map(stat => [ 'AWS/Lambda', metric, { 'stat': stat } ])

    const widgetFactory = new Widget(this.region, widgetName, widgetMetrics)
    return widgetFactory.create()
  }
}

module.exports = LambdaWidgets
