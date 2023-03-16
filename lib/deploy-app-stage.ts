import { CdkTemplateStack } from "./cdk-template-stack";
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class DeployAppPipelineStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        new CdkTemplateStack(this, 'WebService');
    }
}