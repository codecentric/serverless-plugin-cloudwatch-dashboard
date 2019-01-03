'use strict'

const Widget = require('../cf/Widget')
const ArrayUtil = require('../ArrayUtil')

class DynamoDBWidgets {

  constructor (region, metrics, tableNames, globalSecondaryIndexNames) {
    this.region = region
    this.tableMetrics = metrics
    this.tableNames = tableNames
    this.globalSecondaryIndexNames = globalSecondaryIndexNames
  }

  create () {
    const tableMetricWidgets = this.tableMetrics.map(metric => this.createTableMetricWidget(metric))
    const returnedItemCountWidget = this.createReturnedItemCountWidget()
    const successfulRequestLatencyWidget = this.createSuccessfulRequestLatencyWidget()

    return []
      .concat(tableMetricWidgets)
      .concat(returnedItemCountWidget)
      .concat(successfulRequestLatencyWidget)
  }

  createTableMetricWidget(metric) {
    const widgetName = metric
    const widgetTableMetrics = this.tableNames.map(name => [ 'AWS/DynamoDB', metric, 'TableName', name ])

    const widgetIndexMetrics = ArrayUtil.flatMap(Object.keys(this.globalSecondaryIndexNames), tableName =>
      this.globalSecondaryIndexNames[tableName].map(indexName =>
        [ 'AWS/DynamoDB', metric, 'TableName', tableName, 'GlobalSecondaryIndexName', indexName ]
      )
    )

    const widgetFactory = new Widget(this.region, widgetName, [].concat(widgetTableMetrics).concat(widgetIndexMetrics))
    return widgetFactory.create()
  }

  createReturnedItemCountWidget () {
    const metric = 'ReturnedItemCount'
    const operations = [ 'Query', 'Scan' ]
    const widgetName = metric

    const widgetMetrics = ArrayUtil.flatMap(this.tableNames, tableName =>
      operations.map(operation =>
        [ 'AWS/DynamoDB', metric, 'TableName', tableName, 'Operation', operation, { 'stat': 'Average' } ]
      )
    )

    const widgetFactory = new Widget(this.region, widgetName, widgetMetrics)
    return widgetFactory.create()
  }

  createSuccessfulRequestLatencyWidget () {
    const metric = 'SuccessfulRequestLatency'
    const operations = [ 'Query', 'Scan', 'GetItem', 'PutItem', 'UpdateItem', 'BatchWriteItem' ]
    const widgetName = metric

    const widgetMetrics = ArrayUtil.flatMap(this.tableNames, tableName =>
      operations.map(operation =>
        [ 'AWS/DynamoDB', metric, 'TableName', tableName, 'Operation', operation ]
      )
    )

    const widgetFactory = new Widget(this.region, widgetName, widgetMetrics)
    return widgetFactory.create()
  }
}

module.exports = DynamoDBWidgets