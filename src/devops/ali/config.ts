export default {
  organizationId: '65f941491febde2b6c514822',
  bindEnv: {
    dev: [
      {
        appName: 'publish-admin-app',
        workflowName: 'dev环境',
        branch: 'dev-publish',
      },
      {
        appName: 'publish-user-app',
        workflowName: 'dev环境',
        branch: 'dev-publish',
      },
    ],
    test: [
      {
        appName: 'publish-admin-app',
        workflowName: 'test环境',
        branch: 'test-publish',
      },
      {
        appName: 'publish-user-app',
        workflowName: 'test环境',
        branch: 'test-publish',
      },
    ],
  },
};
