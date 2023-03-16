import { Template, Capture } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { HitCounter } from '../lib/hitcounter';

test('DynamoDB Table Created With Encryption', () => {
    const stack = new cdk.Stack();
    // WHEN
    let testRole = new iam.Role(stack, 'TestIAMRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        description: 'Role to grant permissions to the lamda function',
        roleName: 'HitCounterRole'
    });

    let testLamda = new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hello.handler',
        code: lambda.Code.fromAsset('lambda')
    });
    
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: testLamda,
        tableName: 'testtable',
        lambdaRole: testRole
    });

    // Then
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::DynamoDB::Table", {
        SSESpecification: {
            SSEEnabled: true
        }
    });
});

test('read capacity can be configured', () => {
    const stack = new cdk.Stack();

    expect(() => {
        let testRole = new iam.Role(stack, 'TestIAMRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Role to grant permissions to the lamda function',
            roleName: 'HitCounterRole'
        });
    
        let testLamda = new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hello.handler',
            code: lambda.Code.fromAsset('lambda')
        });
        
        new HitCounter(stack, 'MyTestConstruct', {
            downstream: testLamda,
            tableName: 'testtable',
            lambdaRole: testRole,
            readCapacity: 3
        });
    }).toThrowError("readCapacity must be greated than 5 and less than 20");
});

test('Lambda Has Environment Variables', () => {
    const stack = new cdk.Stack();
    // WHEN
    let testRole = new iam.Role(stack, 'TestIAMRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        description: 'Role to grant permissions to the lamda function',
        roleName: 'HitCounterRole'
    });

    let testLamda = new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hello.handler',
        code: lambda.Code.fromAsset('lambda')
    });
    
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: testLamda,
        tableName: 'test-table',
        lambdaRole: testRole
    });

    // Then
    const template = Template.fromStack(stack);
    const envCapture = new Capture();
    template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: envCapture,
    });

    expect(envCapture.asObject()).toEqual(
        {
            Variables: {
                DOWNSTREAM_FUNCTION_NAME: {
                    Ref: "TestFunction22AD90FC"
                },
                HITS_TABLE_NAME: {
                    Ref: "MyTestConstructHitcounterDDB4A6E8F75"
                },
            }
        }
    )
});
