import { DocumentLoaderService } from './document-loader.service';

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

  beforeEach(() => {
    service = new DocumentLoaderService();
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

  it('keeps regular PDF text readable', () => {
    const text =
      'Cloud Boat 宣传资料\n客户需要提供 FDA 文件，并保留 SDS 认证材料。';

    const result = (service as any).normalizePdfText(text);

    expect(result).toContain('Cloud Boat 宣传资料');
    expect(result).toContain('客户需要提供 FDA 文件，并保留 SDS 认证材料。');
  });
});
