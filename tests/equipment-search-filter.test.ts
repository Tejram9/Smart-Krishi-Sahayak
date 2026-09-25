export {};
const { EQUIPMENT_LIST, filterEquipment } = require('../src/main/resources/static/js/equipment-irrigation-data.js');

describe('Farm Equipment - Search and Filtering Tests', () => {
  test('should have 10 equipment categories defined in the library', () => {
    expect(EQUIPMENT_LIST).toBeDefined();
    expect(EQUIPMENT_LIST.length).toBe(10);
  });

  test('should return all equipment when search keyword is empty and category is all', () => {
    const results = filterEquipment(EQUIPMENT_LIST, '', 'all', 'all');
    expect(results.length).toBe(10);
  });

  test('should search equipment by English name (e.g., "Tractor")', () => {
    const results = filterEquipment(EQUIPMENT_LIST, 'Tractor', 'all', 'all');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((item: any) => item.id === 'tractor')).toBe(true);
  });

  test('should search equipment by Marathi name (e.g., "नांगर")', () => {
    const results = filterEquipment(EQUIPMENT_LIST, 'नांगर', 'all', 'all');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((item: any) => item.id === 'plough')).toBe(true);
  });

  test('should search equipment by Hindi name (e.g., "कल्टीवेटर")', () => {
    const results = filterEquipment(EQUIPMENT_LIST, 'कल्टीवेटर', 'all', 'all');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((item: any) => item.id === 'cultivator')).toBe(true);
  });

  test('should search equipment by suitable crop (e.g., "Sugarcane")', () => {
    const results = filterEquipment(EQUIPMENT_LIST, 'Sugarcane', 'all', 'all');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((item: any) => item.id === 'rotavator' || item.id === 'tractor')).toBe(true);
  });

  test('should filter equipment by category key (e.g., "tillage")', () => {
    const results = filterEquipment(EQUIPMENT_LIST, '', 'tillage', 'all');
    expect(results.length).toBe(3); // Cultivator, Rotavator, Plough
    const ids = results.map((r: any) => r.id);
    expect(ids).toContain('cultivator');
    expect(ids).toContain('rotavator');
    expect(ids).toContain('plough');
  });

  test('should filter equipment by power category (e.g., "power")', () => {
    const results = filterEquipment(EQUIPMENT_LIST, '', 'power', 'all');
    expect(results.length).toBe(2); // Tractor, Power Tiller
    const ids = results.map((r: any) => r.id);
    expect(ids).toContain('tractor');
    expect(ids).toContain('power-tiller');
  });

  test('should filter equipment by farm size (e.g., "small")', () => {
    const results = filterEquipment(EQUIPMENT_LIST, '', 'all', 'small');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item: any) => item.id === 'power-tiller')).toBe(true);
  });

  test('should filter equipment by combined search keyword and category', () => {
    const results = filterEquipment(EQUIPMENT_LIST, 'pulverization', 'tillage', 'all');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('rotavator');
  });

  test('should return empty list when no equipment matches query', () => {
    const results = filterEquipment(EQUIPMENT_LIST, 'NonExistentEquipmentXYZ123', 'all', 'all');
    expect(results.length).toBe(0);
  });
});
