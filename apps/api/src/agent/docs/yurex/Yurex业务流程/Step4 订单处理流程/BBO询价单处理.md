# 飞书文档：BBO询价单处理

## 文档信息

| 项 | 内容 |
| --- | --- |
| 远程文档 | https://q1njej8cpab.feishu.cn/wiki/JGTww87a7itO9okVBgrcNK9xnzf |
| 图片处理 | 云端引用 |
| 快照时间 | 2026-08-06 |
| 来源命令 | `lark-cli docs +fetch --api-version v2 --doc https://q1njej8cpab.feishu.cn/wiki/JGTww87a7itO9okVBgrcNK9xnzf --doc-format markdown --as user --format json --jq .data.document.content` |
| 格式处理 | fd-doc-markdown-sync/scripts/normalize-feishu-doc-markdown.mjs |

---

## BBO询价单处理

BBO，全称Bulk Buy Offer，亚马逊批量采购询价单，是在现有PO供货价的基础上，提供更多的采购数量以及更长的备货时间，以换取更低供货价的PO订单。当卖家接受BBO报价后，亚马逊会在BBO询价结束后下发采购订单，BBO-PO 接单、发货流程同正常PO一致。

**系统操作指南：**
