# 飞书文档：Price Discount

## 文档信息

| 项 | 内容 |
| --- | --- |
| 远程文档 | https://q1njej8cpab.feishu.cn/wiki/ToOuw7ylQiJQCrkND9LcOzfDnSb |
| 图片处理 | 本地下载（assets/images） |
| 快照时间 | 2026-08-06 |
| 来源命令 | `lark-cli docs +fetch --api-version v2 --doc https://q1njej8cpab.feishu.cn/wiki/ToOuw7ylQiJQCrkND9LcOzfDnSb --doc-format markdown --as user --format json --jq .data.document.content` |
| 格式处理 | fd-doc-markdown-sync/scripts/normalize-feishu-doc-markdown.mjs |

---

Price Discount

当前版本v2.0.0

## 功能介绍

1. Price discount是亚马逊平台上推出的一种促销活动，比较适用于清理库存过多的产品。该促销活动在Amazon商品详细页面上最短2天，最长可持续 31天。
2. 通过参与促销活动，卖家不仅能在短期内冲击销量，更能在较长时间里持续完善品牌建设，优化店铺运营。

## 注意事项

1. 单个ASIN参加的促销活动在Promotions中会存在互斥，创建的时候需要注意。
2. 该促销活动在Amazon商品详细页面上最长可持续 31 天月。需提前2天创建活动。

## 操作流程

##

#### 操作路径

【销售】-【营销推广】-【Price Discount】

![亚马逊平台Price Discount页面。](./assets/images/图片展示了亚马逊平台Price-Disc-38f7e6970a2c.png)

#### 点击页面【创建Price Discount】

![亚马逊后台“Price Discount”页面。左侧导航栏中“Price Discount”选项被红色框线突出显示。](./assets/images/图片展示了亚马逊后台“Price-Dis-1bbd19fe64e1.png)

#### 阅读创建须知，设置活动什么日期开始和结束，选择参加活动的ASIN，选择折扣方式，输入折扣值

![“Price Discount”页面截图，展示“阅读创建须知，设置活动什么日期开始和结束，选择参加活动的ASIN，选择折扣方式，输入折扣值”的功能入口和操作区域。](./assets/images/图片展示-addCriterion-b060320b6c01.png)

#### 最大能提前56天创建Price Discount，即活动开始日期不得大于当日+56天

![Price Discount创建页面。页面中活动日期设置处被红色框出，显示活动开始日期不得大于当日+56天。](./assets/images/图片展示的是Price-Discount-e88b2a656c32.png)

#### 参加活动的ASIN需要满足本次想参加活动的日期范围内，无其他Promotions，即同一个ASIN某一天只能有一种Promotion

![“Price Discount”页面，上方有“Price Discount”标题及搜索框，右侧有“新建”按钮。页面中部有红色框突出显示的“活动已过期，只可”。](./assets/images/图片展示的是“Price-Discoun-60ecc572275c.png)

#### 一个活动，最多添加20个ASIN，点击+添加产品，添加更多活动ASIN，点击删除可以删除已选择的活动ASIN，但是需至少保留一个

![“创建Price Discount”操作流程中“创建Price Discount”页面。页面中部中提到的“+添加产品”操作，即在页面右下角点击“+添加产品”按钮，可添加更多活动ASIN，点击“删除”按钮可时代中国可。](./assets/images/图片展示的是“创建Price-Disco-3c7a4a850e44.png)

#### 取消创建，可以点击tab菜单上x小图标，也可以点击取消按钮，注意当前输入内容不会被保存

![“创建Price Discount”操作流程中“查看活动产品列表”页面。下方表格显示活动产品列表，包含ASIN、SKU、业务模式、Current List Price、折扣方式、折扣值比例、折扣金额、预计促销金额（BASE）、操作等。](./assets/images/图片展示的是“创建Price-Disco-df4870f05674.png)

#### 活动信息设置好后，点击创建按钮，提交创建请求到亚马逊审核

![“创建Price Discount”页面。页面上方有praice_discount_创建Price Discount_操作流程_创建Price Discount_操作路径_创建Price Discoun。](./assets/images/图片展示的是“创建Price-Disco-60726eec0b32.png)

![Price Discount活动产品列表页面。页面上方有搜索栏及多个操作按钮。](./assets/images/图片展示的是Price-Discount-ae0476079747.png)

##

#### 创建失败状态的活动，支持重新创建，自动填充之前活动的相关信息

![Price Discount活动产品列表页面。页面上方有筛选条件，如按ASIN/MSKU/产品名称等筛选，还可按活动起止日期、创建起止日期等筛选。](./assets/images/图片展示的是Price-Discount-b55d450d425b.png)

#### 进入重新创建页面，系统默认填充上次活动相关信息，并会展示相关报错信息

> - 上次活动的开始日期大于当前+2天时，才默认填充活动起止日期
> - 页面相关检验规则与创建功能一致，请参考

![】Price Discount【操作流程中“重新创建Price Discount”部分，展示了重新创建页面。页面显示“尚未创建Price Discount”，并提示上次活动的开始日期大于当前+2天时默认填充活动起止日期。](./assets/images/图片展示-addCriterion】Pr-36e9f6de8538.png)

#### 活动信息重新设置好后，点击创建按钮，提交创建请求到亚马逊审核

![“重新创建Price Discount”页面。页面右上角有“取消”和“创建”按钮，其中“创建”按钮被红色框突出显示。](./assets/images/图片展示的是“重新创建Price-Dis-c2faf613ae79.png)

##

#### 创建提交成功，列表展示“创建审核中”

![亚马逊平台Price Discount活动产品管理界面的活动产品列表页面。列表中显示了产品名称、Promotion ID、List Price、Current List Price、折扣方式、折扣比例、系列折扣100%、预计促销结束 。](./assets/images/图片展示的是亚马逊平台Price-Dis-bb80372ece00.png)

#### 支持按 ASIN/MSKU/产品名称/Promotion ID、活动起止日期、创建起止日期、产品负责人、状态 搜索活动。

![亚马逊Price Discount活动产品列表页面。页面上方有搜索栏、筛选条件等，可按ASIN/MSKU/产品名称等筛选。](./assets/images/图片展示的是亚马逊Price-Disco-099a7172e99c.png)

#### 活动产品列表展示 产品信息、**Promotion ID**、**List Price**、**Current List Price**、折扣方式、**折扣比例**、折扣金额、**预估促销价格**、**活动起止日期**、**销量**、**销售额**、费用、**浏览次数**、**业务模式、产品负责人、平台运营经理、创建时间、**状态 字段，默认按创建时间倒序排序

![亚马逊Price Discount页面，重点突出“活动产品列表”区域。该区域显示了产品信息、Promotion ID、Current List Price、折扣方式、折扣比例、新销售价格（USD）、剩余促销库存（USD）等信息。](./assets/images/图片展示的是亚马逊Price-Disco-0aa4ed9115a4.png)

#### 当活动状态为 创建失败、请留意，状态后面可能会出现 ？小图标，鼠标悬停到小图标上，可查看具体原因

![Price Discount活动产品列表页面。当活动状态为创建失败时，状态后面可能会出现？小图标，如图中红框突出显示部分，鼠标悬停可查看具体原因。](./assets/images/图片展示的是Price-Discount-d149287ff15e.png)

##

#### 状态为“生效成功”、“前留意”的非多供应商组合创建的活动活动，支持编辑

![Price Discount活动列表页面。有两个活动状态为“生效成功”，其图片右侧有红色框突出显示“生效成功”状态的活动，对应操作栏有“详情”按钮，点击可查看活动详细信息。](./assets/images/图片展示的是Price-Discount-8fd84900bfaf.png)

#### 进入编辑页面，系统默认填充活动相关信息，如果活动有报错，会展示报错信息

> - 页面相关检验规则与创建功能一致，请参考
> - “请留意”状态：支持删除商品、调大折扣和修改活动日期（仅开始日期大于当天时，才支持修改开始日期）
> - “生效成功”状态：仅支持调大折扣

![Price Discount活动编辑页面。左上角红框内为活动ID，其右侧红框可展示活动报错信息。](./assets/images/图片展示了Price-Discount活-6bea59ac7f12.png)

#### 活动信息修改后，点击提交按钮，提交创建请求到亚马逊审核，活动状态变为“处理中”

![“编辑Price Discount”页面，上方显示活动ID、创建日期等信息，下方表格列出商品信息，如ASIN、SKU、商品名称等。页面右上角有“取消”和“提交”按钮，其中“提交”按钮被红色箭头突出指向。](./assets/images/图片展示的是“编辑Price-Disco-1f19ae62b909.png)

##

#### 所有状态的活动，都支持查看详情，点击操作栏【详情】，可查看活动的详细信息。

![Price Discount活动管理页面。右侧列表显示活动信息，包括Promotion ID、List Price/USD、Current List Price/USD、折扣方式、折扣百分比、折扣促销I。](./assets/images/图片展示的是Price-Discount-257b96eb7925.png)

#### “生效成功”和“请留意”状态的活动，支持取消活动

> - 如果活动有报错，页面会展示对应错误信息

![“Price Discount”页面截图，展示““生效成功”和“请留意”状态的活动，支持取消活动”的功能入口和操作区域。](./assets/images/图片展示-自动生成图片说明-6e688ee9add9.png)

##

#### 所有状态的活动，都支持查看操作日志，点击操作栏【操作日志】，可查看活动的操作记录。

![“Price Discount”操作流程中“编辑活动”部分的界面。“操作”列有“编辑”选项，图片中用红色框突出显示了“编辑”操作按钮，与上下文提到的“操作日志会记录具体操作内容、操作时间、操作人和操作结果。](./assets/images/图片展示的是“Price-Discoun-6adb6613d6bc.png)

#### 操作日志会记录具体操作内容、操作时间、操作人和操作结果。

> - 操作人：可能是客户公司产品负责人、也可能是系统（定时同步检测更新变动）
> - 具体操作内容：删除活动产品，修改活动起止日期、折扣，以及活动的状态流转

![操作日志中“操作内容”部分，记录了2026 - 03 - 18 14:0。](./assets/images/图片展示的是操作日志中“操作内容”部分-413be4ec6eb4.png)

##

#### 通过搜索条件搜索过滤数据，再导出所有数据；

![“Price Discount”页面截图，展示“通过搜索条件搜索过滤数据，再导出所有数据”的功能入口和操作区域。](./assets/images/图片展示的是“Price-自动生成的图片-921733035cff.png)

#### 勾选需要的数据，再点击导出；

![Price Discount页面，位于“操作流程”部分的“导出数据”步骤说明处。用红色框和箭头标注了“先勾选需要导出的数据”和“再点击导出”两步操作，直观呈现了导出数据的操作步骤。](./assets/images/图片展示了Price-Discount页-194b65894607.png)

## 常见问题

##

**答：**虽然Amaozn审核通过了您创建的活动组，但是可能因Amazon对产品的政策要求导致了产品出现报错现象。您可以通过修改折扣来解决该问题，若提交后仍报错，建议您联系运营人员。
