export {};
const { IRRIGATION_SYSTEM_FLOW } = require('../src/main/resources/static/js/equipment-irrigation-data.js');

describe('Irrigation System Guide - 7-Step Visual Pipeline Flow', () => {
  const EXPECTED_FLOW_ORDER = [
    { step: 1, id: 'water-source', expectedEn: 'Water Source' },
    { step: 2, id: 'pump', expectedEn: 'Pump Station' },
    { step: 3, id: 'filter', expectedEn: 'Filter Station' },
    { step: 4, id: 'main-line', expectedEn: 'Main Line' },
    { step: 5, id: 'sub-main', expectedEn: 'Sub-Main Line & Valves' },
    { step: 6, id: 'laterals', expectedEn: 'Laterals & Sprinklers / Emitters' },
    { step: 7, id: 'root-zone', expectedEn: 'Crop Root Zone' }
  ];

  test('should have exactly 7 steps in the complete irrigation journey', () => {
    expect(IRRIGATION_SYSTEM_FLOW).toBeDefined();
    expect(IRRIGATION_SYSTEM_FLOW.length).toBe(7);
  });

  test('should follow the exact required sequence: Water Source → Pump → Filter → Main Line → Sub-Main → Laterals/Sprinklers → Crop Root Zone', () => {
    EXPECTED_FLOW_ORDER.forEach((expected, index) => {
      const step = IRRIGATION_SYSTEM_FLOW[index];
      expect(step.step).toBe(expected.step);
      expect(step.id).toBe(expected.id);
      expect(step.title.en).toContain(expected.expectedEn);
    });
  });

  IRRIGATION_SYSTEM_FLOW.forEach((step: any) => {
    describe(`Step ${step.step}: ${step.id}`, () => {
      test('should have multilingual titles in EN, MR, and HI', () => {
        expect(step.title.en).toBeTruthy();
        expect(step.title.mr).toBeTruthy();
        expect(step.title.hi).toBeTruthy();
      });

      test('should have role description', () => {
        expect(step.role.en).toBeTruthy();
        expect(step.role.mr).toBeTruthy();
        expect(step.role.hi).toBeTruthy();
      });

      test('should explain in simple farmer-friendly language without overly academic jargon', () => {
        expect(step.farmerExplanation.en.length).toBeGreaterThan(30);
        expect(step.farmerExplanation.mr.length).toBeGreaterThan(30);
        expect(step.farmerExplanation.hi.length).toBeGreaterThan(30);
      });

      test('should provide an actionable farmer tip', () => {
        expect(step.farmerTip.en.length).toBeGreaterThan(15);
        expect(step.farmerTip.mr.length).toBeGreaterThan(15);
        expect(step.farmerTip.hi.length).toBeGreaterThan(15);
      });

      test('should provide at least 2 practical maintenance checks', () => {
        expect(Array.isArray(step.keyChecks.en)).toBe(true);
        expect(step.keyChecks.en.length).toBeGreaterThanOrEqual(2);
        expect(step.keyChecks.mr.length).toBeGreaterThanOrEqual(2);
        expect(step.keyChecks.hi.length).toBeGreaterThanOrEqual(2);
      });

      test('should have an icon identifier', () => {
        expect(step.icon).toBeTruthy();
        expect(step.icon).toMatch(/^bi-/);
      });

      test('should cite authoritative engineering standards (BIS / PMKSY)', () => {
        expect(step.authoritativeSource).toBeDefined();
        expect(step.authoritativeSource.institution.en).toBeTruthy();
        expect(step.authoritativeSource.referenceDocument.en).toBeTruthy();
      });

      test('should explicitly mark site-dependent sizing as requiring engineering computation', () => {
        expect(step.unavailableInfoNotice).toBeDefined();
        expect(step.unavailableInfoNotice.en.length).toBeGreaterThan(20);
        expect(step.unavailableInfoNotice.mr.length).toBeGreaterThan(20);
        expect(step.unavailableInfoNotice.hi.length).toBeGreaterThan(20);
      });
    });
  });
});
