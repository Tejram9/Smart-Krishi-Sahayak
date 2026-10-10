import fs from 'fs';
import path from 'path';

describe('Crop Disease & Pest Advisory - Navigation & Translation Linkage Tests', () => {
  const staticDir = path.resolve(__dirname, '../src/main/resources/static');

  test('crop-disease-advisory.html should exist and be valid HTML5', () => {
    const filePath = path.join(staticDir, 'crop-disease-advisory.html');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('Crop Disease & Pest Advisory');
    expect(content).toContain('/js/crop-disease-advisory-data.js');
    expect(content).toContain('/js/crop-disease-advisory.js');
  });

  test('crop-disease-advisory.html should link back to dashboard, crops, equipment guide, about, and home', () => {
    const content = fs.readFileSync(path.join(staticDir, 'crop-disease-advisory.html'), 'utf-8');
    expect(content).toContain('/farmer-dashboard.html');
    expect(content).toContain('/crop-info.html');
    expect(content).toContain('/equipment-irrigation.html');
    expect(content).toContain('/about.html');
    expect(content).toContain('/index.html');
  });

  test('farmer-dashboard.html should contain link and module card for crop-disease-advisory.html', () => {
    const content = fs.readFileSync(path.join(staticDir, 'farmer-dashboard.html'), 'utf-8');
    expect(content).toContain('/crop-disease-advisory.html');
    expect(content).toContain('feature_advisory_title');
    expect(content).toContain('nav_disease_advisory');
  });

  test('index.html should feature crop-disease-advisory.html in features and nav', () => {
    const content = fs.readFileSync(path.join(staticDir, 'index.html'), 'utf-8');
    expect(content).toContain('/crop-disease-advisory.html');
    expect(content).toContain('nav_disease_advisory');
    expect(content).toContain('feature_advisory_title');
  });

  test('crop-info.html should contain navigation link to crop-disease-advisory.html', () => {
    const content = fs.readFileSync(path.join(staticDir, 'crop-info.html'), 'utf-8');
    expect(content).toContain('/crop-disease-advisory.html');
    expect(content).toContain('nav_disease_advisory');
  });

  test('about.html should contain navigation link to crop-disease-advisory.html', () => {
    const content = fs.readFileSync(path.join(staticDir, 'about.html'), 'utf-8');
    expect(content).toContain('/crop-disease-advisory.html');
  });

  test('equipment-irrigation.html should contain navigation link to crop-disease-advisory.html', () => {
    const content = fs.readFileSync(path.join(staticDir, 'equipment-irrigation.html'), 'utf-8');
    expect(content).toContain('/crop-disease-advisory.html');
  });

  test('all translation files (en.json, mr.json, hi.json) should contain required advisory keys', () => {
    const requiredKeys = [
      'nav_disease_advisory',
      'feature_advisory_title',
      'feature_advisory_desc',
      'btn_explore_advisory',
      'advisory_badge_verified',
      'advisory_page_title',
      'advisory_page_subtitle',
      'advisory_btn_ai_preview',
      'advisory_safety_banner_title',
      'advisory_safety_banner_desc',
      'advisory_safety_banner_rule',
      'tab_guided_flow',
      'tab_advisory_library',
      'tab_ai_connector',
      'guided_step1_title',
      'guided_step2_title',
      'guided_step3_title',
      'btn_find_matches',
      'btn_reset_selection',
      'filter_search_label',
      'filter_crop_label',
      'filter_category_label',
      'filter_part_label',
      'modal_section_symptoms',
      'modal_section_conditions',
      'modal_section_prevention',
      'modal_section_ipm',
      'modal_section_expert_signs',
      'modal_section_source'
    ];

    ['en', 'mr', 'hi'].forEach(lang => {
      const langPath = path.join(staticDir, 'lang', `${lang}.json`);
      expect(fs.existsSync(langPath)).toBe(true);
      const data = JSON.parse(fs.readFileSync(langPath, 'utf-8'));

      requiredKeys.forEach(key => {
        expect(data[key]).toBeDefined();
        expect(typeof data[key]).toBe('string');
        expect(data[key].length).toBeGreaterThan(0);
      });
    });
  });
});
