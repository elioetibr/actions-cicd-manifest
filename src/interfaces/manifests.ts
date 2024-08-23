/**
 * Represents a version number with major, minor, and patch components.
 * @interface Version
 * @property {string} major - The major version number.
 * @property {string} minor - The minor version number.
 * @property {string} patch - The patch version number.
 * @property {string} sem_ver - The semantic version string (in the format `major.minor.patch`).
 */
export interface Version {
  major: string;
  minor: string;
  patch: string;
  sem_ver: string;
}

/**
 * DefaultConfig is an interface representing the default configuration values for an application.
 *
 * @interface
 * @property {string} app_of_apps - The name of the parent application.
 * @property {string} app_of_apps_service_name - The name of the service within the parent application.
 * @property {string} app_repo - The repository name of the application.
 * @property {string} dockerfile - The Dockerfile used to build the application.
 * @property {string} ecr_repository_name - The name of the repository in Elastic Container Registry (ECR) for the application.
 * @property {boolean} enable_tests - A flag indicating whether tests should be enabled during the build process.
 * @property {string} helm_chart_repo - The repository location of the Helm chart for the application.
 * @property {string} helm_chart_service_name - The name of the service within the Helm chart.
 * @property {boolean} is_mono_repo - A flag indicating whether the application is part of a monorepo.
 * @property {string} name - The name of the application.
 * @property {string} service - The name of the service being deployed.
 */
export interface DefaultConfig {
  app_of_apps: string;
  app_of_apps_service_name: string;
  app_repo: string;
  dockerfile: string;
  ecr_repository_name: string;
  enable_tests: boolean;
  helm_chart_repo: string;
  helm_chart_service_name: string;
  is_mono_repo: boolean;
  name: string;
  service: string;
}

/**
 * Represents a promotional phase for an environment in a specific AWS account.
 *
 * @interface EnvironmentPromotionPhase
 * @property {number} aws_account_id - The AWS account ID.
 * @property {string} environment - The name of the environment.
 * @property {string} description - A description of the promotional phase.
 * @property {boolean} enabled - Indicates whether the promotional phase is enabled or not.
 */
export interface EnvironmentPromotionPhase {
  aws_account_id: number;
  environment: string;
  description: string;
  enabled: boolean;
}

/** Represents an environment configuration.
 *
 * @interface Environment
 * @property {string} cluster - The name of the cluster.
 * @property {boolean} approval_for_promotion - Indicates if the environment requires approval for promotion.
 * @property {boolean} enabled - Indicates if the environment is enabled.
 * @property {string} environment - The name of the environment.
 * @property {string} next_environment - The name of the next environment.
 * @property {string} aws_region - The AWS region for the environment.
 * @property {boolean} with_gate - Indicates if the environment has a gate.
 */
export interface Environment {
  cluster: string;
  approval_for_promotion: boolean;
  enabled: boolean;
  environment: string;
  next_environment: string;
  aws_region: string;
  with_gate: boolean;
}

/**
 * Represents an environment configuration with an additional AWS region.
 *
 * @interface EnvironmentWithAdditionalRegion
 * @extends Environment
 */
export interface EnvironmentWithAdditionalRegion extends Environment {
  additional_aws_regions: string[];
}

/**
 * Represents the base configuration for a Slack integration.
 */
export interface SlackBase {
  url: string;
}

/**
 * The `SlackGitOps` interface represents the configuration for integrating Slack with GitOps.
 * It extends the `SlackBase` interface.
 *
 * @interface SlackGitOps
 * @extends SlackBase
 *
 * @property {SlackChannels} channels - The channels to be used for GitOps integration.
 */
export interface SlackGitOps extends SlackBase {
  channels: SlackChannels;
}

/**
 * SlackChannels is an interface that represents different Slack channels
 * used for Continuous Integration and Continuous Deployment (CI/CD) configurations.
 * It specifies the different channels available for different environments such as
 * default, development (dev), demonstration (demo), and production (prod).
 */
export interface SlackChannels {
  default: SlackCiCdConfiguration;
  dev: SlackCiCdConfiguration;
  demo: SlackCiCdConfiguration;
  prod: SlackCiCdConfiguration;
}

/**
 * Represents the Slack configuration for continuous integration and continuous deployment (CI/CD) channels.
 *
 * @interface
 */
export interface SlackCiCdConfiguration {
  cd: SlackChannelConfiguration[];
  ci: SlackChannelConfiguration[];
}

/**
 * Represents the configuration of a Slack channel.
 *
 * @interface SlackChannelConfiguration
 * @property {string} id - The ID of the channel.
 * @property {string} name - The name of the channel.
 */
export interface SlackChannelConfiguration {
  id: string;
  name: string;
}

/**
 * Interface representing a Slack instance.
 *
 * @interface
 * @extends {SlackBase}
 */
export interface Slack extends SlackBase {
  channels: SlackCiCdConfiguration[];
}

/**
 * Represents a configuration object.
 * @interface
 * @extends DefaultConfig
 */
export interface Config extends DefaultConfig {
  environment_promotion_phases: Record<string, EnvironmentPromotionPhase>;
  environments: Record<string, EnvironmentWithAdditionalRegion>;
  slack: SlackGitOps;
}

/**
 * Represents the result of an environment with promotion phase.
 *
 * @interface
 * @extends Environment
 * @extends EnvironmentPromotionPhase
 */
export interface EnvironmentResult extends Environment, EnvironmentPromotionPhase {
}

/**
 * Represents a manifest configuration for an application.
 *
 * @interface
 * @extends DefaultConfig
 * @extends EnvironmentPromotionPhase
 * @extends Environment
 * @extends Slack
 */
export interface Manifest extends DefaultConfig, EnvironmentPromotionPhase, Environment {
  app_version: string;
  chart_version: string;
  branch: string;
  slack: Slack;
}
