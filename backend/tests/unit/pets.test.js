const { Pet, UserPet, PetMaterial } = require('../../src/models');
const PetService = require('../../src/services/petService');

// Mock数据
const mockPet = {
  id: 1,
  key: 'cat_gray',
  name: '灰猫',
  type: 'cat',
  eggType: 'egg_common',
  potionType: 'potion_common',
  rarity: 'common',
  baseStats: { strength: 5, intelligence: 3 },
  maxLevel: 20
};

const mockUserPet = {
  id: 1,
  userId: 1,
  petId: 1,
  isOwned: true,
  isActive: false,
  level: 1,
  currentExp: 0,
  stats: { strength: 5, intelligence: 3 },
  addExperience: jest.fn(),
  getExpToNextLevel: jest.fn(() => 100),
  getTotalStats: jest.fn(() => ({ strength: 5, intelligence: 3 })),
  save: jest.fn()
};

describe('Pet Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPets', () => {
    it('应该返回所有宠物', async () => {
      const mockPets = [mockPet];
      Pet.findAll = jest.fn().mockResolvedValue(mockPets);

      const result = await PetService.getAllPets();

      expect(Pet.findAll).toHaveBeenCalledWith({
        order: [
          ['rarity', 'ASC'],
          ['type', 'ASC'],
          ['id', 'ASC']
        ]
      });
      expect(result).toEqual(mockPets);
    });
  });

  describe('getPetById', () => {
    it('应该返回指定ID的宠物', async () => {
      Pet.findByPk = jest.fn().mockResolvedValue(mockPet);

      const result = await PetService.getPetById(1);

      expect(Pet.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPet);
    });
  });

  describe('getUserPets', () => {
    it('应该返回用户的所有宠物', async () => {
      const mockUserPets = [mockUserPet];
      UserPet.findByUser = jest.fn().mockResolvedValue(mockUserPets);

      const result = await PetService.getUserPets(1);

      expect(UserPet.findByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUserPets);
    });
  });

  describe('getUserOwnedPets', () => {
    it('应该返回用户已拥有的宠物', async () => {
      const mockUserPets = [mockUserPet];
      UserPet.findOwnedByUser = jest.fn().mockResolvedValue(mockUserPets);

      const result = await PetService.getUserOwnedPets(1);

      expect(UserPet.findOwnedByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUserPets);
    });
  });

  describe('hatchPet', () => {
    it('应该成功孵化宠物', async () => {
      Pet.findByPk = jest.fn().mockResolvedValue(mockPet);
      UserPet.findOne = jest.fn().mockResolvedValue(null);
      PetMaterial.hasMaterial = jest.fn().mockResolvedValue(true);
      PetMaterial.consumeMaterial = jest.fn().mockResolvedValue(true);
      UserPet.create = jest.fn().mockResolvedValue(mockUserPet);
      UserPet.findByPk = jest.fn().mockResolvedValue(mockUserPet);

      const result = await PetService.hatchPet(1, 1);

      expect(Pet.findByPk).toHaveBeenCalledWith(1);
      expect(PetMaterial.hasMaterial).toHaveBeenCalledWith(1, 'egg_common', 1);
      expect(PetMaterial.consumeMaterial).toHaveBeenCalledWith(1, 'egg_common', 1);
      expect(UserPet.create).toHaveBeenCalledWith({
        userId: 1,
        petId: 1,
        isOwned: true,
        level: 1,
        currentExp: 0,
        stats: mockPet.baseStats
      });
    });

    it('应该抛出错误当宠物不存在', async () => {
      Pet.findByPk = jest.fn().mockResolvedValue(null);

      await expect(PetService.hatchPet(1, 999)).rejects.toThrow('宠物不存在');
    });

    it('应该抛出错误当用户已经拥有该宠物', async () => {
      Pet.findByPk = jest.fn().mockResolvedValue(mockPet);
      UserPet.findOne = jest.fn().mockResolvedValue({ ...mockUserPet, isOwned: true });

      await expect(PetService.hatchPet(1, 1)).rejects.toThrow('已经拥有该宠物');
    });

    it('应该抛出错误当缺少孵化材料', async () => {
      Pet.findByPk = jest.fn().mockResolvedValue(mockPet);
      UserPet.findOne = jest.fn().mockResolvedValue(null);
      PetMaterial.hasMaterial = jest.fn().mockResolvedValue(false);

      await expect(PetService.hatchPet(1, 1)).rejects.toThrow('缺少孵化材料');
    });
  });

  describe('feedPet', () => {
    it('应该成功喂养宠物', async () => {
      const mockPetWithUser = { ...mockUserPet, pet: mockPet };
      UserPet.findOne = jest.fn().mockResolvedValue(mockPetWithUser);
      PetMaterial.hasMaterial = jest.fn().mockResolvedValue(true);
      PetMaterial.consumeMaterial = jest.fn().mockResolvedValue(true);
      mockPetWithUser.addExperience = jest.fn().mockResolvedValue({ leveledUp: false, newLevel: 1 });

      const result = await PetService.feedPet(1, 1, 10);

      expect(UserPet.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1, isOwned: true },
        include: ['pet']
      });
      expect(PetMaterial.hasMaterial).toHaveBeenCalledWith(1, 'potion_common', 1);
      expect(PetMaterial.consumeMaterial).toHaveBeenCalledWith(1, 'potion_common', 1);
      expect(mockPetWithUser.addExperience).toHaveBeenCalledWith(10);
    });

    it('应该抛出错误当宠物不存在', async () => {
      UserPet.findOne = jest.fn().mockResolvedValue(null);

      await expect(PetService.feedPet(1, 999, 10)).rejects.toThrow('宠物不存在或未拥有');
    });
  });

  describe('equipPet', () => {
    it('应该成功装备宠物', async () => {
      const mockActivatedPet = { ...mockUserPet, isActive: true };
      UserPet.activatePet = jest.fn().mockResolvedValue(mockActivatedPet);

      const result = await PetService.equipPet(1, 1);

      expect(UserPet.activatePet).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockActivatedPet);
    });
  });

  describe('getCollectionProgress', () => {
    it('应该返回正确的收集进度', async () => {
      UserPet.getCollectionProgress = jest.fn().mockResolvedValue({
        total: 10,
        owned: 5,
        percentage: 50
      });

      const result = await PetService.getCollectionProgress(1);

      expect(UserPet.getCollectionProgress).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        total: 10,
        owned: 5,
        percentage: 50
      });
    });
  });
});

describe('Pet Model', () => {
  describe('validation', () => {
    it('应该验证稀有度值', async () => {
      const pet = Pet.build({
        key: 'test_pet',
        name: '测试宠物',
        type: 'cat',
        rarity: 'invalid'
      });

      await expect(pet.validate()).rejects.toThrow();
    });

    it('应该验证类型值', async () => {
      const pet = Pet.build({
        key: 'test_pet',
        name: '测试宠物',
        type: 'invalid',
        rarity: 'common'
      });

      await expect(pet.validate()).rejects.toThrow();
    });

    it('应该验证基础属性格式', async () => {
      const pet = Pet.build({
        key: 'test_pet',
        name: '测试宠物',
        type: 'cat',
        rarity: 'common',
        baseStats: { invalid: 100 }
      });

      await expect(pet.validate()).rejects.toThrow();
    });
  });
});

describe('UserPet Model', () => {
  describe('getExpToNextLevel', () => {
    it('应该正确计算升级所需经验', () => {
      const userPet = UserPet.build({ level: 1 });
      const expNeeded = userPet.getExpToNextLevel();

      expect(expNeeded).toBe(100);
    });

    it('应该随着等级增加而增加所需经验', () => {
      const userPet = UserPet.build({ level: 2 });
      const expNeeded = userPet.getExpToNextLevel();

      expect(expNeeded).toBe(150);
    });
  });
});
