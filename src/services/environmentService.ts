// environmentService.ts
import * as core from '@actions/core'
import { Config, Environment, EnvironmentPromotionPhase, EnvironmentResult } from '../interfaces/manifests'

/**
 * Service for retrieving environment data based on input environment
 */
export class EnvironmentService {
  constructor(private config: Config) {
  }

  /**
   * Retrieves environment data for the given input environment.
   * @param {string} inputEnvironment - The input environment.
   * @return {EnvironmentResult | null} - The environment data, or null if not available.
   */
  getEnvironmentData(inputEnvironment: string): EnvironmentResult | null {
    const promotionPhase = this.getPromotionPhase(inputEnvironment)
    const environment = this.getEnvironment(inputEnvironment)

    return promotionPhase && environment ? { ...environment, ...promotionPhase } : null
  }

  /**
   * Returns the promotion phase of a given environment.
   *
   * @param {string} environment - The environment to get the promotion phase for.
   * @returns {EnvironmentPromotionPhase | undefined} The promotion phase of the given environment,
   *          or undefined if the environment does not have a promotion phase.
   */
  private getPromotionPhase(environment: string): EnvironmentPromotionPhase | undefined {
    return Object.values(this.config.environment_promotion_phases).find(
      phase => phase.environment === environment
    )
  }

  /**
   * Retrieves the environment configuration based on the selected environment name.
   *
   * @param {string} selectedEnvironment - The name of the selected environment.
   * @returns {Environment|undefined} - The environment configuration object if found, otherwise undefined.
   */
  private getEnvironment(selectedEnvironment: string): Environment | undefined {
    const resultEnvironment: Environment = this.config.environments[selectedEnvironment] as Environment
    core.debug(`environment ${JSON.stringify(resultEnvironment)}`)
    const {
      cluster,
      approval_for_promotion,
      enabled,
      environment,
      next_environment,
      aws_region,
      with_gate
    }: Environment = resultEnvironment
    return {
      cluster,
      approval_for_promotion,
      enabled,
      environment,
      next_environment,
      aws_region,
      with_gate
    }
  }
}
