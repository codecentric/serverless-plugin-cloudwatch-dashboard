'use strict'

const Widget = require('../cf/Widget')

class DynamoDBWidgets {

  constructor (region, metrics, tableNames, globalSecondaryIndexNames) {
    this.region = region
    this.metrics = metrics
    this.tableNames = tableNames
    this.globalSecondaryIndexNames = globalSecondaryIndexNames
  }

  create () {
    return this.metrics.map(metric => this.createWidget(metric))
  }

  createWidget(metric) {
    const widgetName = metric
    const tableMetrics = this.tableNames.map(name => [ 'AWS/DynamoDB', metric, 'TableName', name ])
    const indexMetrics = Object.keys(this.globalSecondaryIndexNames).reduce( (acc, tableName) => {
      const indexNames = this.globalSecondaryIndexNames[tableName]
      indexNames.forEach(indexName => acc.push([ 'AWS/DynamoDB', metric, 'TableName', tableName, 'GlobalSecondaryIndexName', indexName ]))
      return acc
    }, [])

    const widgetFactory = new Widget(this.region, widgetName, [].concat(tableMetrics).concat(indexMetrics))
    return widgetFactory.create()
  }
}

module.exports = DynamoDBWidgets