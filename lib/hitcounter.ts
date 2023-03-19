import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import {Effect, PolicyStatement} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

export interface HitCounterProps {
    /** the function for which we want to count url hits **/
    downstream: lambda.IFunction;
    tableName?: string;
    readCapacity?: number;
}

export class HitCounter extends Construct {

    /** allows accessing the counter function */
    public readonly handler: lambda.Function;
    public readonly table: dynamodb.Table;

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
            throw new Error("readCapacity must be greated than 5 and less than 20");
        }

        super(scope, id);

        const lambdaRole = new iam.Role(this, 'lambda-iam-role', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Role to grant permissions to the lamda function',
            roleName: 'HitCounterRole'
        });

        lambdaRole.addToPolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    'logs:CreateLogGroup',
                    'logs:CreateLogStream',
                    'logs:PutLogEvents'
                ],
                resources: ['*'],
            })
        )

        this.table = new dynamodb.Table(this, 'HitcounterDDB', {
            tableName: props.tableName,
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            readCapacity: props.readCapacity ?? 5
            // removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        this.table.grantReadWriteData(lambdaRole);

        this.handler = new lambda.Function(this, 'HitcounterHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hello-dynamo.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: this.table.tableName
            },
            role: lambdaRole,
        });

        props.downstream.grantInvoke(lambdaRole);

        NagSuppressions.addResourceSuppressions(
            lambdaRole,
            [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'Suppress all AwsSolutions-IAM5 findings on IAM Role.',
                },
            ],
            true
        );
    }
}