'use strict'

module.exports = function createDailyDashboard(service) {
  const region = service.provider.region
  const restApiName = service.provider.compiledCloudFormationTemplate.Resources["ApiGatewayRestApi"].Properties.Name

  const logGroupNames = Object.keys(service.provider.compiledCloudFormationTemplate.Resources)
    .filter(x => x.endsWith("LogGroup"))
    .map(key => service.provider.compiledCloudFormationTemplate.Resources[key].Properties.LogGroupName);

  return {
    LambdaDailyDashboard: {
      Type: 'AWS::CloudWatch::Dashboard',
      Properties: {
        DashboardName: "Daily",
        DashboardBody: `{\"start\":\"-PT24H\",\"periodOverride\":\"inherit\",\"widgets\":[{\"type\":\"metric\",\"width\":6,\"height\":3,\"x\":0,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Requests\",\"region\":\"${region}\",\"metrics\":[[\"AWS/ApiGateway\",\"Count\",\"ApiName\",\"${restApiName}\",{\"label\":\" \",\"period\":86400,\"stat\":\"Sum\"}]]}},{\"type\":\"metric\",\"width\":6,\"height\":3,\"x\":6,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Errors\",\"region\":\"${region}\",\"metrics\":[[{\"label\":\" \",\"color\":\"#E42A2A\",\"expression\":\"SUM([serverErrors, clientErrors])\",\"period\":86400}],[\"AWS/ApiGateway\",\"5XXError\",\"ApiName\",\"${restApiName}\",{\"period\":86400,\"stat\":\"Sum\",\"visible\":false,\"id\":\"serverErrors\"}],[\"AWS/ApiGateway\",\"4XXError\",\"ApiName\",\"${restApiName}\",{\"period\":86400,\"stat\":\"Sum\",\"visible\":false,\"id\":\"clientErrors\"}]]}},{\"type\":\"metric\",\"width\":12,\"height\":3,\"x\":12,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Response Time (p95)\",\"region\":\"${region}\",\"metrics\":[[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"${restApiName}\",{\"label\":\" \",\"period\":86400,\"stat\":\"p95\"}]]}},{\"type\":\"metric\",\"width\":12,\"height\":6,\"x\":0,\"y\":3,\"properties\":{\"view\":\"timeSeries\",\"title\":\"Requests / Errors\",\"region\":\"${region}\",\"metrics\":[[\"AWS/ApiGateway\",\"Count\",\"ApiName\",\"${restApiName}\",{\"color\":\"#1f77b4\",\"label\":\"Requests\",\"period\":3600,\"stat\":\"Sum\"}],[\"AWS/ApiGateway\",\"4XXError\",\"ApiName\",\"${restApiName}\",{\"color\":\"#ff7f0e\",\"label\":\"4XXs\",\"period\":3600,\"stat\":\"Sum\",\"yAxis\":\"right\"}],[\"AWS/ApiGateway\",\"5XXError\",\"ApiName\",\"${restApiName}\",{\"color\":\"#d13212\",\"label\":\"5XXs\",\"period\":3600,\"stat\":\"Sum\",\"yAxis\":\"right\"}]],\"yAxis\":{\"left\":{\"min\":0},\"right\":{\"min\":0}}}},{\"type\":\"metric\",\"width\":12,\"height\":6,\"x\":12,\"y\":3,\"properties\":{\"view\":\"timeSeries\",\"title\":\"Response Time\",\"region\":\"${region}\",\"metrics\":[[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"${restApiName}\",{\"label\":\"Minimum\",\"period\":3600,\"stat\":\"Minimum\"}],[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"${restApiName}\",{\"label\":\"p95\",\"period\":3600,\"stat\":\"p95\"}],[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"${restApiName}\",{\"label\":\"Maximum\",\"period\":3600,\"stat\":\"Maximum\"}]],\"yAxis\":{\"left\":{\"min\":0},\"right\":{\"min\":0}}}},{\"type\":\"log\",\"width\":24,\"height\":6,\"x\":0,\"y\":9,\"properties\":{\"view\":\"table\",\"title\":\"Errors\",\"region\":\"${region}\",\"query\":\"SOURCE [${logGroupNames}] | fields fromMillis(@timestamp) as Date, statusCode as Status, concat(subDomain, \\\".\\\", boundedContext, \\\".\\\", functionName) as Function, coalesce(message, @message) as Message, error.message as Detail, httpRequestId as RequestId\\n| filter statusCode >= 500 or @message like \\\"WafFiltered\\\"\"}}]}`
      }
    }
  }
}