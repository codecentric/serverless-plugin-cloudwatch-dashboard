'use strict'

const sinon = require('sinon')
const test = require('ava')

const DynamoDBWidgets = require('../../src/dynamoDB/DynamoDBWidgets')

const provisionedReadCapacityUnitsWidget = {
  height: 6,
  type: 'metric',
  width: 24,
  properties: {
    metrics: [
      [ 'AWS/DynamoDB', 'ProvisionedReadCapacityUnits', 'TableName', 'Table-1' ],
      [ 'AWS/DynamoDB', 'ProvisionedReadCapacityUnits', 'TableName', 'Table-2' ],
      [ 'AWS/DynamoDB', 'ProvisionedReadCapacityUnits', 'TableName', 'Table-2', 'GlobalSecondaryIndexName', 'Index-1' ],
      [ 'AWS/DynamoDB', 'ProvisionedReadCapacityUnits', 'TableName', 'Table-2', 'GlobalSecondaryIndexName', 'Index-2' ]
    ],
    period: 300,
    region: 'eu-central-1',
    stacked: false,
    title: 'ProvisionedReadCapacityUnits',
    view: 'timeSeries'
  }
}


test('test create dynamoDB widgets', t => {
  const metrics = ['ProvisionedReadCapacityUnits', 'ConsumedReadCapacityUnits']
  const tableNames = ['Table-1', 'Table-2']
  const indexNames = {
    'Table-2': [
      'Index-1',
      'Index-2'
    ]
  }
  const dynamoDBWidgetsFactory = new DynamoDBWidgets('eu-central-1', metrics, tableNames, indexNames)
  const widgets = dynamoDBWidgetsFactory.create()

  t.is(widgets.length, 2) // one widget per metric
  t.deepEqual(widgets[0], provisionedReadCapacityUnitsWidget)
})