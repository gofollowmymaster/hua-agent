## Context

`agent_chunks.content` 已通过 `to_tsvector('zhparser', content)` 建立 GIN 索引，独立检索接口也使用 `ts_debug('zhparser')` 提取词元并以 OR 语义构造 `tsquery`。文档列表仍由 Prisma `contains` 构造元数据过滤，不能表达切片全文匹配。

## Decisions

- 无关键词时保留现有 Prisma 分页查询。
- 有关键词时使用 Prisma 参数化原生 SQL，在数据库内组合元数据 `ILIKE` 与切片全文 `EXISTS` 条件，先取得分页文档 ID 和总数，再用 Prisma 读取完整文档与切片数量。
- 全文查询复用现有检索接口的 zhparser 词元 OR 语义；当分词没有有效词元时，仍允许元数据包含匹配。
- SQL 同时约束文档与切片租户，分类和状态过滤在分页前生效；同一文档命中多个切片时只返回一次。
- 结果按 `updated_at DESC, id DESC` 稳定排序，Prisma 回读后按 ID 顺序恢复 SQL 分页顺序。

## Risks / Trade-offs

- 关键词分支使用原生 SQL，需以单元测试约束参数化查询、分页和排序恢复。
- 元数据包含匹配无法使用当前 B-tree 索引，但正文检索复用既有 GIN 索引；本次不引入额外模糊搜索扩展。
