## Design

固定的 Python 编译器将 5 个订单工具结果映射为 A2UI v0.9 `createSurface`、`updateComponents`、`updateDataModel` 命令。前端只注册本地 `local://` catalog，并映射 `OrderList`、`OrderDetail`、`OrderMutation` 三个实现，模型不得创建组件树。

卡片动作以 Bearer JWT 用户和当前会话 key 绑定。服务端从已持久化 surface 读取订单号，不信任客户端状态；动作成功后把 `updateDataModel` 追加回原 part 的 command queue，因此历史回放得到最新状态。

此能力强制面向 FastAPI 部署；不提供 NestJS gateway 的运行时回退。
