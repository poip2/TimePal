# 装备系统 API 文档

## 概述
装备系统允许用户购买、装备和管理游戏装备。每个装备都有属性加成，可以影响用户的游戏状态。

## 数据模型

### Equipment (装备)
```json
{
  "id": 1,
  "key": "iron_sword",
  "name": "铁剑",
  "type": "weapon",
  "class": "warrior",
  "strengthBonus": 5,
  "intelligenceBonus": 0,
  "constitutionBonus": 2,
  "perceptionBonus": 0,
  "goldCost": 100,
  "gemCost": 0,
  "imageUrl": "https://example.com/sword.png",
  "levelRequired": 1,
  "description": "基础战士武器",
  "rarity": "common",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### UserEquipment (用户装备关系)
```json
{
  "userEquipmentId": 1,
  "isEquipped": true,
  "equippedAt": "2024-01-01T00:00:00.000Z",
  "equipment": {
    // Equipment 对象
  }
}
```

### 装备类型
- `weapon` - 武器
- `armor` - 防具
- `accessory` - 饰品
- `helmet` - 头盔
- `boots` - 靴子
- `gloves` - 手套

### 装备稀有度
- `common` - 普通
- `rare` - 稀有
- `epic` - 史诗
- `legendary` - 传奇

### 职业类型
- `warrior` - 战士
- `mage` - 法师
- `rogue` - 盗贼
- `archer` - 弓箭手

## API 端点

### 1. 获取所有装备
获取所有可用的装备列表，支持筛选。

**请求：**
```
GET /api/equipment
```

**查询参数：**
- `type` (可选): 装备类型
- `class` (可选): 适用职业
- `rarity` (可选): 稀有度
- `minLevel` (可选): 最低等级要求
- `maxLevel` (可选): 最高等级要求

**响应：**
```json
{
  "success": true,
  "data": [/* Equipment 数组 */],
  "count": 10
}
```

**示例：**
```bash
GET /api/equipment?type=weapon&rarity=rare
```

### 2. 获取单个装备详情
获取特定装备的详细信息。

**请求：**
```
GET /api/equipment/:id
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "key": "iron_sword",
    "name": "铁剑",
    "type": "weapon",
    "class": "warrior",
    "strengthBonus": 5,
    "intelligenceBonus": 0,
    "constitutionBonus": 2,
    "perceptionBonus": 0,
    "goldCost": 100,
    "gemCost": 0,
    "levelRequired": 1,
    "description": "基础战士武器",
    "rarity": "common"
  }
}
```

### 3. 获取用户已拥有装备
获取当前用户已拥有的所有装备。

**请求：**
```
GET /api/equipment/owned
```

**查询参数：**
- `type` (可选): 装备类型筛选
- `equipped` (可选): 是否已装备 (true/false)

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "userEquipmentId": 1,
      "isEquipped": true,
      "equippedAt": "2024-01-01T00:00:00.000Z",
      "id": 1,
      "key": "iron_sword",
      "name": "铁剑",
      "type": "weapon",
      "class": "warrior",
      "strengthBonus": 5,
      "constitutionBonus": 2,
      "goldCost": 100,
      "levelRequired": 1,
      "description": "基础战士武器",
      "rarity": "common"
    }
  ],
  "count": 1
}
```

### 4. 购买装备
购买指定装备。

**请求：**
```
POST /api/equipment/:id/buy
```

**响应：**
```json
{
  "success": true,
  "message": "购买成功",
  "data": {
    "userEquipmentId": 1,
    "equipment": {/* Equipment 对象 */},
    "remainingGold": 900,
    "remainingGems": 90
  }
}
```

**错误响应：**
```json
{
  "success": false,
  "message": "金币不足",
  "required": 100,
  "current": 50
}
```

### 5. 装备物品
装备已拥有的物品。

**请求：**
```
POST /api/equipment/:id/equip
```

**响应：**
```json
{
  "success": true,
  "message": "装备成功",
  "data": {
    "userEquipmentId": 1,
    "equipment": {/* Equipment 对象 */},
    "totalBonuses": {
      "strength": 15,
      "intelligence": 5,
      "constitution": 10,
      "perception": 0
    }
  }
}
```

**错误响应：**
```json
{
  "success": false,
  "message": "职业不符"
}
```

### 6. 卸下物品
卸下已装备的物品。

**请求：**
```
POST /api/equipment/:id/unequip
```

**响应：**
```json
{
  "success": true,
  "message": "卸下成功",
  "data": {
    "userEquipmentId": 1,
    "equipment": {/* Equipment 对象 */},
    "totalBonuses": {
      "strength": 5,
      "intelligence": 5,
      "constitution": 5,
      "perception": 0
    }
  }
}
```

### 7. 获取装备统计信息
获取用户的装备统计信息。

**请求：**
```
GET /api/equipment/stats
```

**响应：**
```json
{
  "success": true,
  "data": {
    "totalOwned": 5,
    "totalEquipped": 3,
    "totalTypes": [
      { "type": "weapon", "count": 2 },
      { "type": "armor", "count": 1 }
    ],
    "totalRarities": [
      { "rarity": "common", "count": 3 },
      { "rarity": "rare", "count": 2 }
    ],
    "totalBonuses": {
      "strength": 25,
      "intelligence": 10,
      "constitution": 15,
      "perception": 5
    }
  }
}
```

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200    | 请求成功 |
| 400    | 请求参数错误 |
| 401    | 未授权，需要登录 |
| 404    | 资源不存在 |
| 500    | 服务器内部错误 |

## 使用示例

### 获取所有武器
```bash
curl -X GET "http://localhost:3000/api/equipment?type=weapon"
```

### 购买装备
```bash
curl -X POST "http://localhost:3000/api/equipment/1/buy" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 装备物品
```bash
curl -X POST "http://localhost:3000/api/equipment/1/equip" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 获取用户装备
```bash
curl -X GET "http://localhost:3000/api/equipment/owned" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 注意事项

1. **职业限制**: 某些装备只能被特定职业的用户使用
2. **等级限制**: 用户必须达到装备要求的最低等级才能装备
3. **唯一装备**: 同类型装备（武器、防具等）同一时间只能装备一件
4. **资源消耗**: 购买装备会消耗用户的金币和宝石
5. **重复购买**: 已拥有的装备不能再次购买
