const createInteractToGroup = jest.fn();
const buildCardMsg = jest.fn().mockReturnValue({ type: 'alert' });

jest.mock('./clients', () => ({
  ClientFactory: { create: jest.fn().mockReturnValue({}) },
  FeishuApp: { AlertClient: 'AlertClient' },
}));

jest.mock('./helper/message-helper', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ createInteractToGroup })),
}));

jest.mock('./card/alert-card', () => ({
  CommonAlertCard: { buildCardMsg },
}));

jest.mock('@src/common/utils/app-config', () => ({
  getGlobalAppInstance: jest.fn().mockReturnValue({
    get request() {
      return undefined;
    },
  }),
}));

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn().mockReturnValue('alert-group'),
  },
}));

import { sendCommonCardToFeishu } from './utils';

describe('sendCommonCardToFeishu', () => {
  it('handles an alert when no TenantContext store exists', () => {
    expect(() =>
      sendCommonCardToFeishu({
        title: 'Global Admin error',
        project: 'aplus-sql-service',
        message: 'failed',
        content: 'request failed',
      }),
    ).not.toThrow();

    expect(buildCardMsg).toHaveBeenCalled();
    expect(createInteractToGroup).toHaveBeenCalledWith(
      { type: 'alert' },
      'alert-group',
    );
  });
});
