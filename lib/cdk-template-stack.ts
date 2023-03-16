import { Stack, StackProps } from 'aws-cdk-lib';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';

export class CdkTemplateStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaRole = new iam.Role(this, 'lambda-iam-role', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        description: 'Role to grant permissions to the lamda function',
        roleName: 'HitCounterRole'
    });

    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
      code: lambda.Code.fromAsset("lambda"),  // code loaded from "lambda" directory
      handler: 'hello.handler'                // file is "hello", function is "handler"
    });

    const hitCounter = new HitCounter(this, 'HitCounterStack', {
      tableName: 'hitcounter',
      downstream: hello,
      lambdaRole: lambdaRole
    });

    const lamdaEndpoint = new apigw.LambdaRestApi(this, 'HelloHandlerGateway', {
      handler: hitCounter.handler
    });

    // -=-=-=-=-=-=-=-=-
    // const queue = new sqs.Queue(this, 'CdkTemplateQueue', {
    //   visibilityTimeout: Duration.seconds(300),
    //   queueName: "CdkTemplateQueue"
    // });

    // const topic = new sns.Topic(this, 'CdkTemplateTopic', {
    //   topicName: "CdkTemplateTopic"
    // });

    // topic.addSubscription(new subs.SqsSubscription(queue));
  }
}
