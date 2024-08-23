// manifestService.ts
import { Config, DefaultConfig, EnvironmentResult, Manifest, Slack } from '../interfaces/manifests'
import { EnvironmentService } from './environmentService'
import { ensureSemanticVersionPrefix } from '../functions'
import { SlackService } from './slackService'

/**
 * Represents a service for getting a manifest.
 */
export class ManifestService {
  constructor(private config: Config,
              private environmentService: EnvironmentService,
              private slackService: SlackService) {
  }

  /**
   * Returns the manifest for a given environment, version, and branch.
   *
   * @param {string} environment - The environment name.
   * @param {string} version - The version number.
   * @param {string} branch - The branch name.
   * @returns {Manifest | null} - The manifest object or null if environment data is not found.
   */
  getManifest(
    environment: string,
    version: string,
    branch: string
  ): {
    app_of_apps: string;
    app_of_apps_service_name: string;
    app_repo: string;
    app_version: string;
    approval_for_promotion: boolean;
    aws_account_id: number;
    aws_region: string;
    branch: string;
    chart_version: string;
    cluster: string;
    description: string;
    dockerfile: string;
    ecr_repository_name: string;
    enable_tests: boolean;
    enabled: boolean;
    environment: string;
    helm_chart_repo: string;
    helm_chart_service_name: string;
    is_mono_repo: boolean;
    name: string;
    next_environment: string;
    service: string;
    slack: Slack | null;
    with_gate: boolean
  } | null {
    const versionWithPrefix: string = ensureSemanticVersionPrefix(version)
    const environmentResult: EnvironmentResult | null = this.environmentService.getEnvironmentData(environment)
    const slackResult: Slack | null = this.slackService.getSlackConfigurationByEnvironment(environment)

    if (!environmentResult && !slackResult) return null

    return {
      ...this.getDefaultConfig(),
      ...environmentResult,
      app_version: `${versionWithPrefix}${this.config.is_mono_repo ? `-${this.config.helm_chart_service_name}` : ''}`,
      branch,
      chart_version: `${versionWithPrefix}${this.config.is_mono_repo ? `-${this.config.helm_chart_service_name}` : ''}-helm-charts`,
      slack: slackResult
    } as unknown as Manifest
  }

  /**
   * Returns the default configuration object.
   *
   * @private
   * @returns {DefaultConfig} The default configuration object.
   */
  private getDefaultConfig(): DefaultConfig {
    const {
      app_of_apps,
      app_of_apps_service_name,
      app_repo,
      dockerfile,
      ecr_repository_name,
      enable_tests,
      helm_chart_repo,
      helm_chart_service_name,
      is_mono_repo,
      name,
      service
    } = this.config
    return {
      app_of_apps,
      app_of_apps_service_name,
      app_repo,
      dockerfile,
      ecr_repository_name,
      enable_tests,
      helm_chart_repo,
      helm_chart_service_name,
      is_mono_repo,
      name,
      service
    } as DefaultConfig
  }
}
