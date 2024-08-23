import * as yaml from 'js-yaml'
import { Octokit } from '@octokit/rest'
import * as core from '@actions/core'
import {
  downloadManifestFileContent,
  ensureSemanticVersionPrefix,
  parseYaml,
  splitSemanticVersion,
  validateSemanticVersion,
  versionPattern
} from '../functions'

jest.mock('@actions/core')
jest.mock('@octokit/rest')
jest.mock('@octokit/auth-app')
jest.mock('@actions/github')

describe('versionPattern', () => {
  it('should correctly identify version patterns', () => {
    const pattern = versionPattern()
    const testString1 = 'application-v1.0.0'
    const testString2 = 'version 7.10.0'
    const testString3 = 'no version pattern here'

    expect(testString1.match(pattern)).toBeTruthy()
    expect(testString2.match(pattern)).toBeTruthy()
    expect(testString3.match(pattern)).toBeFalsy()
  })

  it('should correctly capture the version from the string', () => {
    const pattern = versionPattern()
    const testString = 'application-v1.2.3'
    const match = pattern.exec(testString)

    expect(match).toBeTruthy()
    if (match) {
      const version = match[2]
      expect(version).toEqual('1.2.3')
    }
  })
})

/**
 * Test file for getSemanticVersion() function from index.ts
 * Test case: Function should add "v" prefix to version if not already present
 */
describe('ensureSemanticVersionPrefix function', () => {
  /**
   * Add v to app_version
   */
  it('Given a Version Should return just a Semantic Version', () => {
    const input_version = '1.2.3-continuous-delivery.ci'
    const expected = 'v1.2.3-continuous-delivery.ci'
    const result = ensureSemanticVersionPrefix(input_version)
    expect(result).toBe(expected)
  })
})

/**
 * Test file for getSemanticVersion() function from index.ts
 * Test case: Function should add "v" prefix to version if not already present
 */
describe('getSemanticVersion function', () => {
  /**
   * Add v to app_version
   */
  it('Given a Version Should return just a Semantic Version', () => {
    const input_version = 'v1.2.3-continuous-delivery.ci'
    const expected: boolean = true
    const result: boolean = validateSemanticVersion(input_version)
    expect(result).toBe(expected)
  })
})

/**
 * Test file for getSemanticVersion() function from index.ts
 * Test case: Function should add "v" prefix to version if not already present
 */
describe('splitSemanticVersion function', () => {
  /**
   * Add v to app_version
   */
  it('Given a Version v1.2.3-continuous-delivery.ci Should return string[] from Semantic Version', () => {
    const input_version = 'v1.2.3-continuous-delivery.ci'
    const expected: string[] = ['1', '2', '3']
    const result: string[] = splitSemanticVersion(input_version)
    expect(result).toEqual(expected)
  })

  /**
   * Add v to app_version
   */
  it('Given a Version 1.2.3-continuous-delivery.ci Should return string[] from Semantic Version', () => {
    const input_version = '1.2.3-continuous-delivery.ci'
    const expected: string[] = ['1', '2', '3']
    const result: string[] = splitSemanticVersion(input_version)
    expect(result).toEqual(expected)
  })

  /**
   * Add v to app_version
   */
  it('Given a Version 0.1.391 Should return string[] from Semantic Version', () => {
    const input_version = '0.1.391'
    const expected: string[] = ['0', '1', '391']
    const result: string[] = splitSemanticVersion(input_version)
    expect(result).toEqual(expected)
  })
})

describe('parseYaml', () => {
  it('should correctly parse yaml string into JavaScript object', () => {
    const mockYamlContent = `
        config:
            setting1: true
            setting2: 'example'
        `
    const expectedResult = {
      config: {
        setting1: true,
        setting2: 'example'
      }
    }

    const parsedData = parseYaml(mockYamlContent)
    expect(parsedData).toEqual(expectedResult)
  })

  it('should parse same as js-yaml library', () => {
    const mockYamlContent = `
        config:
            setting1: true
            setting2: 'example'
        `

    const jsYamlResult = yaml.load(mockYamlContent)
    const parseYamlResult = parseYaml(mockYamlContent)
    expect(parseYamlResult).toEqual(jsYamlResult)
  })
})

describe('downloadManifestFileContent', () => {
  const inputs = {
    environment: 'dev',
    gitops_file: './file.yaml',
    owner: 'owner',
    ref: 'main',
    repo: 'repo',
    token: 'ghp-xxxxxxx',
    version: 'v1.0.0'
  }

  it('downloads and parses the manifest file', async () => {
    // Arrange
    const mockOctokit = {
      rest: {
        repos: {
          getContent: jest.fn().mockResolvedValue({
            data: {
              type: 'file',
              content: Buffer.from('config:\n setting1: true', 'utf8').toString('base64')
            }
          })
        }
      }
    } as unknown as Octokit

    // Act
    const result = await downloadManifestFileContent(mockOctokit, inputs)

    // Assert
    expect(result).toEqual({
      config: { setting1: true }
    })
    expect(mockOctokit.rest.repos.getContent).toBeCalledWith({
      owner: 'owner',
      repo: 'repo',
      path: 'file.yaml',
      ref: 'main'
    })
    expect(core.info).toBeCalledTimes(2)
  })

  // it('throw the error when the file cannot be retrieved', async () => {
  //   // Arrange
  //   const mockError = new Error('Fetch error');
  //   const mockOctokit = {
  //     rest: {
  //       repos: {
  //         getContent: jest.fn().mockRejectedValue(mockError)
  //       }
  //     }
  //   } as unknown as Octokit;
  //
  //   const handleErrorSpy = jest.spyOn({ handleError }, 'handleError');
  //
  //   // Act
  //   const result = await downloadManifestFileContent(mockOctokit, inputs);
  //
  //   // Assert
  //   expect(result).toBeUndefined();
  //   expect(mockOctokit.rest.repos.getContent).toBeCalledWith(inputs);
  //   expect(handleErrorSpy).toHaveBeenCalledWith(mockError, expect.any(String));
  //   expect(result).toEqual('"Error when try to retrieved file ./file.yaml from \\"owner/repo\\" on branch: main. Please check if it exists. => Fetch error"')
  // });
})
