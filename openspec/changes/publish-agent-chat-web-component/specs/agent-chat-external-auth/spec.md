## ADDED Requirements

### Requirement: 支持 JWT 和 Secret
Agent Chat 接口 SHALL 同时接受 Bearer JWT 和固定 Secret 鉴权。

#### Scenario: JWT 调用
- **WHEN** 请求携带 Bearer JWT
- **THEN** 接口校验登录态并解析租户

#### Scenario: Secret 调用
- **WHEN** 请求携带固定 Secret
- **THEN** 接口校验客户端密钥并解析租户
