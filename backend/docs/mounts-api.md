# 坐骑系统 API 文档

## 概述
坐骑系统是宠物系统的扩展功能，允许用户将特定宠物驯服为坐骑，并进行装备、升级等操作。

## API端点

### 1. 获取可成为坐骑的宠物列表
获取所有可以驯服为坐骑的宠物定义。

**请求**
```
GET /api/pets/mountable
```

**响应**
```json
{
  "success": true,
  "data": {
    "pets": [
      {
        "id": 1,
        "key": "flame_dragon",
        "name": "火焰龙",
        "type": "dragon",
        "canBeMount": true,
        "mountType": "flying",
        "baseMountSpeed": 150,
        "mountDescription": "传说中的火焰龙，拥有炽热的火焰之力",
        "rarity": "legendary"
      }
    ]
  }
}
```

### 2. 获取用户的坐骑列表
获取用户已驯服的所有坐骑。

**请求**
```
GET /api/pets/mounts
```

**响应**
```json
{
  "success": true,
  "data": {
    "mounts": [
      {
        "id": 1,
        "petId": 1,
        "petName": "火焰龙",
        "petKey": "flame_dragon",
        "mountLevel": 5,
        "mountExp": 1200,
        "mountExpToNextLevel": 2457,
        "mountEquipped": true,
        "totalMountSpeed": 175,
        "mountStamina": 85,
        "mountType": "flying",
        "petImageUrl": "/images/pets/flame_dragon.png"
      }
    ]
  }
}
```

### 3. 获取用户的坐骑统计
获取用户坐骑的统计信息。

**请求**
```
GET /api/pets/mounts/stats
```

**响应**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalMounts": 3,
      "equippedMount": {
        "id": 1,
        "petName": "火焰龙",
        "mountLevel": 5,
        "totalMountSpeed": 175
      },
      "byType": {
        "land": 1,
        "flying": 1,
        "aquatic": 0,
        "magical": 1
      },
      "byRarity": {
        "common": 0,
        "uncommon": 1,
        "rare": 1,
        "epic": 0,
        "legendary": 1
      },
      "totalSpeed": 425
    }
  }
}
```

### 4. 获取可驯服的宠物
获取用户已拥有且可驯服为坐骑的宠物列表。

**请求**
```
GET /api/pets/mounts/tamable
```

**响应**
```json
{
  "success": true,
  "data": {
    "pets": [
      {
        "id": 2,
        "level": 8,
        "currentExp": 450,
        "pet": {
          "id": 3,
          "key": "frost_wolf",
          "name": "冰霜狼",
          "canBeMount": true,
          "mountType": "land"
        }
      }
    ]
  }
}
```

### 5. 驯服宠物为坐骑
将符合条件的宠物驯服为坐骑。

**请求**
```
POST /api/pets/mounts/tame
```

**请求体**
```json
{
  "userPetId": 2
}
```

**响应**
```json
{
  "success": true,
  "message": "Pet successfully tamed as mount",
  "data": {
    "success": true,
    "mountInfo": {
      "id": 2,
      "petName": "冰霜狼",
      "mountLevel": 1,
      "totalMountSpeed": 120
    }
  }
}
```

### 6. 装备坐骑
装备指定的坐骑。

**请求**
```
POST /api/pets/mounts/equip
```

**请求体**
```json
{
  "userPetId": 2
}
```

**响应**
```json
{
  "success": true,
  "message": "Mount equipped successfully",
  "data": {
    "mount": {
      "id": 2,
      "petName": "冰霜狼",
      "mountEquipped": true
    }
  }
}
```

### 7. 卸下坐骑
卸下当前装备的坐骑。

**请求**
```
POST /api/pets/mounts/unequip
```

**响应**
```json
{
  "success": true,
  "message": "Mount unequipped successfully"
}
```

### 8. 升级坐骑
为坐骑增加经验值，可能触发升级。

**请求**
```
POST /api/pets/mounts/upgrade
```

**请求体**
```json
{
  "userPetId": 2,
  "expAmount": 100
}
```

**响应**
```json
{
  "success": true,
  "message": "坐骑升级成功！",
  "data": {
    "leveledUp": true,
    "oldLevel": 4,
    "newLevel": 5,
    "mountExp": 23,
    "expToNextLevel": 3936,
    "totalSpeed": 145
  }
}
```

### 9. 检查坐骑操作资格
检查坐骑是否可以进行特定操作。

**请求**
```
GET /api/pets/mounts/:userPetId/check?action=tame
```

**参数**
- `action`: 操作类型，可选值：tame, ride, upgrade, equip

**响应**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "petName": "冰霜狼",
    "currentLevel": 8,
    "requiredMaterials": {
      "mount_taming_scroll": 3,
      "mount_essence": 1
    }
  }
}
```

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 400    | 参数错误、材料不足、等级不够等 |
| 404    | 宠物不存在、坐骑不存在 |
| 409    | 宠物已经是坐骑、坐骑已装备 |
| 500    | 服务器内部错误 |

## 坐骑类型
- **land**: 陆地坐骑
- **flying**: 飞行坐骑
- **aquatic**: 水生坐骑
- **magical**: 魔法坐骑

## 稀有度
- **common**: 普通
- **uncommon**: 稀有
- **rare**: 史诗
- **epic**: 传说
- **legendary**: 神话

## 注意事项
1. 只有等级≥5的宠物才能被驯服为坐骑
2. 驯服需要消耗特定材料：3个驯兽符 + 1个坐骑精华
3. 同一时间只能装备一个坐骑
4. 坐骑升级需要坐骑经验，可通过喂养或使用特殊道具获得
