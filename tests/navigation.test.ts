import fs from 'fs';
import path from 'path';

describe('Navigation and Cross-Module Linkage Tests', () => {
  const staticDir = path.resolve(__dirname, '../src/main/resources/static');

  test('equipment-irrigation.html should exist and be valid HTML5', () => {
    const filePath = path.join(staticDir, 'equipment-irrigation.html');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('Farm Equipment & Irrigation Guide');
    expect(content).toContain('/js/equipment-irrigation-data.js');
    expect(content).toContain('/js/equipment-irrigation.js');
  });

  test('equipment-irrigation.html should link back to dashboard, crops, about, and home', () => {
    const content = fs.readFileSync(path.join(staticDir, 'equipment-irrigation.html'), 'utf-8');
    expect(content).toContain('/farmer-dashboard.html');
    expect(content).toContain('/crop-info.html');
    expect(content).toContain('/about.html');
    expect(content).toContain('/index.html');
  });

  test('farmer-dashboard.html should contain link to equipment-irrigation.html', () => {
    const content = fs.readFileSync(path.join(staticDir, 'farmer-dashboard.html'), 'utf-8');
    expect(content).toContain('/equipment-irrigation.html');
    expect(content).toContain('feature_equip_title');
  });

  test('index.html should feature equipment-irrigation.html in features and nav', () => {
    const content = fs.readFileSync(path.join(staticDir, 'index.html'), 'utf-8');
    expect(content).toContain('/equipment-irrigation.html');
    expect(content).toContain('nav_equipment_guide');
    expect(content).toContain('feature_equip_title');
  });

  test('crop-info.html should contain navigation link to equipment-irrigation.html', () => {
    const content = fs.readFileSync(path.join(staticDir, 'crop-info.html'), 'utf-8');
    expect(content).toContain('/equipment-irrigation.html');
  });

  test('about.html should contain navigation link to equipment-irrigation.html', () => {
    const content = fs.readFileSync(path.join(staticDir, 'about.html'), 'utf-8');
    expect(content).toContain('/equipment-irrigation.html');
  });

  test('all translation files (en.json, mr.json, hi.json) should contain required keys', () => {
    const requiredKeys = [
      'nav_equipment_guide',
      'feature_equip_title',
      'feature_equip_desc',
      'btn_explore_equip',
      'equip_guide_title',
      'equip_guide_subtitle',
      'equip_tab_equipment',
      'equip_tab_irrigation',
      'equip_tab_flow',
      'equip_tab_advisor',
      'advisor_title',
      'flow_title'
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
