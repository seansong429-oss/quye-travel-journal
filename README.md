# 去野旅行灵感

中文旅行灵感与智能行程网站，基于 Next.js、React、vinext 和 Cloudflare Sites 构建。

## 已接入能力

- DeepSeek Chat Completions API：为全球城市、国家、海岛、偏远地区与跨城路线生成按天组织的结构化行程
- Open-Meteo：目的地地理匹配与未来 16 天逐日天气
- 高德 Web 服务：驾车、公交、步行与骑行路线查询
- 中文维基百科：正式目的地简介、图片与来源链接
- ChatGPT 登录 + Cloudflare D1：跨设备同步目的地收藏和 AI 行程

## 本地启动

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

复制 `.env.example` 为 `.env`，按需填写：

```dotenv
DEEPSEEK_API_KEY=你的_DeepSeek_API_Key
DEEPSEEK_MODEL=deepseek-v4-flash
AMAP_WEB_SERVICE_KEY=你的高德_Web服务_Key
```

密钥只在服务端读取，不能添加 `NEXT_PUBLIC_` 前缀，也不要提交真实密钥。

## 验证

```bash
npm run lint
npm test
```

数据库结构变更后运行：

```bash
npm run db:generate
```

## 数据说明

- Open-Meteo 仅提供未来 16 天内的逐日天气；更远日期会显示最近预报并提示临行前复查。
- DeepSeek 行程不会声称已实时核验营业时间、票价或预约状态。
- 高德路线结果依赖地点可被高德地理编码识别；国际或偏远目的地仍可生成完整 AI 行程和全球天气，但实时交通会提示改用当地地图。
- 未登录时收藏保存在本机；登录后会与账户收藏合并并同步到 D1。
