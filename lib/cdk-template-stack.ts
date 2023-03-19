import * as cdk from 'aws-cdk-lib';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';
import { TodoConstruct } from './todo-construct';

export class CdkTemplateStack extends Stack {
  public readonly hcEndpointUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const todo = new TodoConstruct(this, 'TodoConstruct', {});

    // Sample construct with a lambda that accesses a DDB
    const hitCounter = new HitCounter(this, 'HitCounterStack', {
      tableName: 'hitcounter',
      downstream: todo.handler,
    });

    const lamdaEndpoint = new apigw.LambdaRestApi(this, 'HelloHandlerGateway', {
      handler: hitCounter.handler
    });

    this.hcEndpointUrl = new cdk.CfnOutput(this, 'GatewayUrl', {
      value: lamdaEndpoint.url
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
