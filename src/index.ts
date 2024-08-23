// index.ts
import * as core from '@actions/core'
import { context } from '@actions/github'
import { Octokit } from '@octokit/rest'

import {
  downloadManifestFileContent,
  ensureSemanticVersionPrefix,
  handleError,
  splitSemanticVersion
} from './functions'
import { EnvironmentService } from './services/environmentService'
import { Inputs, Outputs } from './interfaces/actions'
import { ManifestService } from './services/manifestService'
import { Manifest } from './interfaces/manifests'
import { SlackService } from './services/slackService'

/**
 * Runs the method to get the deployment repository variable using the Octokit client authenticated with the given inputs.
 * @param {Inputs} inputs - The inputs required to authenticate and fetch the deployment repository variable.
 * @return {Promise<Outputs>} - A promise that resolves with the output values after retrieving the deployment repository variable.
 */
export async function run(inputs: Inputs): Promise<Outputs | undefined> {
  try {
    core.info(`💬 Setting Authentication`)
    const octokit = new Octokit({ auth: inputs.token })
    const manifestContent = await downloadManifestFileContent(octokit, inputs)
    if (manifestContent !== undefined) {
      core.debug(`Manifest Content: ${JSON.stringify(manifestContent, null, 2)}`)

      const environmentService = new EnvironmentService(manifestContent)
      const slackService = new SlackService(manifestContent)
      const manifestService = new ManifestService(manifestContent, environmentService, slackService)
      const manifestResult = manifestService.getManifest(inputs.environment, inputs.version, inputs.ref)
      const sem_ver = ensureSemanticVersionPrefix(inputs.version)
      const [major, minor, patch] = splitSemanticVersion(sem_ver)
      const { gitops_file, owner, repo } = inputs
      const {
        app_of_apps,
        app_of_apps_service_name,
        app_repo,
        app_version,
        approval_for_promotion,
        aws_account_id,
        aws_region,
        branch,
        chart_version,
        cluster,
        description,
        dockerfile,
        ecr_repository_name,
        enable_tests,
        enabled,
        environment,
        helm_chart_repo,
        helm_chart_service_name,
        is_mono_repo,
        name,
        next_environment,
        service,
        slack,
        with_gate
      } = manifestResult as unknown as Manifest

      return {
        app_of_apps,
        app_of_apps_service_name,
        app_repo,
        app_version,
        approval_for_promotion,
        aws_account_id,
        aws_region,
        branch,
        chart_version,
        cluster,
        description,
        dockerfile,
        ecr_repository_name,
        enable_tests,
        enabled,
        environment,
        gitops_file,
        helm_chart_repo,
        helm_chart_service_name,
        is_mono_repo,
        major,
        minor,
        name,
        next_environment,
        owner,
        patch,
        repo,
        sem_ver,
        service,
        slack,
        with_gate,
      } as unknown as Outputs
    }
  } catch (error) {
    const message = `Error when try to retrieved the gitops manifest file ${inputs.gitops_file}.`
    if (core.isDebug()) {
      core.debug(`Inputs: ${JSON.stringify(inputs)}`)
    }
    handleError(error, message)
  }
}

/**
 * Runs the index functionality of the program.
 *
 * @return {Promise<void>} A Promise that resolves once the index functionality is completed.
 */
async function main(): Promise<void> {
  try {
    core.info(`💬 Starting CICD Manifest Action`)
    const inputs = {
      environment: core.getInput('environment', { required: false }) || 'dev',
      gitops_file: core.getInput('gitops_file', { required: true }),
      owner: core.getInput('owner', { required: false }) || context.repo.owner,
      prefix: core.getInput('prefix', { required: false }) || '',
      ref: core.getInput('ref', { required: true }),
      repo: core.getInput('repo', { required: false }) || context.repo.repo,
      token: core.getInput('token', { required: false }) || process.env.GITHUB_TOKEN,
      version: core.getInput('version', { required: true }),
    } as Inputs

    const outputs: Outputs | undefined = await run(inputs)

    if (outputs !== undefined) {
      let outputCounter: number = 0
      core.info('💬 Generating Outputs Dynamically...')
      core.debug(`💬  Outputs => ${JSON.stringify(outputs)}`)
      Object.entries(outputs).forEach(([key, value]) => {
        if (value !== undefined) {
          core.info(`⚙   ${key} => ${value}`)
          core.setOutput(`${inputs.prefix === '' ? key : `${inputs.prefix}_${key}`}`, value)
          outputCounter++
        }
      })
      core.info(`🏁 CICD Manifest Action completed successfully with ${outputCounter} outputs`)
    }
  } catch (error) {
    handleError(error)
  }
}

if (!process.env.JEST_WORKER_ID) {
  main()
    .then(() => {
    })
    .catch((e: Error) => {
      core.debug('Actions ends error.')
      core.setFailed(e)
    })
    .finally(() => {
    })
}
