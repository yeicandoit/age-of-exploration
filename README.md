# 🧭 大航海时代 · Age of Exploration

基于 3D 地球的大航海时代交互式探索可视化应用。选择航海家，观看他们的航线在暗色地球上依次点亮。

![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-0.159-black?logo=three.js)
![Vite](https://img.shields.io/badge/Vite-4-646cff?logo=vite)

## 功能

- 🌍 Three.js 渲染的 3D 立体地球，支持鼠标拖拽旋转和缩放
- 🌑 地球初始为暗色状态，带有简化大陆轮廓和经纬网格
- 🧑‍✈️ 左侧面板按国家分组展示 20 位航海家（中国、葡萄牙、西班牙、英国、荷兰、法国）
- ✨ 选择航海家后，探索地点按时间顺序依次亮起，伴随发光动画效果
- 🗺️ 弧线航线动态绘制，连接各个探索地点
- 🎨 每个国家独立配色，视觉区分清晰

## 收录航海家

| 国家 | 航海家 |
|------|--------|
| 中国 | 郑和 |
| 葡萄牙 | 迪亚士、达伽马、卡布拉尔、阿布克尔克 |
| 西班牙 | 哥伦布、麦哲伦、巴尔沃亚、科尔特斯、皮萨罗、奥雷利亚纳、庞塞·德·莱昂 |
| 英国 | 约翰·卡伯特、德雷克、哈得逊、巴芬、库克船长 |
| 荷兰 | 威廉·詹森、塔斯曼 |
| 法国 | 韦拉扎诺、布干维尔 |

## 技术栈

- React 18 + Vite 4
- Three.js + @react-three/fiber + @react-three/drei
- 纯前端，无后端依赖，数据内置于 `src/data/explorers.js`

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

开发服务器默认运行在 `http://localhost:3000`。

## 项目结构

```
age-of-exploration/
├── index.html                  # 入口 HTML
├── vite.config.js              # Vite 配置
├── package.json
├── 大航海时代_探索记录.md        # 原始数据来源
└── src/
    ├── main.jsx                # React 入口
    ├── App.jsx                 # 主应用组件
    ├── components/
    │   ├── Globe.jsx           # 3D 地球（球体、大陆轮廓、航线、标记点）
    │   └── Sidebar.jsx         # 航海家选择面板
    └── data/
        └── explorers.js        # 航海家数据（经纬度、时间、航线）
```

## 数据来源

航海家数据整理自 `大航海时代_探索记录.md`，涵盖 1405-1779 年间的主要航海探索活动，经纬度为近似值。

## License

MIT
