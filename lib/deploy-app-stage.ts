import * as cdk from 'aws-cdk-lib';
import { CdkTemplateStack } from "./cdk-template-stack";
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class DeployAppPipelineStage extends Stage {
    public readonly hcEndpointUrl: cdk.CfnOutput;

    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const service = new CdkTemplateStack(this, 'WebService');
        this.hcEndpointUrl = service.hcEndpointUrl;
    }
}