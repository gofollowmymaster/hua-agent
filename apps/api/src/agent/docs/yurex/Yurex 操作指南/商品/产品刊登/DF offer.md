# 飞书文档：DF offer

## 文档信息

| 项 | 内容 |
| --- | --- |
| 远程文档 | https://q1njej8cpab.feishu.cn/wiki/Lfh4wwPqcizpdBkQfQ3ccQqEnJg |
| 图片处理 | 本地下载（assets/images） |
| 快照时间 | 2026-08-06 |
| 来源命令 | `lark-cli docs +fetch --api-version v2 --doc https://q1njej8cpab.feishu.cn/wiki/Lfh4wwPqcizpdBkQfQ3ccQqEnJg --doc-format markdown --as user --format json --jq .data.document.content` |
| 格式处理 | fd-doc-markdown-sync/scripts/normalize-feishu-doc-markdown.mjs |

---

DF offer

当前版本v1.0.0

## 功能介绍

1. 在【新增产品】页面，支持用户上传DF offer
2. 支持复制已生效成功的PO Offer，使用户更快捷地新增DF offer（反之同理）
3. 新增【批量克隆】功能
4. 支持批量克隆“生效成功”状态下的PO offer
5. 可通过订单类型筛选Offer

## 注意事项

1. 若审核时间较久，请及时联系运营。
2. 每个产品需要检查和输入的内容较多，请您耐心检查，提高产品的竞争力。

## 操作流程

##

#### 操作路径【商品】-【产品刊登】-【catalog】-【新增产品】

![图片展示的是亚马逊平台中“Catalog”页面，左侧有“新建产品”等选项。页面显示了商品信息，如商品名称、品牌、Page views、List price（USD）、Availability、仓库状态、状态等。其中，商品名称为“测试商品1”“测试商品2”“测试商品3”，品牌均为“pingping1”，Page views均为5,441，List price（USD）均为22.99，Availability均为“更新中”，仓库状态均为“PO”，状态均为“生效成功”。该图片与上下文介绍的“新增产品”操作流程相关，展示了新增产品后的商品列表页面。](./assets/images/图片展示的是亚马逊平台中“Catalog-21f092a44e00.png)

#### 若填写的信息校验出存在生效成功的PO offer，提交后系统自动复制PO offer的数据至新增DF offer页面中，状态为：待填写详细信息。此时可再检查下页面数据后，再点击提交

![图片展示的是在亚马逊平台新增DF offer时的页面。页面上方有导航栏，左侧有“商品”等选项。页面中部有“演示商品1”的相关信息，如ASIN、SKU、MSKU等。下方有Product Identity、Offer、Product Details等标签栏，当前选中“Offer”。页面中部显示Order Type为PO，Product Type为PLAYED等信息。右上角有“取消”和“提交”按钮，箭头指向“提交”按钮。该图片与文档中新增产品操作流程上下文对应，展示了新增DF offer时的页面情况。](./assets/images/图片展示的是在亚马逊平台新增DF-off-4d0b416c246b.png)

#### 点击提交后，页面跳转至列表页，状态为：处理中，等待亚马逊审核；审核通过后，状态为：生效成功；若审核失败，状态为：创建失败，可再次编辑数据后再次提交

![图片展示的是在亚马逊平台新增DF offer时的页面。页面上方有导航栏，左侧有多个功能选项。页面中部有“Product Identity”等标签，当前选中“Offer”。下方有多个输入框，如Order Type、Product Type、Item Name等，部分框内已有信息。右上角有“取消”和“提交”按钮，其中“提交”按钮被红色箭头突出显示。该图片与文档中新增产品操作流程相关，直观呈现了新增DF offer时的填写界面及提交按钮位置。](./assets/images/图片展示的是在亚马逊平台新增DF-off-3f908e63c32a.png)

##

#### 操作路径【商品】-【产品刊登】-【catalog】-【克隆offer】

![图片展示的是亚马逊平台中Catalog页面，左侧有导航栏，右侧显示产品列表。列表中包含产品名称、品牌、Page views、List price (USD)、Availability、库存、状态、操作等信息。其中，状态列有“生效成功”“生效中”“生效失败”等标识。图片中“克隆Offer”选项被突出显示，表明这是操作路径中“批量克隆”步骤的入口，点击后可弹出数据来自于生效成功的PO offer且不在产品提交审核的弹框，用于生成DF offer数据。](./assets/images/图片展示的是亚马逊平台中Catalog页-5a6a3cc8ad8d.png)

#### 点击【克隆offer】，弹出弹框，弹框中的数据来自于列表中生效成功的PO offer且不在产品提交审核中；可勾选或全选ASIN进行批量克隆

![图片展示的是在亚马逊平台操作新增DF offer时的批量克隆弹窗界面。弹窗中显示了生效成功的PO offer数据，包括ASIN、企业标识、状态、SKU、UPC等信息，当前页面显示1条记录，共1/1页。下方有“取消”和“确定”两个按钮，箭头指向“确定”按钮。该图片与上下文紧密相关，是新增DF offer操作流程中批量克隆步骤的展示，用于说明点击“确定”后生成DF offer数据的状态情况。](./assets/images/图片展示的是在亚马逊平台操作新增DF-o-bd5cd45c2b31.png)

### 点击【确定】后，列表中生成DF offer数据，状态为：处理中；审核通过后，状态为：生效成功

![图片展示的是在亚马逊平台操作新增DF offer时的批量克隆弹框界面。弹框中显示了生效成功的PO offer数据，包括ASIN、企业标识、状态、SKU、UPC等信息，当前显示1条记录，共3/1页。右下角有“取消”和“确定”两个按钮，箭头指向“确定”按钮。该图片与上下文紧密相关，是新增DF offer操作流程中批量克隆步骤的展示，用于说明点击“确定”后生成DF offer数据的状态为“处理中”，审核通过后状态为“生效成功”。](./assets/images/图片展示的是在亚马逊平台操作新增DF-o-81458884dee1.png)

## 常见问题

###

**答：**表示Amazon还在审核中，若超过20小时依然处于审核状态，可联系客服为您处理。

###

**答：**因为PO offer必须是生效成功状态，且不在产品调价审核中，如果满足以上2个条件还是不能进行克隆，可联系客服为您处理。

###

**答：**可能是因为提交的同时正好产品在调价审核中，若仍有疑问，请联系运营。
