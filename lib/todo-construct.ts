import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { AuroraPostgresEngineVersion, DatabaseClusterEngine, ParameterGroup, ServerlessCluster } from 'aws-cdk-lib/aws-rds';
import { Duration, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class TodoConstruct extends Construct {

    /** allows accessing the counter function */
    public readonly handler: lambda.Function;
    public readonly auroraCluster: ServerlessCluster;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id);
        
        const vpc = new Vpc(this, 'AuroraVPC');

        const dbName = 'TestDB';
        const postgresVersion = AuroraPostgresEngineVersion.VER_10_16.auroraPostgresMajorVersion.split(".")[0];
        const cluster = new ServerlessCluster(this, 'AuroraTestCluster', {
            engine: DatabaseClusterEngine.AURORA_POSTGRESQL,
            parameterGroup: ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', `default.aurora-postgresql${postgresVersion}`),
            defaultDatabaseName: dbName,
            vpc,
            scaling: { autoPause: Duration.seconds(0) }
        });
        this.auroraCluster = cluster; 

        const hello = new lambda.Function(this, 'HelloHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
            code: lambda.Code.fromAsset("lambda/todo-function"),  // code loaded from "lambda/todo-function" directory
            handler: 'hello-aurora.handler',                // file is "hello", function is "handler"
            environment: {
                CLUSTER_ARN: cluster.clusterArn,
                SECRET_ARN: cluster.secret?.secretArn || '',
                DB_NAME: dbName,
                AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
            }
        });
        this.handler = hello;

        cluster.grantDataApiAccess(hello);
    }
}