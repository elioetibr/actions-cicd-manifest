// slackService.ts
import { Config, Slack, SlackChannels, SlackCiCdConfiguration } from '../interfaces/manifests'

/**
 * Service for retrieving environment data based on input environment
 */
export class SlackService {
  constructor(private config: Config) {
  }

  /**
   * Retrieves environment data for the given input environment.
   * @param {string} inputEnvironment - The input environment.
   * @return {Slack | null} - The environment data, or null if not available.
   */
  getSlackConfigurationByEnvironment(inputEnvironment: string): Slack | null {
    const slackConfig = this.getSlackCiCdConfiguration(inputEnvironment as keyof SlackChannels)
    return !slackConfig ? null : {
      url: this.config.slack.url,
      channels: slackConfig
    } as unknown as Slack
  }

  private getSlackCiCdConfiguration(inputEnvironment: keyof SlackChannels): SlackCiCdConfiguration | null {
    const channels = this.config.slack.channels
    const channelsResults = channels[inputEnvironment]
    return !channelsResults ? null : channelsResults as unknown as SlackCiCdConfiguration
  }
}
