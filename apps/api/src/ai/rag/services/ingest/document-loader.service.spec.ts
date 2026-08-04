import { DocumentLoaderService } from './document-loader.service';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { TenantCode } from '@src/config/tenant';

declare global {
  // eslint-disable-next-line no-var
  var __mockPdfLoad: jest.Mock;
  // eslint-disable-next-line no-var
  var __mockDocxLoad: jest.Mock;
  // eslint-disable-next-line no-var
  var __mockPptxLoad: jest.Mock;
  // eslint-disable-next-line no-var
  var __mockPdfLoader: jest.Mock;
  // eslint-disable-next-line no-var
  var __mockDocxLoader: jest.Mock;
  // eslint-disable-next-line no-var
  var __mockPptxLoader: jest.Mock;
}

jest.mock('@langchain/community/document_loaders/fs/pdf', () => ({
  PDFLoader: jest.fn().mockImplementation((...args) => {
    globalThis.__mockPdfLoader(...args);
    return { load: globalThis.__mockPdfLoad };
  }),
}));

jest.mock('@langchain/community/document_loaders/fs/docx', () => ({
  DocxLoader: jest.fn().mockImplementation((...args) => {
    globalThis.__mockDocxLoader(...args);
    return { load: globalThis.__mockDocxLoad };
  }),
}));

jest.mock('@langchain/community/document_loaders/fs/pptx', () => ({
  PPTXLoader: jest.fn().mockImplementation((...args) => {
    globalThis.__mockPptxLoader(...args);
    return { load: globalThis.__mockPptxLoad };
  }),
}));

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      if (key === 'vcHelper') return { rawDir: 'raw' };
      return undefined;
    }),
  },
}));

describe('DocumentLoaderService', () => {
  let service: DocumentLoaderService;
  let mockPdfLoad: jest.Mock;
  let mockDocxLoad: jest.Mock;
  let mockPptxLoad: jest.Mock;
  let mockPdfLoader: jest.Mock;
  let mockDocxLoader: jest.Mock;
  let mockPptxLoader: jest.Mock;

  beforeEach(() => {
    mockPdfLoad = jest.fn();
    mockDocxLoad = jest.fn();
    mockPptxLoad = jest.fn();
    mockPdfLoader = jest.fn();
    mockDocxLoader = jest.fn();
    mockPptxLoader = jest.fn();
    globalThis.__mockPdfLoad = mockPdfLoad;
    globalThis.__mockDocxLoad = mockDocxLoad;
    globalThis.__mockPptxLoad = mockPptxLoad;
    globalThis.__mockPdfLoader = mockPdfLoader;
    globalThis.__mockDocxLoader = mockDocxLoader;
    globalThis.__mockPptxLoader = mockPptxLoader;
    service = new DocumentLoaderService();
  });

  it('recognizes every supported upload format and computes SHA-256', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'rag-loader-hash-'));
    const filePath = path.join(root, 'document.md');
    try {
      await fs.writeFile(filePath, 'same content');

      expect(
        ['pdf', 'docx', 'xlsx', 'ppt', 'pptx', 'txt', 'md'].every((extension) =>
          service.isSupportedFileName(`document.${extension}`),
        ),
      ).toBe(true);
      expect(service.isSupportedFileName('document.doc')).toBe(false);
      expect(await service.hashFile(filePath)).toBe(
        'a636bd7cd42060a4d07fa1bfbcc010eb7794c2ba721e1e3e4c20335a15b66eaf',
      );
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it('loads PDF pages with LangChain community loader and keeps page metadata', async () => {
    mockPdfLoad.mockResolvedValue([
      {
        pageContent:
          '新 品 K P I 计 划 表\n供 应 商 单 品 牌 年 G M V ≥ 3 0 0 w 美 金',
        metadata: {
          source: '/private/raw/boat/demo.pdf',
          loc: { pageNumber: 5 },
          pdf: { totalPages: 11 },
        },
      },
    ]);

    const result = await service.loadDocument({
      absolutePath: '/private/raw/boat/demo.pdf',
      sourcePath: 'demo.pdf',
      fileName: 'demo.pdf',
      fileType: 'pdf',
      documentType: '',
      fileSize: 100,
      fileHash: 'hash',
    });

    expect(mockPdfLoader).toHaveBeenCalledWith('/private/raw/boat/demo.pdf', {
      splitPages: true,
      parsedItemSeparator: '',
    });
    expect(result.segments).toEqual([
      {
        text: '新品KPI计划表\n供应商单品牌年GMV≥300w美金',
        metadata: { page: 5 },
      },
    ]);
  });

  it('loads DOCX and PPTX with LangChain community loaders', async () => {
    mockDocxLoad.mockResolvedValue([
      {
        pageContent: 'docx content',
        metadata: { source: '/private/raw/a.docx' },
      },
    ]);
    mockPptxLoad.mockResolvedValue([
      {
        pageContent: 'pptx content',
        metadata: { source: '/private/raw/a.pptx' },
      },
    ]);

    const docx = await service.loadDocument({
      absolutePath: '/private/raw/a.docx',
      sourcePath: 'a.docx',
      fileName: 'a.docx',
      fileType: 'docx',
      documentType: '',
      fileSize: 100,
      fileHash: 'hash',
    });
    const pptx = await service.loadDocument({
      absolutePath: '/private/raw/a.pptx',
      sourcePath: 'a.pptx',
      fileName: 'a.pptx',
      fileType: 'pptx',
      documentType: '',
      fileSize: 100,
      fileHash: 'hash',
    });

    expect(mockDocxLoader).toHaveBeenCalledWith('/private/raw/a.docx');
    expect(mockPptxLoader).toHaveBeenCalledWith('/private/raw/a.pptx');
    expect(docx.segments).toEqual([{ text: 'docx content', metadata: {} }]);
    expect(pptx.segments).toEqual([{ text: 'pptx content', metadata: {} }]);
  });

  it('removes repeated headers, footers, and page numbers from loaded segments', async () => {
    mockPdfLoad.mockResolvedValue([
      {
        pageContent:
          'Cloud Boat 内部资料\n报价政策\n首批订单需要完成质检。\n1/3',
        metadata: { loc: { pageNumber: 1 } },
      },
      {
        pageContent:
          'Cloud Boat 内部资料\n履约要求\n海外仓发货前需要核对库存。\n2/3',
        metadata: { loc: { pageNumber: 2 } },
      },
      {
        pageContent:
          'Cloud Boat 内部资料\n售后要求\n客服需要在 24 小时内响应。\n3/3',
        metadata: { loc: { pageNumber: 3 } },
      },
    ]);

    const result = await service.loadDocument({
      absolutePath: '/private/raw/boat/demo.pdf',
      sourcePath: 'demo.pdf',
      fileName: 'demo.pdf',
      fileType: 'pdf',
      documentType: '',
      fileSize: 100,
      fileHash: 'hash',
    });

    expect(result.segments).toEqual([
      { text: '报价政策\n首批订单需要完成质检。', metadata: { page: 1 } },
      { text: '履约要求\n海外仓发货前需要核对库存。', metadata: { page: 2 } },
      { text: '售后要求\n客服需要在24 小时内响应。', metadata: { page: 3 } },
    ]);
  });

  it('derives document type from first directory under tenant raw directory', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'rag-loader-'));
    const originalCwd = process.cwd();
    try {
      process.chdir(root);
      await fs.mkdir(path.join(root, 'raw', 'aplus', 'policy'), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(root, 'raw', 'aplus', 'policy', 'a.md'),
        '# a',
      );
      await fs.writeFile(path.join(root, 'raw', 'aplus', 'root.md'), '# root');

      service = new DocumentLoaderService();
      const result = await service.scanRawFiles('aplus' as TenantCode);

      expect(
        result.map((file) => ({
          sourcePath: file.sourcePath,
          documentType: file.documentType,
        })),
      ).toEqual(
        expect.arrayContaining([
          { sourcePath: path.join('policy', 'a.md'), documentType: 'policy' },
          { sourcePath: 'root.md', documentType: '' },
        ]),
      );
    } finally {
      process.chdir(originalCwd);
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it('normalizes split text extracted from PDF pages', () => {
    const text = [
      '★ 针 对 新 品 （ 开 售 9 0 天 以 内 的 产 品 ） 单 A S I N 月 销 ≤ 3 w 美 金 的 ， 需 满 足 以 下 要 求 ：',
      '1 供 应 商 单 品 牌 年 G M V ≥ 3 0 0 w 美 金 ， 不 接 低 质 量 铺 货 型 卖 家',
      '2 与 我 司 （ 甲 方 ） 商 定 新 品 K P I 计 划 表 ， 约 定 以 下 内 容 ：',
      'a . 单 个 A S I N 月 销 售 3 w 美 金 的 目 标 达 成 时 间 和 相 关 运 营 策 略 ；',
      'b . 新 品 推 广 期 内 A S P 变 动 幅 度 不 超 2 5 %',
    ].join('\n');

    const result = (service as any).normalizePdfText(text);

    expect(result).toContain(
      '针对新品（开售90天以内的产品）单ASIN月销≤3w美金的，需满足以下要求',
    );
    expect(result).toContain('供应商单品牌年GMV≥300w美金');
    expect(result).toContain('新品KPI计划表');
    expect(result).toContain('单个ASIN月销售3w美金的目标达成时间');
    expect(result).toContain('新品推广期内ASP变动幅度不超25%');
  });

  it('normalizes scores, dates, percentages, and review thresholds', () => {
    const text = [
      '2 0 2 6 / 4 / 1 5 杜 康',
      '2 评 分 4 . 5 + ；',
      'A . 客 单 价 < 1 5 0 美 金 的 ， 3 0 + r e v i e w s （ 最 低 2 8 个 r e v i e w s ）；',
      '次 月 海 外 仓 有 1 . 5 个 月 的 在 库 库 存 + 0 . 5 个 月 的 在 途 库 存',
    ].join('\n');

    const result = (service as any).normalizePdfText(text);

    expect(result).toContain('2026/4/15');
    expect(result).toContain('评分4.5+');
    expect(result).toContain('客单价<150美金的，30+reviews');
    expect(result).toContain('最低28个reviews');
    expect(result).toContain('次月海外仓有1.5个月的在库库存+0.5个月的在途库存');
  });

  it('collapses PDF lines whose glyphs are systematically duplicated', () => {
    const text = [
      '22002266//66//3300',
      'QQ11：：化化妆妆品品可可以以接接吗吗？？',
      '机机器器人人--QQAA补补充充',
      'A：beauty品类可正常核价，但是否正常接入合作需要多方谨慎评估。',
    ].join('\n');

    const result = (service as any).normalizePdfText(text);

    expect(result).toBe(
      [
        '2026/6/30',
        'Q1：化妆品可以接吗？',
        '机器人-QA补充',
        'A：beauty品类可正常核价，但是否正常接入合作需要多方谨慎评估。',
      ].join('\n'),
    );
  });

  it('keeps normal lines containing occasional repeated characters', () => {
    const text = '请看看商品详情，天天更新库存，并严格评估风险。';

    expect((service as any).normalizePdfText(text)).toBe(text);
  });

  it('compacts PDF content extracted as one character per line', () => {
    const text = [
      '8',
      '抽',
      '屉',
      '可',
      '调',
      '节',
      '分',
      '隔',
      '条',
      '4',
      '–',
      '8',
      '条',
      'P',
      'P',
      '/',
      'A',
      'B',
      'S',
      '装',
      '袋',
      '+',
      '彩',
      '盒',
      '',
      '1',
      '7',
      '烘',
      '干',
      '机',
      '羊',
      '毛',
      '球',
      '6',
      '–',
      '8',
      '个',
      '装',
      '1',
      '0',
      '0',
      '%',
      '新',
      '西',
      '兰',
      '羊',
      '毛',
    ].join('\n');

    const result = (service as any).normalizePdfText(text);

    expect(result).toContain('8抽屉可调节分隔条4–8条PP/ABS装袋+彩盒');
    expect(result).toContain('17烘干机羊毛球6–8个装100%新西兰羊毛');
  });

  it('compacts sparse one-character PDF lines with blank lines', () => {
    const text = [
      '3',
      '',
      '户',
      '外',
      '花',
      '盆',
      '套',
      '组',
      '',
      '3',
      '',
      '件',
      '陶',
      '瓷',
      '',
      '+',
      '',
      '塑',
      '料',
      '内',
      '托',
      '',
      '+',
      '',
      '纸',
      '箱',
      '',
      '6',
      '',
      '户',
      '外',
      '折',
      '叠',
      '桌',
      '',
      '6',
      '0',
      'x',
      '4',
      '0',
      'x',
      '5',
      '0',
      'c',
      'm',
      '',
      '铝',
      '',
      '+',
      '',
      '木',
      '板',
      '袋',
      '装',
      '',
      '+',
      '',
      '纸',
      '箱',
      '',
      '1',
      '3',
      '',
      '草',
      '坪',
      '装',
      '饰',
      '灯',
      '',
      '3',
      '',
      '件',
      '',
      'A',
      'B',
      'S',
      '+',
      'L',
      'E',
      'D',
    ].join('\n');

    const result = (service as any).normalizePdfText(text);

    expect(result).toContain('3户外花盆套组3件陶瓷+塑料内托+纸箱');
    expect(result).toContain('6户外折叠桌60x40x50cm铝+木板袋装+纸箱');
    expect(result).toContain('13草坪装饰灯3件ABS+LED');
  });

  it('keeps regular PDF text readable', () => {
    const text =
      'Cloud Boat 宣传资料\n客户需要提供 FDA 文件，并保留 SDS 认证材料。';

    const result = (service as any).normalizePdfText(text);

    expect(result).toContain('Cloud Boat 宣传资料');
    expect(result).toContain('客户需要提供 FDA 文件，并保留 SDS 认证材料。');
  });
});
