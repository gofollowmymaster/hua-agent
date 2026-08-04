## 1. 配置与实现

- [x] 1.1 新增查询改写模型配置、类型和环境模板，默认 `qwen-turbo`
- [x] 1.2 查询改写 Service 使用独立模型配置并保持现有 endpoint、密钥及 fallback

## 2. 测试与验证

- [x] 2.1 更新查询改写单元测试，验证模型执行、结果解析和独立模型配置
- [x] 2.2 运行相关 Jest、完整 Jest、TypeScript、构建、OpenSpec strict validation 和 `git diff --check`
