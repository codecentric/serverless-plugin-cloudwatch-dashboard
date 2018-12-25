'use strict'

module.exports = class Widget {
  acrossAll (region, metric, stats) {
    const name = `Lambda ${metric} Across All`

    const metrics = stats
      .map(stat => [ 'AWS/Lambda', metric, { 'stat': stat } ])
      .reduce(Widget.collectToArray, [])

    return Widget.widget(region, name, metrics)
  }

  perFunction (region, metric, stat, functions) {
    const name = `Lambda ${metric} By Function (${stat})`

    const metrics = functions
      .map(functionName => [ 'AWS/Lambda', metric, 'FunctionName', functionName, { 'stat': stat } ])
      .reduce(Widget.collectToArray, [])

    return Widget.widget(region, name, metrics)
  }

  static collectToArray (acc, next) {
    acc.push(next)
    return acc
  }

  static widget (region, name, metrics) {
    return {
      type: 'metric',
      width: 24,
      height: 6,
      properties: {
        region: region,
        title: name,
        metrics: metrics,
        view: 'timeSeries',
        stacked: false,
        period: 300
      }
    }
  }
}
