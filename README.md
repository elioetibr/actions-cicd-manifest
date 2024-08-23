# Actions PullRequest Deployment Parser

## Get Started

This Action can be used to generate deployment information.

## Development information

* NVM
* Node v20
* TypeScript
* Jest

## GitHub Actions Inputs and Outputs

<!-- BEGINNING OF TEMPLATE -->
### Inputs

|    Name     |           Description           | Required |            Default             |
| ----------- | ------------------------------- | -------- | ------------------------------ |
| gitops_file | GitOps File Path/Name           | True     |                                |
| version     | Semantic Version                | True     |                                |
| environment | Environment                     | False    | dev                            |
| owner       | GitHub Organization Owner       | False    | ${{ github.repository_owner }} |
| prefix      | Output Prefix                   | False    |                                |
| ref         | Commit Hash or Branch Reference | False    |                                |
| repo        | GitHub Repository               | False    | ${{ github.repository.name }}  |
| token       | GitHub Token                    | False    | ${{ github.token }}            |

### Outputs

|           Name           |                             Description                             |
| ------------------------ | ------------------------------------------------------------------- |
| app_of_apps              | Repository GitOps App of Apps that contain the application manifest |
| app_of_apps_service_name | The Service name in App of Apps Manifest                            |
| app_repo                 | Application Repository                                              |
| app_version              | Application Version                                                 |
| approval_for_promotion   | If requires approval for promotion                                  |
| aws_account_id           | AWS Account ID                                                      |
| aws_region               | AWS Region                                                          |
| branch                   | Current Working Branch                                              |
| chart_version            | Helm Chart Version                                                  |
| cluster                  | Environment Cluster                                                 |
| description              | Environment Description                                             |
| dockerfile               | Dockerfile Path                                                     |
| ecr_repository_name      | ECR Repository Name                                                 |
| enable_tests             | Enabled UnitTest on Docker Build                                    |
| enabled                  | If Pipelines are enabled                                            |
| environment              | Environment Name                                                    |
| gitops_file              | GitOps Manifest file path                                           |
| helm_chart_repo          | Help Chart Repository Name                                          |
| helm_chart_service_name  | Helm Chart Service Name                                             |
| is_mono_repo             | If is a MonoRepo CICD                                               |
| major                    | Major from Semantic Version                                         |
| minor                    | Minor from Semantic Version                                         |
| name                     | Application Name                                                    |
| next_environment         | Next Environment Name                                               |
| owner                    | Organization Owner Name                                             |
| patch                    | Patch from Semantic Version                                         |
| repo                     | Repository                                                          |
| sem_ver                  | Application Semantic Version                                        |
| service                  | Application Service Name. Match with Helm Charts                    |
| slack                    | Slack Notification Configurations                                   |
| with_gate                | Determines if Deployment will have a get to approval                |
<!-- END OF TEMPLATE -->

## GitOps Manifest files sample:

```yaml
---
app_of_apps: app-of-apps
app_of_apps_service_name: devops
app_repo: elioetibr
dockerfile: .github/tests/app/Dockerfile
ecr_repository_name: devops
enable_tests: false
helm_chart_repo: devops-helm-charts
helm_chart_service_name: devops
is_mono_repo: false
name: devops
service: devops
environment_promotion_phases:
  01-dev:
    aws_account_id: 885015629014
    description: Development Workload
    environment: dev
    enabled: true
  02-demo:
    aws_account_id: 134764736449
    description: Demo/Stage Workload
    environment: demo
    enabled: false
  03-prod:
    aws_account_id: 838106405942
    description: Production Workload
    environment: prod
    enabled: false
environments:
  dev:
    aws_region: us-east-2
    cluster: dev-eks
    environment: dev
    next_environment: demo
    additional_aws_regions: []
    approval_for_promotion: false
    enabled: true
    with_gate: false
  demo:
    aws_region: us-east-2
    cluster: demo-eks
    environment: demo
    next_environment: prod
    additional_aws_regions: []
    approval_for_promotion: false
    enabled: false
    with_gate: true
  prod:
    aws_region: us-east-2
    cluster: prod-eks
    environment: prod
    next_environment: ''
    additional_aws_regions: []
    approval_for_promotion: false
    enabled: false
    with_gate: true
path_monitor:
  application:
    hasModifications: false
    paths:
      - .github/workflows/cicd-roicalc.yaml
      - roicalc/.*
  helm_charts:
    hasModifications: false
    paths:
      - charts/roicalc/.*
slack:
  url: https://slack_company_project.slack.com
  channels:
    default:
      cd: &cd
        - id: C071C123456
          name: "#deployment"
      ci: &ci
        - id: C07G5123456
          name: "#ci"
    dev:
      cd: *cd
      ci: *ci
    demo:
      cd: *cd
      ci: *ci
    prod:
      cd: *cd
      ci: *ci
```
