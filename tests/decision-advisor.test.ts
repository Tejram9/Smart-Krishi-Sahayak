export {};
const { calculateRecommendation } = require('../src/main/resources/static/js/equipment-irrigation-data.js');

describe('Decision Advisor - "Which One Should I Choose?" Guidance Engine', () => {
  test('should recommend Drip Irrigation for fruit orchards', () => {
    const result = calculateRecommendation({
      cropType: 'orchard',
      soilType: 'loamy',
      waterAvailability: 'moderate',
      farmSize: 'small'
    });

    expect(result.primaryIrrigationId).toBe('drip');
    expect(result.efficiencyBadge).toContain('95%');
    expect(result.rationale.en).toContain('orchard');
    expect(result.rationale.mr).toContain('फळबागा');
    expect(result.rationale.hi).toContain('बगीचों');
  });

  test('should recommend Sprinkler Irrigation for wheat/cereals in moderate water', () => {
    const result = calculateRecommendation({
      cropType: 'cereals',
      soilType: 'loamy',
      waterAvailability: 'moderate',
      farmSize: 'medium'
    });

    expect(result.primaryIrrigationId).toBe('sprinkler');
    expect(result.rationale.en).toContain('wheat');
  });

  test('should recommend Drip for row crops (cotton/sugarcane) when water is scarce', () => {
    const result = calculateRecommendation({
      cropType: 'row-crops',
      soilType: 'clay',
      waterAvailability: 'scarce',
      farmSize: 'medium'
    });

    expect(result.primaryIrrigationId).toBe('drip');
    expect(result.rationale.en).toContain('cotton');
  });

  test('should recommend Furrow Irrigation for row crops when water is moderate and soil is loamy', () => {
    const result = calculateRecommendation({
      cropType: 'row-crops',
      soilType: 'loamy',
      waterAvailability: 'moderate',
      farmSize: 'small'
    });

    expect(result.primaryIrrigationId).toBe('furrow');
  });

  test('should recommend Rain Gun for large fodder grass fields', () => {
    const result = calculateRecommendation({
      cropType: 'fodder',
      soilType: 'loamy',
      waterAvailability: 'moderate',
      farmSize: 'large'
    });

    expect(result.primaryIrrigationId).toBe('rain-gun');
  });

  test('should tailor equipment recommendations for marginal farms (< 2 acres)', () => {
    const result = calculateRecommendation({
      cropType: 'vegetables',
      soilType: 'loamy',
      waterAvailability: 'scarce',
      farmSize: 'marginal'
    });

    const equipmentIds = result.recommendedEquipment.map((e: any) => e.id);
    expect(equipmentIds).toContain('power-tiller');
    expect(equipmentIds).toContain('sprayer');
    expect(equipmentIds).toContain('water-pump');
  });

  test('should tailor equipment recommendations for medium farms (5 to 10 acres)', () => {
    const result = calculateRecommendation({
      cropType: 'cereals',
      soilType: 'loamy',
      waterAvailability: 'moderate',
      farmSize: 'medium'
    });

    const equipmentIds = result.recommendedEquipment.map((e: any) => e.id);
    expect(equipmentIds).toContain('tractor');
    expect(equipmentIds).toContain('rotavator');
    expect(equipmentIds).toContain('seed-drill');
    expect(equipmentIds).toContain('thresher');
  });

  test('should include government subsidy guidance (PMKSY & SMAM)', () => {
    const result = calculateRecommendation({
      cropType: 'orchard',
      soilType: 'loamy',
      waterAvailability: 'scarce',
      farmSize: 'small'
    });

    expect(result.subsidyGuidance.en).toContain('PMKSY');
    expect(result.subsidyGuidance.mr).toContain('महाडीबीटी');
    expect(result.subsidyGuidance.hi).toContain('प्रधानमंत्री कृषि सिंचाई योजना');
  });

  test('should include actionable practical tips', () => {
    const result = calculateRecommendation({
      cropType: 'vegetables',
      soilType: 'sandy',
      waterAvailability: 'moderate',
      farmSize: 'small'
    });

    expect(Array.isArray(result.practicalTips.en)).toBe(true);
    expect(result.practicalTips.en.length).toBeGreaterThanOrEqual(2);
    expect(result.practicalTips.mr.length).toBeGreaterThanOrEqual(2);
    expect(result.practicalTips.hi.length).toBeGreaterThanOrEqual(2);
  });

  test('should cite authoritative sources (MahaDBT / PMKSY / ICAR SAUs)', () => {
    const result = calculateRecommendation({
      cropType: 'row-crops',
      soilType: 'clay',
      waterAvailability: 'scarce',
      farmSize: 'medium'
    });

    expect(result.authoritativeSource).toBeDefined();
    expect(result.authoritativeSource.portalUrl).toContain('mahadbt');
    expect(result.authoritativeSource.institution.en).toBeTruthy();
    expect(result.authoritativeSource.institution.mr).toBeTruthy();
    expect(result.authoritativeSource.institution.hi).toBeTruthy();
  });

  test('should include notice that subsidy percentages are subject to state policy and verification', () => {
    const result = calculateRecommendation({
      cropType: 'row-crops',
      soilType: 'clay',
      waterAvailability: 'scarce',
      farmSize: 'medium'
    });

    expect(result.unavailableInfoNotice).toBeDefined();
    expect(result.unavailableInfoNotice.en.length).toBeGreaterThan(20);
    expect(result.unavailableInfoNotice.mr.length).toBeGreaterThan(20);
    expect(result.unavailableInfoNotice.hi.length).toBeGreaterThan(20);
  });
});
