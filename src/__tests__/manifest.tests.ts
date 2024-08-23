// Test Configuration
import { Config, Slack } from '../interfaces/manifests'
import { ConfigManager } from '../managers/configManager'
import { EnvironmentService } from '../services/environmentService'
import { ManifestService } from '../services/manifestService'
import { SlackService } from '../services/slackService'

const testConfiguration: Config = {
  app_of_apps: 'app-of-apps',
  app_of_apps_service_name: 'roicalc',
  app_repo: 'dataanalysis',
  dockerfile: 'roicalc/Dockerfile',
  ecr_repository_name: 'roicalc',
  enable_tests: true,
  helm_chart_repo: 'dataanalysis',
  helm_chart_service_name: 'roicalc',
  is_mono_repo: true,
  name: 'roicalc',
  service: 'roicalc',
  environment_promotion_phases: {
    '01-dev': {
      aws_account_id: 885015629014,
      environment: 'dev',
      description: 'Development Workload',
      enabled: true
    },
    '02-demo': {
      aws_account_id: 134764736449,
      environment: 'demo',
      description: 'Demo/Stage Workload',
      enabled: false
    },
    '03-prod': {
      aws_account_id: 838106405942,
      environment: 'prod',
      description: 'Production Workload',
      enabled: false
    }
  },
  environments: {
    'dev': {
      cluster: 'dev-eks',
      approval_for_promotion: false,
      enabled: true,
      environment: 'dev',
      next_environment: 'demo',
      aws_region: 'us-east-2',
      additional_aws_regions: [],
      with_gate: false
    },
    'demo': {
      cluster: 'demo-eks',
      approval_for_promotion: false,
      enabled: true,
      environment: 'demo',
      next_environment: 'prod',
      aws_region: 'us-east-2',
      additional_aws_regions: [],
      with_gate: false
    },
    'prod': {
      cluster: 'prod-eks',
      approval_for_promotion: false,
      enabled: true,
      environment: 'prod',
      next_environment: '',
      aws_region: 'us-east-2',
      additional_aws_regions: [],
      with_gate: false
    }
  },
  slack: {
    url: 'https://projectinnocuous.slack.com',
    channels: {
      default: {
        cd: [
          {
            id: 'C071CKXB99T',
            name: '#deployment'
          }
        ],
        ci: [
          {
            id: 'C07G5R58JUT',
            name: '#ci'
          }
        ]
      },
      dev: {
        cd: [
          {
            id: 'C071CKXB99T',
            name: '#deployment'
          }
        ],
        ci: [
          {
            id: 'C07G5R58JUT',
            name: '#ci'
          }
        ]
      },
      demo: {
        cd: [
          {
            id: 'C071CKXB99T',
            name: '#deployment'
          }
        ],
        ci: [
          {
            id: 'C07G5R58JUT',
            name: '#ci'
          }
        ]
      },
      prod: {
        cd: [
          {
            id: 'C071CKXB99T',
            name: '#deployment'
          }
        ],
        ci: [
          {
            id: 'C07G5R58JUT',
            name: '#ci'
          }
        ]
      }
    }
  }
}

describe('ConfigManager', () => {
  let configManager: ConfigManager

  beforeEach(() => {
    configManager = new ConfigManager(testConfiguration)
  })

  it('should serialize the configuration correctly', () => {
    const serializedConfig: string = configManager.serialize()
    const expectedSerializedConfig: string = JSON.stringify(testConfiguration, null, 2)
    expect(serializedConfig).toBe(expectedSerializedConfig)
  })

  it('should deserialize a JSON string to a Config object correctly', () => {
    const serializedConfig: string = configManager.serialize()
    const deserializedConfig: Config = ConfigManager.deserialize(serializedConfig)
    expect(deserializedConfig).toEqual(testConfiguration)
  })

  it('should handle deserialization of a modified JSON string', () => {
    const modifiedJsonString: string = JSON.stringify({
      ...testConfiguration,
      app_of_apps: 'modified-app-of-apps'
    })

    const modifiedConfig: Config = ConfigManager.deserialize(modifiedJsonString)

    expect(modifiedConfig.app_of_apps).toBe('modified-app-of-apps')
    expect(modifiedConfig.app_repo).toBe(testConfiguration.app_repo)
  })

  it('should fail deserialization of invalid JSON', () => {
    const invalidJsonString = '{ invalid json }'
    expect(() => ConfigManager.deserialize(invalidJsonString)).toThrowError()
  })

  it('should result a Manifest', () => {
    const environmentService = new EnvironmentService(testConfiguration)
    const slackService = new SlackService(testConfiguration)
    const manifestService = new ManifestService(testConfiguration, environmentService, slackService)

    const inputEnvironment = 'dev'
    const version = 'v1.0.0'
    const branch = 'main'
    const manifest = manifestService.getManifest(inputEnvironment, version, branch)
    expect(manifest?.app_of_apps_service_name).toEqual('roicalc')
    expect(manifest?.environment).toEqual(inputEnvironment)
    console.log(JSON.stringify(manifest, null, 2))
  })

  it('should return Slack Configuration for dev Environment', () => {
    const slackService = new SlackService(testConfiguration)
    const devConfig: Slack | null = slackService.getSlackConfigurationByEnvironment('dev')
    expect(devConfig).not.toBeNull()
    console.log(devConfig)
  })
})
