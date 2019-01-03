'use strict'

const DynamoDBWidgets = require("./DynamoDBWidgets")
const Dashboard = require('../cf/Dashboard')
const ArrayUtil = require('../ArrayUtil')

class DynamoDBDashboards {

  constructor (logger, region, dynamoDBConfig, resources) {
    this.logger = logger
    this.region = region
    this.dynamoDBConfig = dynamoDBConfig
    this.resources = resources
  }

  createDashboards () {
    const config = this.getConfig()
    const tableNames = this.getTableNames()
    const globalSecondaryIndexNames = this.getGlobalSecondaryIndexNames()

    if (config.enabled === true && ArrayUtil.notEmpty(tableNames, config.metrics)) {
      return this.doCreateDashboards(config.metrics, tableNames, globalSecondaryIndexNames)
    }
    else {
      return []
    }
  }

  doCreateDashboards (metrics, tableNames, globalSecondaryIndexNames) {
    const widgetFactory = new DynamoDBWidgets(this.region, metrics, tableNames, globalSecondaryIndexNames)
    const widgets = widgetFactory.create()
    const dashboardFactory = new Dashboard("DynamoDBDashboard", widgets)

    this.logger(`Summary: created 1 dashboard for ${tableNames.length} DynamoDB tables.`)

    return dashboardFactory.create()
  }

  getConfig() {
    const result = {
      metrics: [
        'ProvisionedReadCapacityUnits',
        'ConsumedReadCapacityUnits',
        'ProvisionedWriteCapacityUnits',
        'ConsumedWriteCapacityUnits'
      ],
      enabled: false
    }

    Object.assign(result, this.dynamoDBConfig)
    return result
  }

  getTableNames () {
    return Object
      .keys(this.resources)
      .filter(key => this.resources[key].Type === "AWS::DynamoDB::Table")
      .map(key => this.resources[key].Properties.TableName)
  }

  getGlobalSecondaryIndexNames () {
    return Object
      .keys(this.resources)
      .filter(key => this.resources[key].Type === "AWS::DynamoDB::Table")
      .reduce( (acc, key) => {
        const tableName = this.resources[key].Properties.TableName
        const indexes = this.resources[key].Properties.GlobalSecondaryIndexes || []
        const indexNames = indexes.map( index => index.IndexName)
        acc[tableName] = indexNames
        return acc
      }, {})
  }

}

module.exports = DynamoDBDashboards