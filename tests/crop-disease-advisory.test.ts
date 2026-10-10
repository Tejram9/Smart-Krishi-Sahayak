export {};
const {
  SUPPORTED_CROPS,
  DISEASE_PEST_ENTRIES,
  getCropList,
  addCrop,
  getCropById,
  getAllAdvisories,
  getAdvisoriesByCrop,
  getAdvisoryById,
  filterAdvisories,
  matchGuidedSymptoms,
  adaptAiDiagnosticResult
} = require('../src/main/resources/static/js/crop-disease-advisory-data.js');

describe('Crop Disease & Pest Advisory - Core Library & Engine Tests', () => {

  // 1. CROP SELECTION & LIBRARY
  describe('1. Crop Selection & Extensibility', () => {
    const REQUIRED_CROP_IDS = [
      'cotton',
      'soybean',
      'sugarcane',
      'onion',
      'wheat',
      'turmeric',
      'pomegranate',
      'jowar',
      'gram',
      'tomato'
    ];

    test('should support all 10 existing crops in the application', () => {
      const crops = getCropList();
      expect(crops.length).toBeGreaterThanOrEqual(10);
      const cropIds = crops.map((c: any) => c.id);
      REQUIRED_CROP_IDS.forEach(id => {
        expect(cropIds).toContain(id);
      });
    });

    test('every crop should have localized names in EN, MR, and HI', () => {
      const crops = getCropList();
      crops.forEach((crop: any) => {
        expect(crop.name.en).toBeTruthy();
        expect(crop.name.mr).toBeTruthy();
        expect(crop.name.hi).toBeTruthy();
        expect(crop.category).toBeTruthy();
        expect(crop.categoryLabel.en).toBeTruthy();
        expect(crop.seasonLabel.en).toBeTruthy();
        expect(crop.icon).toBeTruthy();
      });
    });

    test('getCropById should retrieve crop details accurately', () => {
      const cotton = getCropById('cotton');
      expect(cotton).toBeDefined();
      expect(cotton.name.en).toBe('Cotton');
      expect(cotton.name.mr).toBe('कापूस');
      expect(cotton.name.hi).toBe('कपास');

      const nonExistent = getCropById('unknown_crop_xyz');
      expect(nonExistent).toBeNull();
    });

    test('extensibility: should allow adding a new crop to the registry', () => {
      const initialCount = getCropList().length;
      const newCrop = {
        id: 'rice',
        name: { en: 'Rice / Paddy', mr: 'भात (तांदूळ)', hi: 'धान (चावल)' },
        category: 'Cereals',
        categoryLabel: { en: 'Cereal Grain', mr: 'धान्य पीक', hi: 'अन्नधान्य फसल' },
        season: 'Kharif',
        seasonLabel: { en: 'Kharif', mr: 'खरीप', hi: 'खरीफ' },
        icon: 'bi-droplet',
        description: {
          en: 'Major wetland staple food crop.',
          mr: 'प्रमुख अन्नधान्य पीक.',
          hi: 'प्रमुख खाद्यान्न फसल।'
        }
      };

      const added = addCrop(newCrop);
      expect(added).toBe(true);
      expect(getCropList().length).toBe(initialCount + 1);

      const retrieved = getCropById('rice');
      expect(retrieved).toBeDefined();
      expect(retrieved.name.en).toContain('Rice');

      // Adding duplicate should return false
      const duplicateAdded = addCrop(newCrop);
      expect(duplicateAdded).toBe(false);
    });
  });

  // 2. DISEASE & PEST SEARCH
  describe('2. Disease & Pest Search Capabilities', () => {
    test('should search by English disease name (e.g., "Pink Bollworm")', () => {
      const results = filterAdvisories(null, { keyword: 'Pink Bollworm' });
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((e: any) => e.id === 'cotton-pink-bollworm')).toBe(true);
    });

    test('should search by Marathi name (e.g., "तांबेरा")', () => {
      const results = filterAdvisories(null, { keyword: 'तांबेरा' });
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((e: any) => e.id === 'soybean-rust' || e.id === 'wheat-stripe-rust')).toBe(true);
    });

    test('should search by Hindi name (e.g., "झुलसा")', () => {
      const results = filterAdvisories(null, { keyword: 'झुलसा' });
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((e: any) => e.id === 'onion-purple-blotch' || e.id === 'tomato-early-blight')).toBe(true);
    });

    test('should search by scientific pathogen name (e.g., "Alternaria solani")', () => {
      const results = filterAdvisories(null, { keyword: 'Alternaria solani' });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('tomato-early-blight');
    });

    test('should search by symptom keyword (e.g., "deadheart")', () => {
      const results = filterAdvisories(null, { keyword: 'deadheart' });
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].id).toBe('jowar-shoot-fly');
    });

    test('should return empty list when no match is found', () => {
      const results = filterAdvisories(null, { keyword: 'NonExistentPathogenXYZ999' });
      expect(results.length).toBe(0);
    });
  });

  // 3. FILTERING
  describe('3. Filtering by Crop, Category, and Affected Plant Part', () => {
    test('should filter advisories by cropId (e.g., "cotton")', () => {
      const cottonAdvisories = getAdvisoriesByCrop('cotton');
      expect(cottonAdvisories.length).toBeGreaterThanOrEqual(3);
      cottonAdvisories.forEach((e: any) => {
        expect(e.cropId).toBe('cotton');
      });
    });

    test('should filter by category: disease', () => {
      const diseases = filterAdvisories(null, { category: 'disease' });
      expect(diseases.length).toBeGreaterThan(0);
      diseases.forEach((e: any) => {
        expect(e.category).toBe('disease');
      });
    });

    test('should filter by category: pest', () => {
      const pests = filterAdvisories(null, { category: 'pest' });
      expect(pests.length).toBeGreaterThan(0);
      pests.forEach((e: any) => {
        expect(e.category).toBe('pest');
      });
    });

    test('should filter by category: deficiency', () => {
      const deficiencies = filterAdvisories(null, { category: 'deficiency' });
      expect(deficiencies.length).toBeGreaterThan(0);
      deficiencies.forEach((e: any) => {
        expect(e.category).toBe('deficiency');
      });
    });

    test('should filter by affected plant part: leaves', () => {
      const leafIssues = filterAdvisories(null, { affectedPart: 'leaves' });
      expect(leafIssues.length).toBeGreaterThan(0);
      leafIssues.forEach((e: any) => {
        expect(e.affectedParts).toContain('leaves');
      });
    });

    test('should filter by affected plant part: fruit', () => {
      const fruitIssues = filterAdvisories(null, { affectedPart: 'fruit' });
      expect(fruitIssues.length).toBeGreaterThan(0);
      fruitIssues.forEach((e: any) => {
        expect(e.affectedParts).toContain('fruit');
      });
    });

    test('should combine search keyword, crop, category, and plant part', () => {
      const combined = filterAdvisories(null, {
        keyword: 'blight',
        cropId: 'tomato',
        category: 'disease',
        affectedPart: 'leaves'
      });
      expect(combined.length).toBe(1);
      expect(combined[0].id).toBe('tomato-early-blight');
    });
  });

  // 4. ADVISORY DETAILS & STRUCTURED INTEGRITY
  describe('4. Advisory Details Completeness for All Entries', () => {
    const allEntries = getAllAdvisories();

    test('should have comprehensive entries covering multiple crops and problem types', () => {
      expect(allEntries.length).toBeGreaterThanOrEqual(14);
    });

    allEntries.forEach((entry: any) => {
      describe(`Structured verification for entry: ${entry.id}`, () => {
        test('should have valid ID, cropId, and scientific name', () => {
          expect(entry.id).toBeTruthy();
          expect(entry.cropId).toBeTruthy();
          expect(entry.scientificName).toBeTruthy();
          expect(['disease', 'pest', 'deficiency', 'other']).toContain(entry.category);
        });

        test('should have structured symptoms list in EN, MR, and HI', () => {
          expect(Array.isArray(entry.symptoms.en)).toBe(true);
          expect(entry.symptoms.en.length).toBeGreaterThanOrEqual(3);
          expect(entry.symptoms.mr.length).toBeGreaterThanOrEqual(3);
          expect(entry.symptoms.hi.length).toBeGreaterThanOrEqual(3);
        });

        test('should have affected plant parts specified', () => {
          expect(Array.isArray(entry.affectedParts)).toBe(true);
          expect(entry.affectedParts.length).toBeGreaterThanOrEqual(1);
          expect(entry.affectedPartsLabel.en).toBeTruthy();
          expect(entry.affectedPartsLabel.mr).toBeTruthy();
          expect(entry.affectedPartsLabel.hi).toBeTruthy();
        });

        test('should have typical associated environmental conditions', () => {
          expect(entry.typicalConditions.en.length).toBeGreaterThan(20);
          expect(entry.typicalConditions.mr.length).toBeGreaterThan(20);
          expect(entry.typicalConditions.hi.length).toBeGreaterThan(20);
        });

        test('should have structured prevention and cultural practices', () => {
          expect(Array.isArray(entry.prevention.en)).toBe(true);
          expect(entry.prevention.en.length).toBeGreaterThanOrEqual(3);
          expect(entry.prevention.mr.length).toBeGreaterThanOrEqual(3);
          expect(entry.prevention.hi.length).toBeGreaterThanOrEqual(3);
        });

        test('should provide integrated management options (cultural, bio, chemical caution)', () => {
          expect(entry.integratedManagement).toBeDefined();
          expect(Array.isArray(entry.integratedManagement.cultural.en)).toBe(true);
          expect(Array.isArray(entry.integratedManagement.biologicalMechanical.en)).toBe(true);
          expect(entry.integratedManagement.chemicalCautionGuidance.en).toBeTruthy();
          expect(entry.integratedManagement.chemicalCautionGuidance.mr).toBeTruthy();
          expect(entry.integratedManagement.chemicalCautionGuidance.hi).toBeTruthy();
        });

        test('should include warning signs requiring expert/KVK consultation', () => {
          expect(Array.isArray(entry.expertConsultationSigns.en)).toBe(true);
          expect(entry.expertConsultationSigns.en.length).toBeGreaterThanOrEqual(1);
          expect(entry.expertConsultationSigns.mr.length).toBeGreaterThanOrEqual(1);
          expect(entry.expertConsultationSigns.hi.length).toBeGreaterThanOrEqual(1);
        });

        test('should cite authoritative agriculture source (ICAR, SAU, VSI) with official URL', () => {
          expect(entry.authoritativeSource).toBeDefined();
          expect(entry.authoritativeSource.institution.en).toBeTruthy();
          expect(entry.authoritativeSource.referenceDocument.en).toBeTruthy();
          expect(entry.authoritativeSource.portalUrl).toMatch(/^https:\/\//);
        });

        test('should include statutory safety notice directing farmers to CIBRC label or local officers', () => {
          expect(entry.safetyNotice).toBeDefined();
          expect(entry.safetyNotice.en.length).toBeGreaterThan(25);
          expect(entry.safetyNotice.mr.length).toBeGreaterThan(25);
          expect(entry.safetyNotice.hi.length).toBeGreaterThan(25);
        });
      });
    });
  });

  // 5. SAFETY & ACCURACY
  describe('5. Safety, Statutory Guidance & Non-Definitive Wording', () => {
    test('chemical guidance across entries must mandate CIBRC label claims and KVK/Officer consultation', () => {
      const allEntries = getAllAdvisories();
      allEntries.forEach((entry: any) => {
        const chem = entry.integratedManagement.chemicalCautionGuidance.en;
        expect(
          chem.includes('CIBRC') ||
          chem.includes('Economic Threshold Level') ||
          chem.includes('label') ||
          chem.includes('KVK') ||
          chem.includes('Officer')
        ).toBe(true);
      });
    });

    test('guided match results must use non-definitive wording ("Possible match based on selected symptoms")', () => {
      const matches = matchGuidedSymptoms({
        cropId: 'cotton',
        affectedParts: ['flower', 'fruit'],
        symptomKeywords: ['rosetted', 'bollworm']
      });

      expect(matches.length).toBeGreaterThan(0);
      const topMatch = matches[0];
      expect(topMatch.matchRationale.en).toContain('Possible match based on selected symptoms');
      expect(topMatch.matchRationale.mr).toContain('संभाव्य जुळणी');
      expect(topMatch.matchRationale.hi).toContain('संभावित मिलान');
    });
  });

  // 6. GUIDED FLOW & FUTURE AI READINESS
  describe('6. Guided Symptom Matcher & Future AI Vision Connector', () => {
    test('guided symptom matching should rank most relevant issues highest', () => {
      const matches = matchGuidedSymptoms({
        cropId: 'cotton',
        affectedParts: ['leaves'],
        symptomKeywords: ['angular', 'water-soaked']
      });

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].entry.id).toBe('cotton-bacterial-blight');
      expect(matches[0].matchScore).toBeGreaterThanOrEqual(70);
    });

    test('AI diagnostic adapter should take vision model output and produce standardized advisory schema', () => {
      const aiInput = {
        predictedLabel: 'cotton_pink_bollworm',
        cropId: 'cotton',
        confidenceScore: 0.95,
        detectedSymptoms: ['punctured boll'],
        notes: 'AI model detected exit holes on boll'
      };

      const result = adaptAiDiagnosticResult(aiInput);
      expect(result).toBeDefined();
      expect(result.entry.id).toBe('cotton-pink-bollworm');
      expect(result.confidenceScore).toBe(95);
      expect(result.isAiIdentified).toBe(true);
      expect(result.matchConfidenceBadge).toContain('95%');
      expect(result.aiNotice.en).toContain('computer vision suggestion and not a certified lab diagnosis');
    });

    test('AI diagnostic adapter should gracefully fallback if predicted label is generic', () => {
      const aiInput = {
        predictedLabel: 'unknown_leaf_condition',
        cropId: 'soybean',
        confidenceScore: 0.88
      };

      const result = adaptAiDiagnosticResult(aiInput);
      expect(result).toBeDefined();
      expect(result.entry.cropId).toBe('soybean');
      expect(result.confidenceScore).toBe(88);
    });
  });
});
