import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as CdkTemplate from '../lib/cdk-template-stack';

// test('SQS Queue and SNS Topic Created', () => {
//   const app = new cdk.App();
//   // WHEN
//   const stack = new CdkTemplate.CdkTemplateStack(app, 'MyTestStack');
//   // THEN

//   const template = Template.fromStack(stack);

//   template.hasResourceProperties('AWS::SQS::Queue', {
//     VisibilityTimeout: 300
//   });
//   template.resourceCountIs('AWS::SNS::Topic', 1);
// });

test('IamRole, Hello Handler, HitCounter Resources and API Gateway Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CdkTemplate.CdkTemplateStack(app, 'MyTestStack');
    // THEN
  
    const template = Template.fromStack(stack);
  
    template.resourceCountIs('AWS::IAM::Role', 3);
    template.resourceCountIs('AWS::Lambda::Function', 2);
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    template.resourceCountIs("AWS::DynamoDB::Table", 1);
  });
