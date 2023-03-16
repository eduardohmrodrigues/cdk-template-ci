#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
// import { CdkTemplateStack } from '../lib/cdk-template-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
// new CdkTemplateStack(app, 'CdkTemplateStack');
new PipelineStack(app, 'PipelineStack');

