// 大航海时代航海家数据
// 经纬度转换: lat/lng in degrees, positive = N/E, negative = S/W
//
// waypoints: 两个探索点之间的航路中间点（不显示为标记，仅用于引导航线走海路）
// 格式: routes[i].waypoints = [[lat, lng], ...] 表示从 routes[i] 到 routes[i+1] 的中间经过点

const explorers = [
  {
    id: 'zhenghe',
    name: '郑和',
    nameEn: 'Zheng He',
    country: '中国',
    color: '#ff4444',
    routes: [
      { name: '太仓（出发港）', lat: 31, lng: 121, year: 1405,
        // 太仓 → 占城：沿中国海岸南下，经台湾海峡、南海
        waypoints: [[28, 122], [25, 120], [22, 115], [19, 111]] },
      { name: '占城（越南）', lat: 16, lng: 108, year: 1405,
        // 占城 → 暹罗：沿越南海岸绕过去
        waypoints: [[12, 109], [8, 105], [7, 102]] },
      { name: '暹罗（泰国）', lat: 13, lng: 100, year: 1405,
        // 暹罗 → 爪哇：经马来半岛西侧、马六甲海峡、爪哇海
        waypoints: [[8, 98], [3, 101], [0, 105], [-3, 107]] },
      { name: '爪哇', lat: -7, lng: 110, year: 1405,
        // 爪哇 → 苏门答腊：经爪哇海
        waypoints: [[-5, 107], [-2, 104]] },
      { name: '苏门答腊', lat: 1, lng: 100, year: 1406 },
      { name: '马六甲', lat: 2, lng: 102, year: 1407,
        // 马六甲 → 锡兰：穿马六甲海峡，横渡印度洋
        waypoints: [[3, 98], [5, 92], [6, 84]] },
      { name: '锡兰（斯里兰卡）', lat: 7, lng: 80, year: 1407 },
      { name: '科泽科德（印度）', lat: 11, lng: 76, year: 1409 },
      { name: '马尔代夫', lat: 4, lng: 73, year: 1411,
        // 马尔代夫 → 波斯湾：沿印度西海岸北上，经阿拉伯海
        waypoints: [[8, 74], [13, 73], [18, 70], [22, 63], [25, 57]] },
      { name: '波斯湾', lat: 27, lng: 51, year: 1413 },
      { name: '霍尔木兹', lat: 27, lng: 56, year: 1413,
        // 霍尔木兹 → 亚丁：出波斯湾，沿阿拉伯半岛南海岸
        waypoints: [[25, 58], [23, 60], [18, 57], [14, 50], [13, 46]] },
      { name: '亚丁（也门）', lat: 13, lng: 44, year: 1415,
        // 亚丁 → 马林迪：沿非洲东海岸南下
        waypoints: [[11, 44], [8, 47], [4, 44], [0, 41]] },
      { name: '马林迪（肯尼亚）', lat: -3, lng: 40, year: 1415,
        // 马林迪 → 摩加迪沙：沿非洲东海岸北上
        waypoints: [[0, 41]] },
      { name: '摩加迪沙', lat: 2, lng: 45, year: 1415 },
    ]
  },
  {
    id: 'dias',
    name: '迪亚士',
    nameEn: 'Bartolomeu Dias',
    country: '葡萄牙',
    color: '#00cc66',
    routes: [
      { name: '里斯本', lat: 38.7, lng: -9.1, year: 1488 },
      { name: '博哈多尔角', lat: 26, lng: -15, year: 1488 },
      { name: '刚果河口', lat: -6, lng: 12, year: 1488 },
      { name: '好望角', lat: -34.35, lng: 18.47, year: 1488 },
      { name: '莫塞尔湾', lat: -34, lng: 23, year: 1488 },
    ]
  },
  {
    id: 'dagama',
    name: '达伽马',
    nameEn: 'Vasco da Gama',
    country: '葡萄牙',
    color: '#00ff88',
    routes: [
      { name: '里斯本', lat: 38.7, lng: -9.1, year: 1497 },
      { name: '佛得角群岛', lat: 15, lng: -24, year: 1497 },
      { name: '好望角', lat: -34.35, lng: 18.47, year: 1497,
        waypoints: [[-10, -10], [-25, 5], [-32, 15]] },
      { name: '马林迪', lat: -3, lng: 40, year: 1498,
        waypoints: [[-30, 32], [-15, 38], [-8, 40]] },
      { name: '蒙巴萨', lat: -4, lng: 40, year: 1498 },
      { name: '科泽科德（印度）', lat: 11.25, lng: 75.77, year: 1498,
        waypoints: [[0, 45], [5, 55], [8, 68]] },
    ]
  },
  {
    id: 'cabral',
    name: '卡布拉尔',
    nameEn: 'Pedro Álvares Cabral',
    country: '葡萄牙',
    color: '#33cc99',
    routes: [
      { name: '里斯本', lat: 38.7, lng: -9.1, year: 1500 },
      { name: '巴西（圣埃斯皮里图）', lat: -20, lng: -40, year: 1500 },
      { name: '好望角', lat: -34.35, lng: 18.47, year: 1500,
        waypoints: [[-30, -20], [-35, 0], [-35, 12]] },
      { name: '马达加斯加', lat: -20, lng: 47, year: 1500,
        waypoints: [[-30, 30], [-25, 40]] },
    ]
  },
  {
    id: 'albuquerque',
    name: '阿布克尔克',
    nameEn: 'Afonso de Albuquerque',
    country: '葡萄牙',
    color: '#22aa77',
    routes: [
      { name: '里斯本', lat: 38.7, lng: -9.1, year: 1509,
        waypoints: [[35, -8], [15, -18], [-5, -5], [-33, 15]] },
      { name: '索科特拉岛', lat: 12, lng: 54, year: 1507,
        waypoints: [[-34, 22], [-20, 38], [-5, 45], [5, 50]] },
      { name: '马达加斯加', lat: -20, lng: 47, year: 1507 },
      { name: '马六甲', lat: 2.25, lng: 102.25, year: 1509,
        waypoints: [[-15, 50], [-5, 60], [0, 75], [2, 90]] },
      { name: '果阿（印度）', lat: 15.47, lng: 73.83, year: 1510,
        waypoints: [[3, 95], [5, 85], [10, 76]] },
      { name: '霍尔木兹', lat: 27, lng: 56, year: 1510,
        waypoints: [[18, 70], [22, 63], [25, 58]] },
    ]
  },
  {
    id: 'columbus',
    name: '哥伦布',
    nameEn: 'Christopher Columbus',
    country: '西班牙',
    color: '#ffaa00',
    routes: [
      { name: '帕洛斯港（西班牙）', lat: 37, lng: -6, year: 1492 },
      { name: '加那利群岛', lat: 28, lng: -15, year: 1492 },
      { name: '圣萨尔瓦多（巴哈马）', lat: 24, lng: -74, year: 1492 },
      { name: '古巴', lat: 22, lng: -84, year: 1492 },
      { name: '海地', lat: 19, lng: -72, year: 1492 },
      { name: '多米尼加', lat: 15, lng: -61, year: 1493 },
      { name: '安提瓜', lat: 17, lng: -61, year: 1493 },
      { name: '波多黎各', lat: 18, lng: -66, year: 1493 },
      { name: '特立尼达岛', lat: 11, lng: -61, year: 1498 },
      { name: '委内瑞拉', lat: 10, lng: -64, year: 1498 },
      { name: '洪都拉斯', lat: 16, lng: -86, year: 1502,
        waypoints: [[12, -68], [14, -78], [16, -84]] },
      { name: '尼加拉瓜', lat: 12, lng: -84, year: 1502 },
      { name: '哥斯达黎加', lat: 9, lng: -83, year: 1502 },
      { name: '巴拿马', lat: 8, lng: -77, year: 1502 },
    ]
  },
  {
    id: 'magellan',
    name: '麦哲伦',
    nameEn: 'Ferdinand Magellan',
    country: '西班牙',
    color: '#ff8800',
    routes: [
      { name: '塞维利亚', lat: 37, lng: -6, year: 1519 },
      { name: '里奥德拉普拉塔', lat: -35, lng: -57, year: 1519,
        waypoints: [[30, -12], [15, -20], [0, -30], [-20, -40]] },
      { name: '圣胡利安港', lat: -49, lng: -68, year: 1520 },
      { name: '麦哲伦海峡', lat: -53, lng: -70, year: 1520 },
      { name: '关岛', lat: 14, lng: 144, year: 1521,
        waypoints: [[-45, -80], [-30, -90], [-10, -100], [0, -120], [5, -150], [10, -180], [12, 160]] },
      { name: '宿务岛', lat: 10, lng: 124, year: 1521 },
      { name: '麦克丹岛（遇难地）', lat: 10, lng: 125, year: 1521 },
      { name: '摩鹿加群岛', lat: 0, lng: 128, year: 1521 },
    ]
  },
  {
    id: 'balboa',
    name: '巴尔沃亚',
    nameEn: 'Vasco Núñez de Balboa',
    country: '西班牙',
    color: '#ffcc00',
    routes: [
      { name: '西班牙', lat: 37, lng: -6, year: 1513 },
      { name: '巴拿马太平洋海岸', lat: 8, lng: -77, year: 1513,
        waypoints: [[30, -12], [20, -30], [15, -60], [10, -75]] },
    ]
  },
  {
    id: 'cortes',
    name: '科尔特斯',
    nameEn: 'Hernán Cortés',
    country: '西班牙',
    color: '#ee9900',
    routes: [
      { name: '古巴', lat: 22, lng: -84, year: 1519 },
      { name: '韦拉克鲁斯（墨西哥）', lat: 19, lng: -96, year: 1519 },
      { name: '墨西哥城', lat: 19.4, lng: -99.1, year: 1521 },
      { name: '下加利福尼亚', lat: 27, lng: -112, year: 1532,
        waypoints: [[19, -105], [22, -108], [25, -110]] },
    ]
  },
  {
    id: 'pizarro',
    name: '皮萨罗',
    nameEn: 'Francisco Pizarro',
    country: '西班牙',
    color: '#dd8800',
    routes: [
      { name: '巴拿马', lat: 8, lng: -77, year: 1532 },
      { name: '秘鲁派塔', lat: -5, lng: -81, year: 1532 },
      { name: '利马', lat: -12, lng: -77, year: 1535 },
      { name: '智利沿海', lat: -30, lng: -71, year: 1535 },
    ]
  },
  {
    id: 'orellana',
    name: '奥雷利亚纳',
    nameEn: 'Francisco de Orellana',
    country: '西班牙',
    color: '#cc7700',
    routes: [
      { name: '厄瓜多尔', lat: -2, lng: -80, year: 1541 },
      { name: '亚马逊河口', lat: 0, lng: -50, year: 1541 },
    ]
  },
  {
    id: 'ponce',
    name: '庞塞·德·莱昂',
    nameEn: 'Juan Ponce de León',
    country: '西班牙',
    color: '#ffbb33',
    routes: [
      { name: '波多黎各', lat: 18, lng: -66, year: 1513 },
      { name: '佛罗里达', lat: 27, lng: -82, year: 1513,
        waypoints: [[20, -70], [24, -78]] },
    ]
  },
  {
    id: 'cabot',
    name: '约翰·卡伯特',
    nameEn: 'John Cabot',
    country: '英国',
    color: '#4488ff',
    routes: [
      { name: '布里斯托尔', lat: 51, lng: -2, year: 1497 },
      { name: '纽芬兰岛', lat: 47, lng: -53, year: 1497 },
    ]
  },
  {
    id: 'drake',
    name: '德雷克',
    nameEn: 'Francis Drake',
    country: '英国',
    color: '#2266dd',
    routes: [
      { name: '普利茅斯', lat: 50, lng: -4, year: 1577 },
      { name: '火地岛', lat: -55, lng: -68, year: 1578,
        waypoints: [[40, -12], [20, -20], [0, -28], [-30, -45], [-48, -62]] },
      { name: '智利沿海', lat: -33, lng: -71, year: 1578,
        waypoints: [[-50, -75], [-42, -74]] },
      { name: '菲律宾', lat: 14, lng: 121, year: 1579,
        waypoints: [[-20, -80], [-5, -90], [0, -110], [5, -140], [10, -170], [12, 160], [13, 135]] },
      { name: '摩鹿加群岛', lat: 0, lng: 128, year: 1579 },
      { name: '好望角', lat: -34.35, lng: 18.47, year: 1580,
        waypoints: [[-5, 115], [-10, 100], [-15, 80], [-20, 60], [-28, 35], [-33, 20]] },
      { name: '普利茅斯（返回）', lat: 50, lng: -4, year: 1580,
        waypoints: [[-30, 10], [-15, -5], [10, -15], [35, -10]] },
    ]
  },
  {
    id: 'hudson',
    name: '哈得逊',
    nameEn: 'Henry Hudson',
    country: '英国',
    color: '#5599ff',
    routes: [
      { name: '英格兰', lat: 51, lng: 0, year: 1609 },
      { name: '哈得逊河（纽约）', lat: 40, lng: -74, year: 1609 },
      { name: '哈得逊湾', lat: 60, lng: -85, year: 1610,
        waypoints: [[43, -68], [48, -60], [55, -65], [58, -75]] },
    ]
  },
  {
    id: 'baffin',
    name: '巴芬',
    nameEn: 'William Baffin',
    country: '英国',
    color: '#77aaff',
    routes: [
      { name: '英格兰', lat: 51, lng: 0, year: 1615 },
      { name: '巴芬岛', lat: 67, lng: -65, year: 1616,
        waypoints: [[55, -10], [58, -25], [60, -40], [63, -55]] },
      { name: '巴芬湾', lat: 70, lng: -65, year: 1616 },
    ]
  },
  {
    id: 'cook',
    name: '库克船长',
    nameEn: 'James Cook',
    country: '英国',
    color: '#3377ee',
    routes: [
      { name: '普利茅斯', lat: 50, lng: -4, year: 1768 },
      { name: '合恩角', lat: -56, lng: -67, year: 1769,
        waypoints: [[40, -12], [20, -22], [0, -30], [-30, -45], [-50, -63]] },
      { name: '塔希提岛', lat: -17, lng: -149, year: 1769,
        waypoints: [[-50, -80], [-40, -100], [-25, -130]] },
      { name: '新西兰', lat: -41, lng: 174, year: 1769 },
      { name: '植物学湾（澳大利亚）', lat: -34, lng: 151, year: 1770 },
      { name: '南极圈附近', lat: -71, lng: 0, year: 1773,
        waypoints: [[-40, 140], [-55, 100], [-65, 50]] },
      { name: '新喀里多尼亚', lat: -22, lng: 166, year: 1774,
        waypoints: [[-65, 50], [-50, 100], [-35, 140], [-25, 160]] },
      { name: '夏威夷', lat: 21, lng: -158, year: 1778,
        waypoints: [[-15, 175], [0, -175], [10, -165]] },
      { name: '白令海峡', lat: 65, lng: -168, year: 1778,
        waypoints: [[35, -160], [50, -165], [60, -168]] },
      { name: '阿拉斯加', lat: 60, lng: -147, year: 1778 },
      { name: '夏威夷（遇难地）', lat: 19, lng: -155, year: 1779,
        waypoints: [[50, -150], [35, -155], [25, -157]] },
    ]
  },
  {
    id: 'janszoon',
    name: '威廉·詹森',
    nameEn: 'Willem Janszoon',
    country: '荷兰',
    color: '#ff6600',
    routes: [
      { name: '荷兰', lat: 52, lng: 5, year: 1605 },
      { name: '澳大利亚约克角', lat: -11, lng: 142, year: 1606,
        waypoints: [[45, -2], [35, -8], [15, -18], [-5, -5], [-33, 18], [-30, 35], [-15, 55], [-5, 75], [-8, 100], [-10, 120], [-10, 135]] },
    ]
  },
  {
    id: 'tasman',
    name: '塔斯曼',
    nameEn: 'Abel Tasman',
    country: '荷兰',
    color: '#ff8833',
    routes: [
      { name: '巴达维亚（雅加达）', lat: -6, lng: 107, year: 1642 },
      { name: '塔斯马尼亚', lat: -40, lng: 147, year: 1642,
        waypoints: [[-10, 110], [-20, 115], [-30, 125], [-38, 140]] },
      { name: '新西兰', lat: -41, lng: 174, year: 1642 },
      { name: '斐济', lat: -18, lng: 178, year: 1643 },
      { name: '澳大利亚北海岸', lat: -12, lng: 136, year: 1644,
        waypoints: [[-15, 165], [-12, 150]] },
    ]
  },
  {
    id: 'verrazzano',
    name: '韦拉扎诺',
    nameEn: 'Giovanni da Verrazzano',
    country: '法国',
    color: '#cc44ff',
    routes: [
      { name: '法国', lat: 47, lng: -1, year: 1524 },
      { name: '北卡罗来纳', lat: 36, lng: -76, year: 1524 },
      { name: '纽约港', lat: 41, lng: -74, year: 1524 },
      { name: '纽芬兰', lat: 43, lng: -54, year: 1524 },
    ]
  },
  {
    id: 'bougainville',
    name: '布干维尔',
    nameEn: 'Louis Antoine de Bougainville',
    country: '法国',
    color: '#aa33ee',
    routes: [
      { name: '法国', lat: 47, lng: -1, year: 1766 },
      { name: '里奥德拉普拉塔', lat: -35, lng: -57, year: 1767,
        waypoints: [[40, -8], [25, -18], [10, -25], [-10, -32], [-25, -42]] },
      { name: '麦哲伦海峡', lat: -53, lng: -70, year: 1767 },
      { name: '塔希提岛', lat: -17, lng: -149, year: 1768,
        waypoints: [[-48, -78], [-35, -90], [-25, -120]] },
      { name: '萨摩亚', lat: -14, lng: -171, year: 1768 },
      { name: '法国（返回）', lat: 47, lng: -1, year: 1769,
        waypoints: [[-10, -175], [-5, 155], [-8, 120], [-10, 90], [-20, 60], [-33, 20], [-15, -5], [20, -15], [40, -8]] },
    ]
  },
];

export const countryColors = {
  '中国': '#ff4444',
  '葡萄牙': '#00cc66',
  '西班牙': '#ffaa00',
  '英国': '#4488ff',
  '荷兰': '#ff6600',
  '法国': '#aa33ee',
};

export default explorers;
