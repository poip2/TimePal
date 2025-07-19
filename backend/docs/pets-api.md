# 宠物系统 API 文档

## 概述
宠物系统允许用户收集、孵化和升级各种宠物。每个宠物都有独特的属性、稀有度和外观。

## 数据模型

### 宠物 (Pet)
```json
{
  "id": 1,
  "key": "cat_gray",
  "name": "灰猫",
  "type": "cat",
  "eggType": "egg_common",
  "potionType": "potion_common",
  "imageUrl": "/images/pets/cat_gray.png",
  "rarity": "common",
  "baseStats": {
    "strength": 5,
    "intelligence": 3
  },
  "maxLevel": 20,
  "description": "一只温顺的灰色小猫"
}
```

### 用户宠物 (UserPet)
```json
{
  "id": 1,
  "userId": 1,
  "petId": 1,
  "isOwned": true,
  "isActive": false,
  "level": 1,
  "currentExp": 0,
  "stats": {
    "strength": 5,
    "intelligence": 3
  },
  "lastFedTime": "2024-01-01T00:00:00.000Z",
  "isFavorite": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "pet": { ... }
}
```

### 材料 (PetMaterial)
```json
{
  "id": 1,
  "userId": 1,
  "materialType": "egg_common",
  "quantity": 5,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## API 端点

### 获取所有宠物
获取系统中所有可用的宠物。

**请求**
```
GET /api/pets
```

**响应**
```json
{
  "success": true,
  "data": {
    "pets": [
      {
        "id": 1,
        "key": "cat_gray",
        "name": "灰猫",
        "type": "cat",
        "rarity": "common",
        "imageUrl": "/images/pets/cat_gray.png"
      }
    ]
  }
}
```

### 获取用户已拥有的宠物
获取当前用户已拥有的所有宠物。

**请求**
```
GET /api/pets/owned
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "pets": [
      {
        "id": 1,
        "userId": 1,
        "petId": 1,
        "isOwned": true,
        "isActive": true,
        "level": 5,
        "currentExp": 250,
        "pet": {
          "id": 1,
          "key": "cat_gray",
          "name": "灰猫",
          "type": "cat",
          "rarity": "common"
        }
      }
    ]
  }
}
```

### 获取宠物详情
获取特定宠物的详细信息，包含用户状态。

**请求**
```
GET /api/pets/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "pet": {
      "id": 1,
      "key": "cat_gray",
      "name": "灰猫",
      "type": "cat",
      "rarity": "common",
      "baseStats": {
        "strength": 5,
        "intelligence": 3
      },
      "maxLevel": 20,
      "userStatus": {
        "isOwned": true,
        "isActive": false,
        "level": 1,
        "currentExp": 0,
        "expToNext": 100,
        "stats": {
          "strength": 5,
          "intelligence": 3
        }
      }
    }
  }
}
```

### 获取用户激活的宠物
获取当前用户激活的宠物。

**请求**
```
GET /api/pets/active
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "pet": {
      "id": 1,
      "userId": 1,
      "petId": 1,
      "isActive": true,
      "level": 3,
      "currentExp": 150,
      "pet": {
        "id": 1,
        "name": "灰猫"
      }
    }
  }
}
```

### 获取宠物图鉴进度
获取用户的宠物收集进度。

**请求**
```
GET /api/pets/collection-progress
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "progress": {
      "total": 12,
      "owned": 5,
      "percentage": 42
    }
  }
}
```

### 获取用户稀有度统计
获取用户按稀有度分类的宠物统计。

**请求**
```
GET /api/pets/rarity-stats
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "stats": {
      "common": 3,
      "uncommon": 2,
      "rare": 1,
      "epic": 0,
      "legendary": 0
    }
  }
}
```

### 获取用户材料
获取用户的所有宠物材料。

**请求**
```
GET /api/pets/materials
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "materials": [
      {
        "id": 1,
        "materialType": "egg_common",
        "quantity": 5
      },
      {
        "id": 2,
        "materialType": "potion_common",
        "quantity": 10
      }
    ]
  }
}
```

### 孵化宠物
使用材料孵化新的宠物。

**请求**
```
POST /api/pets/:id/hatch
Authorization: Bearer <token>
Content-Type: application/json

{
  "petId": 1
}
```

**响应**
```json
{
  "success": true,
  "message": "宠物孵化成功",
  "data": {
    "userPet": {
      "id": 1,
      "userId": 1,
      "petId": 1,
      "isOwned": true,
      "level": 1,
      "currentExp": 0,
      "pet": {
        "id": 1,
        "name": "灰猫"
      }
    }
  }
}
```

**错误响应**
```json
{
  "success": false,
  "message": "缺少孵化材料: egg_common"
}
```

### 喂养宠物
使用材料喂养宠物，增加经验值。

**请求**
```
POST /api/pets/:userPetId/feed
Authorization: Bearer <token>
Content-Type: application/json

{
  "foodAmount": 10
}
```

**响应**
```json
{
  "success": true,
  "message": "宠物升级了！",
  "data": {
    "result": {
      "leveledUp": true,
      "newLevel": 2,
      "oldLevel": 1,
      "pet": {
        "id": 1,
        "name": "灰猫"
      },
      "currentExp": 0,
      "expToNext": 150
    }
  }
}
```

### 装备宠物
将宠物设置为激活状态。

**请求**
```
POST /api/pets/equip
Authorization: Bearer <token>
Content-Type: application/json

{
  "userPetId": 1
}
```

**响应**
```json
{
  "success": true,
  "message": "宠物装备成功",
  "data": {
    "userPet": {
      "id": 1,
      "isActive": true
    }
  }
}
```

### 卸下宠物
取消宠物的激活状态。

**请求**
```
POST /api/pets/unequip
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "message": "宠物卸下成功",
  "data": {
    "userPet": {
      "id": 1,
      "isActive": false
    }
  }
}
```

## 稀有度系统

宠物分为以下稀有度等级：
- **common** (普通) - 基础宠物，容易获得
- **uncommon** (不常见) - 较好属性，中等获得难度
- **rare** (稀有) - 优秀属性，较难获得
- **epic** (史诗) - 卓越属性，很难获得
- **legendary** (传说) - 顶级属性，极难获得

## 材料类型

### 蛋类型
- `egg_common` - 普通蛋
- `egg_uncommon` - 不常见蛋
- `egg_rare` - 稀有蛋
- `egg_epic` - 史诗蛋
- `egg_legendary` - 传说蛋

### 药水类型
- `potion_common` - 普通药水
- `potion_uncommon` - 不常见药水
- `potion_rare` - 稀有药水
- `potion_fire` - 火属性药水
- `potion_water` - 水属性药水
- `potion_earth` - 土属性药水
- `potion_air` - 风属性药水
- `potion_light` - 光属性药水
- `potion_dark` - 暗属性药水
- `potion_mystical` - 神秘药水

## 属性系统

宠物具有以下属性：
- **strength** (力量) - 影响攻击力
- **intelligence** (智力) - 影响技能效果
- **constitution** (体质) - 影响生命值
- **perception** (感知) - 影响命中率
- **luck** (幸运) - 影响暴击率
- **speed** (速度) - 影响行动顺序

## 升级系统

宠物通过喂养获得经验值升级：
- 每级所需经验值 = 100 * (1.5 ^ (当前等级 - 1))
- 升级时属性按基础属性的百分比增长
- 最高等级由宠物稀有度决定

## 错误码

| 状态码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 409 | 冲突（如已拥有宠物） |
| 500 | 服务器内部错误 |
