import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';

export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id);

        // This creates a new CodeCommit repository called 'CdkTemplateRepo'
        const repo = new codecommit.Repository(this, 'CdkTemplateRepo', {
            repositoryName: "CdkTemplateRepo"
        });
    }
}