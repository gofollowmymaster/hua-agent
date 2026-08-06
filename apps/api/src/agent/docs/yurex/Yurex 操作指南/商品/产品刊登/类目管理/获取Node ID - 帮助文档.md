# 飞书文档：获取Node ID - 帮助文档

## 文档信息

| 项 | 内容 |
| --- | --- |
| 远程文档 | https://q1njej8cpab.feishu.cn/wiki/Arrow7LKSiymulkD3z1czZQOnU4 |
| 图片处理 | 本地下载（assets/images） |
| 快照时间 | 2026-08-06 |
| 来源命令 | `lark-cli docs +fetch --api-version v2 --doc https://q1njej8cpab.feishu.cn/wiki/Arrow7LKSiymulkD3z1czZQOnU4 --doc-format markdown --as user --format json --jq .data.document.content` |
| 格式处理 | fd-doc-markdown-sync/scripts/normalize-feishu-doc-markdown.mjs |

---

## 获取Node ID - 帮助文档

### 步骤一：搜索ASIN，进入Amazon Listing页面

该产品的类目为：Tools & Home Improvement > Lighting & Ceiling Fans > Outdoor Lighting > String Lights

![图片展示 addCriterion图片展示的是Amazon网站上一款户外灯的 addCriterion图片展示的是Amazon网站上一款户外灯串商品页面。页面左上角显示“New York 10040”地址，搜索栏内有“Tools & Home Improvement”等分类选项。商品图片为100英尺长的户外灯串，灯泡为黄色。商品名称为“Outdoor String Lights 100FT, G40 Led Patio Lights 2700K with 52](./assets/images/图片展示-addCriterion图片展-f602477be11a.png)

### 步骤二：页面中找到Promotion Information ---> Best Sellers Rank --> 点击类目

![图片展示的是Amazon产品页面的部分信息。左侧为“Product information”板块，包含品牌、使用场景、特殊功能等详细参数。右侧是“Additional Information”板块，突出显示了ASIN、Best Sellers Rank（排名）、Date First Available（首次上架日期）等关键信息。其中，Best Sellers Rank部分用红色箭头指向，标注为“#71,353 in Tools & Home Improvement (See Top 100 in Tools & Home Improvement)”及“#740 in Outdoor String Lights”，与文档中步骤二“页面中找到Promotion Information--->Best Sellers R”内容相关，用于获取产品在特定类目的排名信息。](./assets/images/图片展示的是Amazon产品页面的部分信-308adfc5deed.png)

### 步骤三：跳转至Amazon Best Sellers网页，通过选择最小类目节点，可在网址上找到对应的Node ID

该产品的最小类目节点为：String Lights，所对应的Node ID为3742221。

![图片展示的是Amazon Best Sellers网页，页面标题为“Best Sellers in Outdoor String Lights”。左侧导航栏中“String Lights”被红色框突出显示。页面中部展示了三款户外灯串产品，其中一款产品下方网址中“3742221”被红色箭头指向并突出显示。该图片与上文“步骤三”内容相关，用于说明跳转至Amazon Best Sellers网页后，通过选择最小类目节点可在网址上找到对应的Node ID，此图直观呈现了网址中Node ID的位置。](./assets/images/图片展示的是Amazon-Best-Se-f02a50a01fb7.png)
