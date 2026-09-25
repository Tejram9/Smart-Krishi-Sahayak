export {};
const { IRRIGATION_TYPES, filterIrrigation } = require('../src/main/resources/static/js/equipment-irrigation-data.js');

describe('Irrigation Guide - Types, Specifications and Filtering', () => {
  const REQUIRED_IRRIGATION_IDS = [
    'drip',
    'sprinkler',
    'surface-flood',
    'furrow',
    'rain-gun',
    'micro-irrigation'
  ];

  test('should contain exactly all 6 required irrigation methods', () => {
    const ids = IRRIGATION_TYPES.map((i: any) => i.id);
    for (const requiredId of REQUIRED_IRRIGATION_IDS) {
      expect(ids).toContain(requiredId);
    }
  });

  test('should have exact primary irrigation categories matching specification', () => {
    const expectedPrimaryCategories = [
      'Drip Irrigation',
      'Sprinkler Irrigation',
      'Surface/Flood Irrigation',
      'Furrow Irrigation',
      'Rain Gun Irrigation',
      'Micro-Irrigation'
    ];
    const actualNames = IRRIGATION_TYPES.map((i: any) => i.name.en);
    expect(actualNames).toEqual(expectedPrimaryCategories);
  });

  test('should clearly label subtypes including Sub-Surface Drip and Micro-Sprinklers', () => {
    const drip = IRRIGATION_TYPES.find((i: any) => i.id === 'drip');
    expect(drip.subtypes).toBeDefined();
    expect(drip.subtypes.en).toContain('Sub-Surface Drip (SDI)');

    const micro = IRRIGATION_TYPES.find((i: any) => i.id === 'micro-irrigation');
    expect(micro.subtypes).toBeDefined();
    expect(micro.subtypes.en).toContain('Micro-Sprinklers');
  });

  REQUIRED_IRRIGATION_IDS.forEach(id => {
    describe(`Irrigation Method: ${id}`, () => {
      let item: any;

      beforeAll(() => {
        item = IRRIGATION_TYPES.find((i: any) => i.id === id);
      });

      test('should have localized name and icon', () => {
        expect(item).toBeDefined();
        expect(item.name.en).toBeTruthy();
        expect(item.name.mr).toBeTruthy();
        expect(item.name.hi).toBeTruthy();
        expect(item.image).toContain('<svg');
      });

      test('should explain how it works in EN, MR, and HI', () => {
        expect(item.howItWorks.en.length).toBeGreaterThan(25);
        expect(item.howItWorks.mr.length).toBeGreaterThan(25);
        expect(item.howItWorks.hi.length).toBeGreaterThan(25);
      });

      test('should specify suitable crops list', () => {
        expect(Array.isArray(item.suitableCrops.en)).toBe(true);
        expect(item.suitableCrops.en.length).toBeGreaterThanOrEqual(2);
        expect(item.suitableCrops.mr.length).toBeGreaterThanOrEqual(2);
        expect(item.suitableCrops.hi.length).toBeGreaterThanOrEqual(2);
      });

      test('should specify suitable soil types', () => {
        expect(item.suitableSoil.en).toBeTruthy();
        expect(item.suitableSoil.mr).toBeTruthy();
        expect(item.suitableSoil.hi).toBeTruthy();
      });

      test('should specify authentic water efficiency and requirement percentages', () => {
        expect(item.waterRequirementEfficiency).toBeDefined();
        expect(item.waterRequirementEfficiency.efficiencyPercent).toMatch(/\d+%/);
        expect(item.waterRequirementEfficiency.waterSavingPercent).toBeTruthy();
        expect(item.waterRequirementEfficiency.operatingPressure).toBeTruthy();
        expect(item.waterRequirementEfficiency.details.en).toBeTruthy();
        expect(item.waterRequirementEfficiency.details.mr).toBeTruthy();
        expect(item.waterRequirementEfficiency.details.hi).toBeTruthy();
      });

      test('should specify key advantages', () => {
        expect(Array.isArray(item.advantages.en)).toBe(true);
        expect(item.advantages.en.length).toBeGreaterThanOrEqual(3);
        expect(item.advantages.mr.length).toBeGreaterThanOrEqual(3);
        expect(item.advantages.hi.length).toBeGreaterThanOrEqual(3);
      });

      test('should specify key limitations', () => {
        expect(Array.isArray(item.limitations.en)).toBe(true);
        expect(item.limitations.en.length).toBeGreaterThanOrEqual(2);
        expect(item.limitations.mr.length).toBeGreaterThanOrEqual(2);
        expect(item.limitations.hi.length).toBeGreaterThanOrEqual(2);
      });

      test('should list basic physical system components', () => {
        expect(Array.isArray(item.basicComponents)).toBe(true);
        expect(item.basicComponents.length).toBeGreaterThanOrEqual(2);

        item.basicComponents.forEach((comp: any) => {
          expect(comp.name.en).toBeTruthy();
          expect(comp.name.mr).toBeTruthy();
          expect(comp.name.hi).toBeTruthy();
          expect(comp.purpose.en).toBeTruthy();
        });
      });

      test('should specify maintenance routine', () => {
        expect(Array.isArray(item.maintenance.en)).toBe(true);
        expect(item.maintenance.en.length).toBeGreaterThanOrEqual(2);
        expect(item.maintenance.mr.length).toBeGreaterThanOrEqual(2);
        expect(item.maintenance.hi.length).toBeGreaterThanOrEqual(2);
      });

      test('should specify when to choose this method', () => {
        expect(item.whenToChooseIt.en).toBeTruthy();
        expect(item.whenToChooseIt.mr).toBeTruthy();
        expect(item.whenToChooseIt.hi).toBeTruthy();
      });

      test('should cite authoritative agriculture sources (PMKSY, ICAR, IARI, CSSRI, MahaKrishi, or BIS)', () => {
        expect(item.authoritativeSource).toBeDefined();
        expect(item.authoritativeSource.institution.en).toBeTruthy();
        expect(item.authoritativeSource.referenceDocument.en).toBeTruthy();
        expect(item.authoritativeSource.portalUrl).toMatch(/^https:\/\//);
      });

      test('should clearly mark site-dependent / unavailable engineering parameters instead of guessing', () => {
        expect(item.unavailableInfoNotice).toBeDefined();
        expect(item.unavailableInfoNotice.en.length).toBeGreaterThan(20);
        expect(item.unavailableInfoNotice.mr.length).toBeGreaterThan(20);
        expect(item.unavailableInfoNotice.hi.length).toBeGreaterThan(20);
      });
    });
  });

  describe('Irrigation Filtering and Search', () => {
    test('should search by keyword (e.g., "Drip")', () => {
      const results = filterIrrigation(IRRIGATION_TYPES, 'Drip', 'all');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].id).toBe('drip');
    });

    test('should search by Marathi term (e.g., "तुषार")', () => {
      const results = filterIrrigation(IRRIGATION_TYPES, 'तुषार', 'all');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((r: any) => r.id === 'sprinkler')).toBe(true);
    });

    test('should filter by category (e.g., "micro")', () => {
      const results = filterIrrigation(IRRIGATION_TYPES, '', 'micro');
      expect(results.length).toBe(2); // Drip, Micro-Irrigation
      const ids = results.map((r: any) => r.id);
      expect(ids).toContain('drip');
      expect(ids).toContain('micro-irrigation');
    });

    test('should filter by traditional category', () => {
      const results = filterIrrigation(IRRIGATION_TYPES, '', 'traditional');
      expect(results.length).toBe(2); // Surface Flood, Furrow
      const ids = results.map((r: any) => r.id);
      expect(ids).toContain('surface-flood');
      expect(ids).toContain('furrow');
    });

    test('should find primary irrigation category when searching by subtype name', () => {
      const results = filterIrrigation(IRRIGATION_TYPES, 'Sub-Surface', 'all');
      expect(results.some((r: any) => r.id === 'drip')).toBe(true);

      const microResults = filterIrrigation(IRRIGATION_TYPES, 'Micro-Sprinklers', 'all');
      expect(microResults.some((r: any) => r.id === 'micro-irrigation')).toBe(true);
    });

    test('should filter by specific primary category ID', () => {
      const dripOnly = filterIrrigation(IRRIGATION_TYPES, '', 'drip');
      expect(dripOnly.length).toBe(1);
      expect(dripOnly[0].id).toBe('drip');

      const furrowOnly = filterIrrigation(IRRIGATION_TYPES, '', 'furrow');
      expect(furrowOnly.length).toBe(1);
      expect(furrowOnly[0].id).toBe('furrow');
    });
  });
});
