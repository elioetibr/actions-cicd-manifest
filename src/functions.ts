// functions.ts
import * as yaml from 'js-yaml'
import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'

import { Inputs } from './interfaces/actions'
import { Config } from './interfaces/manifests'

/**
 * Returns a regular expression pattern for matching a version number within a string.
 *
 * @return {RegExp} The regular expression pattern for matching a version number.
 */
export function versionPattern(): RegExp {
  return /(.*)((\d+)\.(\d+)\.(\d+))(.*)/gm
}

/**
 * Splits a semantic version into an array of its components.
 *
 * @param {string} version - The semantic version to split.
 * @return {string[]} - An array containing the components of the semantic version.
 */
export function splitSemanticVersion(version: string): string[] {
  return ensureSemanticVersionPrefix(version)
    .replace(versionPattern(), '$2')
    .split('.')
}

/**
 * Validates whether a version string is a semantic version.
 *
 * @param {string} version - The version string.
 * @return {boolean} - True if valid, false otherwise.
 */
export function validateSemanticVersion(version: string): boolean {
  const matcher = ensureSemanticVersionPrefix(version).match(versionPattern())
  return matcher !== null && matcher.length > 0
}

/**
 * Ensures the version string has a "v" prefix.
 *
 * @param {string} version - The version string.
 * @return {string} - The version string with "v" prefix.
 */
export function ensureSemanticVersionPrefix(version: string): string {
  return version.startsWith('v') || version === '' ? version : 'v' + version
}

/**
 * Parses YAML content and returns a configuration object.
 *
 * @param {string} content - The YAML content.
 * @return {Config} - The parsed configuration.
 */
export function parseYaml(content: string): Config {
  return yaml.load(content) as Config
}

/**
 * Retrieves the content of a manifest file from a repository.
 *
 * @param {Octokit} octokit - Octokit client instance.
 * @param {Inputs} inputs - Action inputs.
 * @returns {Promise<Config>} - Parsed configuration object.
 */
export async function downloadManifestFileContent(octokit: Octokit, inputs: Inputs): Promise<Config | undefined> {
  try {
    core.info(`💬 Retrieving the file "${inputs.gitops_file}" from "${inputs.owner}/${inputs.repo}" on the "${inputs.ref}" branch`)
    const response = await octokit.rest.repos.getContent({
      owner: inputs.owner,
      repo: inputs.repo,
      path: inputs.gitops_file.replace('./', '').trim(),
      ref: inputs.ref
    })

    core.info(`✅  Successfully retrieved the file "${inputs.gitops_file}" from the repository "${inputs.owner}/${inputs.repo}" on the "${inputs.ref}" branch`)
    let content = ''
    if (!Array.isArray(response.data) && response.data.type === 'file') {
      content = Buffer.from(response.data.content, 'base64').toString()
    }

    return parseYaml(content)
  } catch (error) {
    const message = `Error when try to retrieved file ${inputs.gitops_file} from "${inputs.owner}/${inputs.repo}" on branch: ${inputs.ref}. Please check if it exists.`
    handleError(error, message)
  }
}

/**
 * Extracts error message from an unknown error object.
 *
 * @param {unknown} error - The error object.
 * @return {string} - Extracted error message.
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Handles and logs an error.
 *
 * @param {unknown} error - The error to handle.
 * @param additionalErrorMessage
 */
export function handleError(error: unknown, additionalErrorMessage: string = ''): void {
  const message: string = getErrorMessage(error)
  let finalMessage: string
  if (additionalErrorMessage !== '') {
    finalMessage = additionalErrorMessage + ' => ' + message
  } else {
    finalMessage = message
  }
  throw finalMessage
}
