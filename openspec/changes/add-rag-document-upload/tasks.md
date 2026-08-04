## 1. 数据唯一性

- [x] 1.1 新增历史重复文档清理与 `(tenant_code, file_hash)` 联合唯一约束迁移
- [x] 1.2 同步 Prisma schema、初始化 schema 并重新生成 RAG Prisma client

## 2. 后端上传与入库

- [x] 2.1 集中文档格式校验、hash 和原始文件描述构建能力
- [x] 2.2 重构指定文件入库并让全目录扫描跳过同租户重复 hash
- [x] 2.3 新增批量上传 Service，完成临时文件清理、同批防重、同名安全落盘和逐文件结果
- [x] 2.4 新增受鉴权保护的 multipart 上传接口并注册 Provider

## 3. 管理端页面

- [x] 3.1 扩展 RAG Admin API client 的 multipart 上传类型与 10 分钟超时
- [x] 3.2 新增批量上传弹窗，支持预校验、文件选择管理和逐文件结果
- [x] 3.3 将上传入口接入文档管理页面并在完成后刷新列表

## 4. 测试与验证

- [ ] 4.1 补充迁移、格式、hash、重复、并发冲突、部分成功和文件清理相关测试
- [ ] 4.2 运行相关 Jest、完整测试、API/RAG Admin 构建、OpenSpec strict validation 和 `git diff --check`
- [ ] 4.3 在桌面和移动视口验证上传弹窗、长文件名和结果状态布局
