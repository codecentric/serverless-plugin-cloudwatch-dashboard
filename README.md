Serverless Lambda Daily CloudWatch Dashboard
=============================
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.png)](https://raw.githubusercontent.com/joaorxfernandes/serverless-lambda-daily-cloudwatch-dashboard/master/LICENSE)

**Requirements:**
* Serverless *v1.12.x* or higher
* AWS provider

## Setup

### Installation

Install via npm in the root of your Serverless service:

```sh
npm install serverless-lambda-daily-cloudwatch-dashboard
```

Add the plugin to the `plugins` array of your Serverless service in `serverless.yml`:

```yml
plugins:
  - serverless-lambda-daily-cloudwatch-dashboard
```

## Errors metadata
```
{
  subDomain: "",
  boundedContext: "",
  functionName: "",

  message: "",
  error: {
    message: "",
  },

  statusCode: 500
}
```

## Contribute
Any contribution is more than welcome. 

* Clone the code
* Install the dependencies with `npm install`
* Create a feature branch `git checkout -b new_feature`
* Test `npm test`
* Create a pull request

## License

This software is released under the MIT license. See [the license file](LICENSE) for more details.