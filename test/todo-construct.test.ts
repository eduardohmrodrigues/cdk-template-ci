import { Template, Capture } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { TodoConstruct } from '../lib/todo-construct';

test('VPC and Aurora DB Created', () => {
    const stack = new cdk.Stack();
    // WHEN
    new TodoConstruct(stack, 'MyTestConstruct', {});

    // Then
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::RDS::DBCluster", 1);
    template.resourceCountIs("AWS::EC2::VPC", 1);
    template.resourceCountIs('AWS::Lambda::Function', 1);
});

test('Lambda Has Environment Variables', () => {
    const stack = new cdk.Stack();
    // WHEN
    new TodoConstruct(stack, 'MyTestConstruct', {});

    // Then
    const template = Template.fromStack(stack);
    const envCapture = new Capture();
    template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: envCapture,
    });

    expect(envCapture.asObject()).toEqual(
        {
            Variables: {
                CLUSTER_ARN: {
                    "Fn::Join": [
                        "",
                        [
                            "arn:",
                            {
                                "Ref": "AWS::Partition",
                            },
                            ":rds:",
                            {
                                "Ref": "AWS::Region",
                            },
                                ":",
                            {
                                "Ref": "AWS::AccountId",
                            },
                                ":cluster:",
                            {
                                "Ref": "MyTestConstructAuroraTestClusterD2B812EC",
                            },
                        ],
                    ], 
                },
                SECRET_ARN: {
                    Ref: "MyTestConstructAuroraTestClusterSecretAttachment88A6B21E"
                },
                DB_NAME: "TestDB",
                AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
            }
        }
    )
});
