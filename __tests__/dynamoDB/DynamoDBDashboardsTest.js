'use strict'

const sinon = require('sinon')
const test = require('ava')

const DynamoDBDashboards = require('../../src/dynamoDB/DynamoDBDashboards')

const logger = msg => {}
const region = 'eu-central-1'

const resources = {
  TableResource1: {
    Type: "AWS::DynamoDB::Table",
    Properties: {
      TableName: 'TestTable-1'
    }
  },
  NonTableResource: {
    Type: "AWS::Lambda::Permission"
  },
  TableResource2: {
    Type: "AWS::DynamoDB::Table",
    Properties: {
      TableName: 'TestTable-2',
      GlobalSecondaryIndexes: [
        {
          IndexName: 'Index-1'
        },
        {
          IndexName: 'Index-2'
        }
      ]
    }
  }
}

test('returns empty list when no tables are defined', t => {
  const noTableResources = {
    NonTableResource: {
      Type: "AWS::Lambda::Permission"
    }
  }

  const dynamoDBDashboardsFactory = new DynamoDBDashboards(logger, region, {enabled: true}, noTableResources)
  t.deepEqual(dynamoDBDashboardsFactory.createDashboards(), [])
})

test('returns empty list when dynamoDB config is disabled', t => {
  const disabledConfigFactory = new DynamoDBDashboards(logger, region, {enabled: false}, resources)
  t.deepEqual(disabledConfigFactory.createDashboards(), [])
})

test('returns empty list when metrics is empty', t => {
  const dynamoDBConfig = {
    metrics: [],
    enabled: true
  }

  const disabledConfigFactory = new DynamoDBDashboards(logger, region, dynamoDBConfig, resources)
  t.deepEqual(disabledConfigFactory.createDashboards(), [])
})

test('default config', t => {
  const expected = {
    metrics: [
      'ProvisionedReadCapacityUnits',
      'ConsumedReadCapacityUnits',
      'ProvisionedWriteCapacityUnits',
      'ConsumedWriteCapacityUnits'
    ],
    enabled: false
  }

  const dynamoDBDashboardsFactory = new DynamoDBDashboards(logger, region, {}, resources)
  t.deepEqual(dynamoDBDashboardsFactory.getConfig(), expected)
})

test('overwrite default config', t => {
  const overwrite = {
    metrics: ['ProvisionedReadCapacityUnits', 'ConsumedReadCapacityUnits'],
    enabled: true
  }

  const dynamoDBDashboardsFactory = new DynamoDBDashboards(logger, region, overwrite, resources)
  t.deepEqual(dynamoDBDashboardsFactory.getConfig(), overwrite)
})

test('get table names', t => {
  const dynamoDBDashboardsFactory = new DynamoDBDashboards(logger, region, {enabled: true}, resources)
  t.deepEqual(dynamoDBDashboardsFactory.getTableNames(), ['TestTable-1', 'TestTable-2'])
})

test('get global secondary index names', t => {
  const expected = {
    'TestTable-1': [],
    'TestTable-2': ['Index-1', 'Index-2']
  }

  const dynamoDBDashboardsFactory = new DynamoDBDashboards(logger, region, {enabled: true}, resources)
  t.deepEqual(dynamoDBDashboardsFactory.getGlobalSecondaryIndexNames(), expected)
})

test('create dashboards', t => {
  const dynamoDBDashboardsFactory = new DynamoDBDashboards(logger, region, {enabled: true}, resources)
  const dashboards = dynamoDBDashboardsFactory.createDashboards()
  t.is(dashboards.Type, 'AWS::CloudWatch::Dashboard')
  t.truthy(JSON.parse(dashboards.Properties.DashboardBody).widgets)
})