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
                            }
                        },
                        barLogGroup: {
                            Type: "AWS::Logs::LogGroup",
                            Properties: {
                                LogGroupName: "/aws/lambda/service-dev-bar",
                            }
                        },
                        ApiGatewayLogGroup: {
                            Type: "AWS::Logs::LogGroup",
                            Properties: {
                                LogGroupName: "/aws/api-gateway/service-dev",
                            }
                        }
                    }
                }
            },
            functions: {
                foo: {
                    events: [
                        {
                            http: {
                                method: "get",
                                path: "foo"
                            }
                        }
                    ]
                },
                bar: {
                    events: [
                        {
                            http: {
                                method: "post",
                                path: "bar"
                            }
                        }
                    ]
                }
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
                "LambdaDailyDashboard": {
                    "Type": "AWS::CloudWatch::Dashboard",
                    "Properties": {
                        "DashboardName": "service-daily",
                        "DashboardBody": "{\"start\":\"-PT24H\",\"periodOverride\":\"inherit\",\"widgets\":[{\"type\":\"metric\",\"width\":6,\"height\":3,\"x\":0,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Requests\",\"region\":\"us-east-1\",\"metrics\":[[\"AWS/ApiGateway\",\"Count\",\"ApiName\",\"rest-api-name\",{\"label\":\" \",\"period\":86400,\"stat\":\"Sum\"}]]}},{\"type\":\"metric\",\"width\":6,\"height\":3,\"x\":6,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Errors\",\"region\":\"us-east-1\",\"metrics\":[[{\"label\":\" \",\"color\":\"#E42A2A\",\"expression\":\"SUM([serverErrors, clientErrors])\",\"period\":86400}],[\"AWS/ApiGateway\",\"5XXError\",\"ApiName\",\"rest-api-name\",{\"period\":86400,\"stat\":\"Sum\",\"visible\":false,\"id\":\"serverErrors\"}],[\"AWS/ApiGateway\",\"4XXError\",\"ApiName\",\"rest-api-name\",{\"period\":86400,\"stat\":\"Sum\",\"visible\":false,\"id\":\"clientErrors\"}]]}},{\"type\":\"metric\",\"width\":12,\"height\":3,\"x\":12,\"y\":0,\"properties\":{\"view\":\"singleValue\",\"title\":\"Response Time (p95)\",\"region\":\"us-east-1\",\"metrics\":[[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"rest-api-name\",{\"label\":\" \",\"period\":86400,\"stat\":\"p95\"}]]}},{\"type\":\"metric\",\"width\":12,\"height\":6,\"x\":0,\"y\":3,\"properties\":{\"view\":\"timeSeries\",\"title\":\"Requests / Errors\",\"region\":\"us-east-1\",\"period\":3600,\"stat\":\"Sum\",\"metrics\":[[\"AWS/ApiGateway\",\"Count\",\"ApiName\",\"rest-api-name\",\"Resource\",\"/foo\",\"Stage\",\"dev\",\"Method\",\"get\"],[\"...\",\"/bar\", \".\", \".\", \".\", \"post\"],[\".\",\"5XXError\",\".\",\".\",\".\",\"/foo\",\".\",\".\",\".\",\"get\",{ \"yAxis\": \"right\" }],[\"...\",\"/bar\", \".\", \".\", \".\", \"post\",{ \"yAxis\": \"right\" }]],\"yAxis\":{\"left\":{\"min\":0},\"right\":{\"min\":0}}}},{\"type\":\"metric\",\"width\":12,\"height\":6,\"x\":12,\"y\":3,\"properties\":{\"view\":\"timeSeries\",\"title\":\"Response Times\",\"region\":\"us-east-1\",\"period\":3600,\"stat\":\"p95\",\"metrics\":[[\"AWS/ApiGateway\",\"Latency\",\"ApiName\",\"rest-api-name\",\"Resource\",\"/foo\",\"Stage\",\"dev\",\"Method\",\"get\"],[\"...\",\"/bar\", \".\", \".\", \".\", \"post\"]],\"yAxis\":{\"left\":{\"min\":0},\"right\":{\"min\":0}}}},{\"type\":\"log\",\"width\":24,\"height\":6,\"x\":0,\"y\":9,\"properties\":{\"view\":\"table\",\"title\":\"Errors\",\"region\":\"us-east-1\",\"query\":\"SOURCE '/aws/lambda/service-dev-foo' | SOURCE '/aws/lambda/service-dev-bar' | SOURCE '/aws/api-gateway/service-dev' | fields fromMillis(@timestamp) as Date, statusCode as Status, concat(subDomain, \\\".\\\", boundedContext, \\\".\\\", functionName) as Function, coalesce(message, @message) as Message, error.message as Detail, httpRequestId as RequestId\\n| filter statusCode >= 500 or @message like \\\"WafFiltered\\\"\"}}]}"
                    }
                },
                "ApiGatewayRestApi": {
                    "Type": "AWS::ApiGateway::RestApi",
                    "Properties": {
                        "Name": "rest-api-name"
                    }
                },
                "fooLogGroup": {
                    "Type": "AWS::Logs::LogGroup",
                    "Properties": {
                        "LogGroupName": "/aws/lambda/service-dev-foo"
                    }
                },
                "barLogGroup": {
                    "Type": "AWS::Logs::LogGroup",
                    "Properties": {
                        "LogGroupName": "/aws/lambda/service-dev-bar"
                    }
                },
                "ApiGatewayLogGroup": {
                    "Type": "AWS::Logs::LogGroup",
                    "Properties": {
                        "LogGroupName": "/aws/api-gateway/service-dev"
                    }
                }
            }
        })
    })
})