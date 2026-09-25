export {};
const { EQUIPMENT_LIST } = require('../src/main/resources/static/js/equipment-irrigation-data.js');

describe('Farm Equipment - Data Completeness & Details Specifications', () => {
  const REQUIRED_EQUIPMENT_IDS = [
    'tractor',
    'cultivator',
    'rotavator',
    'seed-drill',
    'plough',
    'sprayer',
    'power-tiller',
    'harvester',
    'water-pump',
    'thresher'
  ];

  test('should contain exactly all 10 required agricultural equipment types', () => {
    const ids = EQUIPMENT_LIST.map((e: any) => e.id);
    for (const requiredId of REQUIRED_EQUIPMENT_IDS) {
      expect(ids).toContain(requiredId);
    }
  });

  REQUIRED_EQUIPMENT_IDS.forEach(id => {
    describe(`Equipment verification: ${id}`, () => {
      let item: any;

      beforeAll(() => {
        item = EQUIPMENT_LIST.find((e: any) => e.id === id);
      });

      test('should have valid localized names in EN, MR, and HI', () => {
        expect(item).toBeDefined();
        expect(item.name.en).toBeTruthy();
        expect(item.name.mr).toBeTruthy();
        expect(item.name.hi).toBeTruthy();
      });

      test('should have an icon and visual illustration/SVG', () => {
        expect(item.icon).toBeTruthy();
        expect(item.image).toBeTruthy();
        expect(item.image).toContain('<svg');
      });

      test('should have a main purpose in EN, MR, and HI', () => {
        expect(item.mainPurpose.en.length).toBeGreaterThan(15);
        expect(item.mainPurpose.mr.length).toBeGreaterThan(15);
        expect(item.mainPurpose.hi.length).toBeGreaterThan(15);
      });

      test('should have a list of suitable crops in EN, MR, and HI', () => {
        expect(Array.isArray(item.suitableCrops.en)).toBe(true);
        expect(item.suitableCrops.en.length).toBeGreaterThanOrEqual(4);
        expect(item.suitableCrops.mr.length).toBeGreaterThanOrEqual(4);
        expect(item.suitableCrops.hi.length).toBeGreaterThanOrEqual(4);
      });

      test('should specify the best use stage', () => {
        expect(item.bestUseStage.en).toBeTruthy();
        expect(item.bestUseStage.mr).toBeTruthy();
        expect(item.bestUseStage.hi).toBeTruthy();
      });

      test('should specify basic working principle', () => {
        expect(item.basicWorking.en.length).toBeGreaterThan(25);
        expect(item.basicWorking.mr.length).toBeGreaterThan(25);
        expect(item.basicWorking.hi.length).toBeGreaterThan(25);
      });

      test('should include authentic key specifications', () => {
        expect(Array.isArray(item.keySpecifications)).toBe(true);
        expect(item.keySpecifications.length).toBeGreaterThanOrEqual(3);

        item.keySpecifications.forEach((spec: any) => {
          expect(spec.label.en).toBeTruthy();
          expect(spec.label.mr).toBeTruthy();
          expect(spec.label.hi).toBeTruthy();
          expect(spec.value.en).toBeTruthy();
          expect(spec.value.mr).toBeTruthy();
          expect(spec.value.hi).toBeTruthy();
        });
      });

      test('should include structured routine maintenance guidelines', () => {
        expect(Array.isArray(item.maintenance.en)).toBe(true);
        expect(item.maintenance.en.length).toBeGreaterThanOrEqual(3);
        expect(item.maintenance.mr.length).toBeGreaterThanOrEqual(3);
        expect(item.maintenance.hi.length).toBeGreaterThanOrEqual(3);
      });

      test('should include essential farmer safety tips', () => {
        expect(Array.isArray(item.safetyTips.en)).toBe(true);
        expect(item.safetyTips.en.length).toBeGreaterThanOrEqual(3);
        expect(item.safetyTips.mr.length).toBeGreaterThanOrEqual(3);
        expect(item.safetyTips.hi.length).toBeGreaterThanOrEqual(3);
      });

      test('should cite authoritative agriculture sources (ICAR, CIAE, CIBRC, BIS, or govt portals)', () => {
        expect(item.authoritativeSource).toBeDefined();
        expect(item.authoritativeSource.institution.en).toBeTruthy();
        expect(item.authoritativeSource.institution.mr).toBeTruthy();
        expect(item.authoritativeSource.institution.hi).toBeTruthy();
        expect(item.authoritativeSource.referenceDocument.en).toBeTruthy();
        expect(item.authoritativeSource.portalUrl).toMatch(/^https:\/\//);
      });

      test('should explicitly mark field-specific / unavailable information instead of guessing', () => {
        expect(item.unavailableInfoNotice).toBeDefined();
        expect(item.unavailableInfoNotice.en.length).toBeGreaterThan(20);
        expect(item.unavailableInfoNotice.mr.length).toBeGreaterThan(20);
        expect(item.unavailableInfoNotice.hi.length).toBeGreaterThan(20);
      });
    });
  });
});
