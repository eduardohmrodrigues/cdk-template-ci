import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { DeployAppPipelineStage } from './deploy-app-stage';

export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id);

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
        const pipeline = new CodePipeline(this, 'TemplatePipeline', {
            pipelineName: 'TemplatePipeline',
            synth: new CodeBuildStep('SynthStep', {
                input: CodePipelineSource.connection(
                    'eduardohmrodrigues/cdk-template-ci', 
                    'main', {
                        connectionArn: 'arn:aws:codestar-connections:us-east-1:537580096116:connection/97c3920e-2897-42f7-b041-e75c99509884'
                    }),
                installCommands: [
                    'sudo npm install -g npm@9.6.2',
                    'npm install -g aws-cdk'
                ],
                commands: [
                    'npm ci',
                    'npm run build',
                    'npm run test',
                    'npx cdk synth'
                ]
            })
        });

        const deploy = new DeployAppPipelineStage(this, 'DeployApp');
        const deployStage = pipeline.addStage(deploy);

        deployStage.addPost(
            new CodeBuildStep('TestAPIGatewayEndpoint', {
                projectName: 'TestAPIGatewayEndpoint',
                envFromCfnOutputs: {
                    ENDPOINT_URL: deploy.hcEndpointUrl
                },
                commands: [
                    'curl -Ssf $ENDPOINT_URL',
                    'curl -Ssf $ENDPOINT_URL/hello'
                ]
            })
        );
    }
}