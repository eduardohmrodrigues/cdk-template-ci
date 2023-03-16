import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface HitCounterProps {
    /** the function for which we want to count url hits **/
    downstream: lambda.IFunction;
    tableName?: string;
    lambdaRole: iam.Role;
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

        this.table = new dynamodb.Table(this, 'HitcounterDDB', {
            tableName: props.tableName,
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            readCapacity: props.readCapacity ?? 5
            // removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        this.table.grantReadWriteData(props.lambdaRole);

        this.handler = new lambda.Function(this, 'HitcounterHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hitcounter.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: this.table.tableName
            },
            role: props.lambdaRole,
        });

        props.downstream.grantInvoke(props.lambdaRole);
    }
}