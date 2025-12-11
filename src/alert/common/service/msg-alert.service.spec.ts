// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MsgAlertService } from './msg-alert.service';
import { PrismaService } from '@src/common/service/prisma/prisma.service';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import { LoggerService } from '@src/common/service/logger/logger.service';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { AlertEvent, ErrorLevel } from '../type/alert';
// user.service.spec.ts

describe('MsgAlertService', () => {
  let service: MsgAlertService;
  let messageHelper: jest.Mocked<FeishuMessageHelper>;
  // let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MsgAlertService,
        {
          provide: PrismaService,
          useValue: {
            alertMessage: { create: jest.fn(), findUnique: jest.fn() },
          },
        },
        {
          provide: FeishuMessageHelper,
          useValue: {
            createInteractToGroup: jest.fn(),
            urgentApp: jest.fn(),
            urgentPhone: jest.fn(),
            replyInThread: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: { error: jest.fn(), info: jest.fn() },
        },
        {
          provide: FeishuBusinessLineTable,
          useValue: { getBusinessLineBySubapp: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MsgAlertService>(MsgAlertService);
    messageHelper = module.get(
      FeishuMessageHelper,
    ) as jest.Mocked<FeishuMessageHelper>;
  });
  describe('sendFsAlertMsg', () => {
    it('should throw error when message_id is empty', async () => {
      const alertInfo: AlertEvent = {
        pageModuleName: 'test-module',
        environment: 'dev',
        level: ErrorLevel.WARNING,
        timestamp: Date.now(),
      } as AlertEvent;

      messageHelper.createInteractToGroup.mockResolvedValue({
        message_id: null,
      });

      await expect(
        service.sendFsAlertMsg(alertInfo, 'test message'),
      ).rejects.toThrow('消息发送失败，message_id为空');
    });

    it('should return groupMsgInfo when level is not FATAL', async () => {
      const alertInfo: AlertEvent = {
        pageModuleName: 'test-module',
        environment: 'dev',
        level: ErrorLevel.WARNING,
        timestamp: Date.now(),
      } as AlertEvent;

      const mockGroupMsgInfo = {
        message_id: 'msg_123',
        body: { content: 'test' },
      };
      messageHelper.createInteractToGroup.mockResolvedValue(mockGroupMsgInfo);

      const result = await service.sendFsAlertMsg(alertInfo, 'test message');

      expect(result).toEqual(mockGroupMsgInfo);
    });

    it('should call messageAlert when level is FATAL', async () => {
      const alertInfo: AlertEvent = {
        pageModuleName: 'test-module',
        environment: 'dev',
        level: ErrorLevel.FATAL,
        timestamp: Date.now(),
      } as AlertEvent;

      const mockGroupMsgInfo = {
        message_id: 'msg_123',
        body: { content: 'test' },
      };
      messageHelper.createInteractToGroup.mockResolvedValue(mockGroupMsgInfo);

      jest.spyOn(service as any, 'messageAlert').mockResolvedValue(undefined);

      const result = await service.sendFsAlertMsg(alertInfo, 'test message');

      expect(result).toEqual(mockGroupMsgInfo);
      expect((service as any).messageAlert).toHaveBeenCalledWith(
        mockGroupMsgInfo,
        alertInfo,
      );
    });
  });
});
