import { Manifest, Version } from './manifests'

/**
 * Represents the inputs required for performing actions.
 *
 * @interface Inputs
 */
export interface BaseActions {
  gitops_file: string;
  owner: string;
  repo: string;
}

/**
 * Represents the inputs required for performing actions.
 *
 * @interface Inputs
 */
export interface Inputs extends BaseActions {
  environment: string;
  prefix: string;
  ref: string;
  token: string | undefined;
  version: string;
}

/**
 * Interface representing the outputs of Actions.
 * @interface Outputs
 */
export interface Outputs extends BaseActions, Manifest, Version {
}
