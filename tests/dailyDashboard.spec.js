const Plugin = require("../src/main")

describe("given a lambda", () => {
    const serverless = {
        cli: {
            log: (message) => console.log(message)
        },
        service: {
            service: "service",
            provider: {
                region: "us-east-1",
                compiledCloudFormationTemplate: {
                    Resources: {
                        ApiGatewayRestApi: {
                            Type: "AWS::ApiGateway::RestApi",
                            Properties: {
                                Name: "rest-api-name"
                            }
                        },
                        fooLogGroup: {
                            Type: "AWS::Logs::LogGroup",
                            Properties: {
                                LogGroupName: "/aws/lambda/service-dev-foo",
                                RetentionInDays: 400
                            }
                        },
                        ApiGatewayLogGroup: {
                            Type: "AWS::Logs::LogGroup",
                            Properties: {
                                LogGroupName: "/aws/api-gateway/service-dev",
                                RetentionInDays: 400
                            }
                        }
                    }
                }
            },
            functions: {
                foo: {}
            }
        }
    }

    const options = {
        stage: "dev"
    }

    let plugin;

    beforeAll(() => {
        plugin = new Plugin(serverless, options)
    })

    test("it adds dashboards", () => {
        plugin.addDashboards()
        expect(serverless.service.provider.compiledCloudFormationTemplate).toEqual({
            "Resources": {
                "ApiGatewayLogGroup": {
                    "Type": "AWS::Logs::LogGroup",
                    "Properties": {
                        "LogGroupName": "/aws/api-gateway/service-dev",
                        "RetentionInDays": 400,
                    }
                },
                "ApiGatewayRestApi": {
                    "Type": "AWS::ApiGateway::RestApi",
                    "Properties": {
                        "Name": "rest-api-name",
                    }
                },
                "fooLogGroup": {
                    "Type": "AWS::Logs::LogGroup",
                    "Properties": {
                        "LogGroupName": "/aws/lambda/service-dev-foo",
                        "RetentionInDays": 400,
                    }
                },
                "LambdaDailyDashboard": {
                    "Type": "AWS::CloudWatch::Dashboard",
                    "Properties": {
                        "DashboardName": "Daily",
                        "DashboardBody": "{\"start\":\"-PT24H\",\"periodOverride\":\"inherit\",\"widgets\":[{\"type\":\"metric\",\"width\":6,\"height\":3,\"x\":0,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Requests\",\"region\":\"us-east-1\",\"metrics\":[[\"AWS/ApiGateway\",\"Count\",\"ApiName\",\"rest-api-name\",{\"label\":\" \",\"period\":86400,\"stat\":\"Sum\"}]]}},{\"type\":\"metric\",\"width\":6,\"height\":3,\"x\":6,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Errors\",\"region\":\"us-east-1\",\"metrics\":[[{\"label\":\" \",\"color\":\"#E42A2A\",\"expression\":\"SUM([serverErrors, clientErrors])\",\"period\":86400}],[\"AWS/ApiGateway\",\"5XXError\",\"ApiName\",\"rest-api-name\",{\"period\":86400,\"stat\":\"Sum\",\"visible\":false,\"id\":\"serverErrors\"}],[\"AWS/ApiGateway\",\"4XXError\",\"ApiName\",\"rest-api-name\",{\"period\":86400,\"stat\":\"Sum\",\"visible\":false,\"id\":\"clientErrors\"}]]}},{\"type\":\"metric\",\"width\":12,\"height\":3,\"x\":12,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Response Time (p95)\",\"region\":\"us-east-1\",\"metrics\":[[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"rest-api-name\",{\"label\":\" \",\"period\":86400,\"stat\":\"p95\"}]]}},{\"type\":\"metric\",\"width\":12,\"height\":6,\"x\":0,\"y\":3,\"properties\":{\"view\":\"timeSeries\",\"title\":\"Requests / Errors\",\"region\":\"us-east-1\",\"metrics\":[[\"AWS/ApiGateway\",\"Count\",\"ApiName\",\"rest-api-name\",{\"color\":\"#1f77b4\",\"label\":\"Requests\",\"period\":3600,\"stat\":\"Sum\"}],[\"AWS/ApiGateway\",\"4XXError\",\"ApiName\",\"rest-api-name\",{\"color\":\"#ff7f0e\",\"label\":\"4XXs\",\"period\":3600,\"stat\":\"Sum\",\"yAxis\":\"right\"}],[\"AWS/ApiGateway\",\"5XXError\",\"ApiName\",\"rest-api-name\",{\"color\":\"#d13212\",\"label\":\"5XXs\",\"period\":3600,\"stat\":\"Sum\",\"yAxis\":\"right\"}]],\"yAxis\":{\"left\":{\"min\":0},\"right\":{\"min\":0}}}},{\"type\":\"metric\",\"width\":12,\"height\":6,\"x\":12,\"y\":3,\"properties\":{\"view\":\"timeSeries\",\"title\":\"Response Time\",\"region\":\"us-east-1\",\"metrics\":[[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"rest-api-name\",{\"label\":\"Minimum\",\"period\":3600,\"stat\":\"Minimum\"}],[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"rest-api-name\",{\"label\":\"p95\",\"period\":3600,\"stat\":\"p95\"}],[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"rest-api-name\",{\"label\":\"Maximum\",\"period\":3600,\"stat\":\"Maximum\"}]],\"yAxis\":{\"left\":{\"min\":0},\"right\":{\"min\":0}}}},{\"type\":\"log\",\"width\":24,\"height\":6,\"x\":0,\"y\":9,\"properties\":{\"view\":\"table\",\"title\":\"Errors\",\"region\":\"us-east-1\",\"query\":\"SOURCE [/aws/lambda/service-dev-foo,/aws/api-gateway/service-dev] | fields fromMillis(@timestamp) as Date, statusCode as Status, concat(subDomain, \\\".\\\", boundedContext, \\\".\\\", functionName) as Function, coalesce(message, @message) as Message, error.message as Detail, httpRequestId as RequestId\\n| filter statusCode >= 500 or @message like \\\"WafFiltered\\\"\"}}]}"
                    }
                },
            }
        })
    })
})