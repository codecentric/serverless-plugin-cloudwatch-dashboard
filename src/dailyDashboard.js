'use strict'

module.exports = function createDailyDashboard(service, stage) {
  const region = service.provider.region
  const restApiName = service.provider.compiledCloudFormationTemplate.Resources["ApiGatewayRestApi"].Properties.Name
  const functionsApiGatewayRoutes = Object.keys(service.functions).map(key => service.functions[key].events?.find(x => x.http).http).filter(x => x !== undefined)

  const requestsAndErrorsMetrics = getRequestAndErrorsWidgetMetrics(stage, restApiName, functionsApiGatewayRoutes)
  const responseTimesMetrics = getResponseTimesWidgetMetrics(stage, restApiName, functionsApiGatewayRoutes)

  const logGroupSources = Object.keys(service.provider.compiledCloudFormationTemplate.Resources)
    .filter(x => x.endsWith("LogGroup"))
    .map(key => `SOURCE '${service.provider.compiledCloudFormationTemplate.Resources[key].Properties.LogGroupName}'`)
    .join(" | ");

  return {
    LambdaDailyDashboard: {
      Type: 'AWS::CloudWatch::Dashboard',
      Properties: {
        DashboardName: `${service.service}-daily`,
        DashboardBody: `{\"start\":\"-PT24H\",\"periodOverride\":\"inherit\",\"widgets\":[{\"type\":\"metric\",\"width\":6,\"height\":3,\"x\":0,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Requests\",\"region\":\"${region}\",\"metrics\":[[\"AWS/ApiGateway\",\"Count\",\"ApiName\",\"${restApiName}\",{\"label\":\" \",\"period\":86400,\"stat\":\"Sum\"}]]}},{\"type\":\"metric\",\"width\":6,\"height\":3,\"x\":6,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Errors\",\"region\":\"${region}\",\"metrics\":[[{\"label\":\" \",\"color\":\"#E42A2A\",\"expression\":\"SUM([serverErrors, clientErrors])\",\"period\":86400}],[\"AWS/ApiGateway\",\"5XXError\",\"ApiName\",\"${restApiName}\",{\"period\":86400,\"stat\":\"Sum\",\"visible\":false,\"id\":\"serverErrors\"}],[\"AWS/ApiGateway\",\"4XXError\",\"ApiName\",\"${restApiName}\",{\"period\":86400,\"stat\":\"Sum\",\"visible\":false,\"id\":\"clientErrors\"}]]}},{\"type\":\"metric\",\"width\":12,\"height\":3,\"x\":12,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Response Time (p95)\",\"region\":\"${region}\",\"metrics\":[[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"${restApiName}\",{\"label\":\" \",\"period\":86400,\"stat\":\"p95\"}]]}},{\"type\":\"metric\",\"width\":12,\"height\":6,\"x\":0,\"y\":3,\"properties\":{\"view\":\"timeSeries\",\"title\":\"Requests / Errors\",\"region\":\"${region}\",\"period\":3600,\"stat\":\"Sum\",\"metrics\":[${requestsAndErrorsMetrics.join(",")}],\"yAxis\":{\"left\":{\"min\":0},\"right\":{\"min\":0}}}},{\"type\":\"metric\",\"width\":12,\"height\":6,\"x\":12,\"y\":3,\"properties\":{\"view\":\"timeSeries\",\"title\":\"Response Times\",\"region\":\"${region}\",\"period\":3600,\"stat\":\"p95\",\"metrics\":[${responseTimesMetrics.join(",")}],\"yAxis\":{\"left\":{\"min\":0},\"right\":{\"min\":0}}}},{\"type\":\"log\",\"width\":24,\"height\":6,\"x\":0,\"y\":9,\"properties\":{\"view\":\"table\",\"title\":\"Errors\",\"region\":\"${region}\",\"query\":\"${logGroupSources} | fields fromMillis(@timestamp) as Date, statusCode as Status, concat(subDomain, \\\".\\\", boundedContext, \\\".\\\", functionName) as Function, coalesce(message, @message) as Message, error.message as Detail, httpRequestId as RequestId\\n| filter statusCode >= 500 or @message like \\\"WafFiltered\\\"\"}}]}`
      }
    }
  }
}

function getRequestAndErrorsWidgetMetrics(stage, restApiName, functionsApiGatewayRoutes) {
  const requestsAndErrorsMetrics = [];

  for (var i = 0; i < functionsApiGatewayRoutes.length; i++) {
    if (i === 0) {
      requestsAndErrorsMetrics.push(`[\"AWS/ApiGateway\",\"Count\",\"ApiName\",\"${restApiName}\",\"Resource\",\"/${functionsApiGatewayRoutes[i].path}\",\"Stage\",\"${stage}\",\"Method\",\"${functionsApiGatewayRoutes[i].method.toUpperCase()}\"]`);
    } else {
      requestsAndErrorsMetrics.push(`[\"...\",\"/${functionsApiGatewayRoutes[i].path}\", \".\", \".\", \".\", \"${functionsApiGatewayRoutes[i].method.toUpperCase()}\"]`);
    }
  }

  for (var i = 0; i < functionsApiGatewayRoutes.length; i++) {
    if (i === 0) {
      requestsAndErrorsMetrics.push(`[\".\",\"5XXError\",\".\",\".\",\".\",\"/${functionsApiGatewayRoutes[i].path}\",\".\",\".\",\".\",\"${functionsApiGatewayRoutes[i].method.toUpperCase()}\",{ "yAxis": "right" }]`);
    } else {
      requestsAndErrorsMetrics.push(`[\"...\",\"/${functionsApiGatewayRoutes[i].path}\", \".\", \".\", \".\", \"${functionsApiGatewayRoutes[i].method.toUpperCase()}\",{ "yAxis": "right" }]`);
    }
  }

  return requestsAndErrorsMetrics;
}

function getResponseTimesWidgetMetrics(stage, restApiName, functionsApiGatewayRoutes) {
  const responseTimesMetrics = [];

  for (var i = 0; i < functionsApiGatewayRoutes.length; i++) {
    if (i === 0) {
      responseTimesMetrics.push(`[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"${restApiName}\",\"Resource\",\"/${functionsApiGatewayRoutes[i].path}\",\"Stage\",\"${stage}\",\"Method\",\"${functionsApiGatewayRoutes[i].method.toUpperCase()}\"]`);
    } else {
      responseTimesMetrics.push(`[\"...\",\"/${functionsApiGatewayRoutes[i].path}\", \".\", \".\", \".\", \"${functionsApiGatewayRoutes[i].method.toUpperCase()}\"]`);
    }
  }

  return responseTimesMetrics;
}