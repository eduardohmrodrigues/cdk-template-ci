import { Template, Capture } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from '../lib/hitcounter';

test('DynamoDB Table Created With Encryption', () => {
    const stack = new cdk.Stack();
    // WHEN
    let testLamda = new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hello-aurora.handler',
        code: lambda.Code.fromAsset('lambda/todo-function')
    });
    
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: testLamda,
        tableName: 'testtable',
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
        let testLamda = new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hello-aurora.handler',
            code: lambda.Code.fromAsset('lambda/todo-function')
        });
        
        new HitCounter(stack, 'MyTestConstruct', {
            downstream: testLamda,
            tableName: 'testtable',
            readCapacity: 3
        });
    }).toThrowError("readCapacity must be greated than 5 and less than 20");
});

test('Lambda Has Environment Variables', () => {
    const stack = new cdk.Stack();
    // WHEN
    let testLamda = new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hello-aurora.handler',
        code: lambda.Code.fromAsset('lambda/todo-function')
    });
    
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: testLamda,
        tableName: 'test-table',
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
