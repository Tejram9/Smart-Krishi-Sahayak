export interface LocalizedText {
  en: string;
  mr: string;
  hi: string;
}

export interface LocalizedList {
  en: string[];
  mr: string[];
  hi: string[];
}

export interface KeySpecification {
  label: LocalizedText;
  value: LocalizedText;
}

export interface AuthoritativeSource {
  institution: LocalizedText;
  referenceDocument: LocalizedText;
  portalUrl?: string;
  portalName?: string;
  standardCode?: string;
}

export interface FarmEquipment {
  id: string;
  name: LocalizedText;
  category: string;
  categoryKey: string;
  icon: string;
  image: string;
  badge: string;
  mainPurpose: LocalizedText;
  suitableCrops: LocalizedList;
  bestUseStage: LocalizedText;
  basicWorking: LocalizedText;
  keySpecifications: KeySpecification[];
  maintenance: LocalizedList;
  safetyTips: LocalizedList;
  suitableFarmSize: LocalizedText;
  powerSource: LocalizedText;
  authoritativeSource?: AuthoritativeSource;
  unavailableInfoNotice?: LocalizedText;
}

export interface IrrigationEfficiency {
  efficiencyPercent: string;
  waterSavingPercent: string;
  operatingPressure: string;
  details: LocalizedText;
}

export interface IrrigationComponent {
  name: LocalizedText;
  purpose: LocalizedText;
}

export interface IrrigationType {
  id: string;
  name: LocalizedText;
  category: string;
  categoryKey: string;
  icon: string;
  subtypes?: LocalizedList;
  howItWorks: LocalizedText;
  suitableCrops: LocalizedList;
  suitableSoil: LocalizedText;
  waterRequirementEfficiency: IrrigationEfficiency;
  advantages: LocalizedList;
  limitations: LocalizedList;
  basicComponents: IrrigationComponent[];
  maintenance: LocalizedList;
  whenToChooseIt: LocalizedText;
  authoritativeSource?: AuthoritativeSource;
  unavailableInfoNotice?: LocalizedText;
}

export interface IrrigationFlowStep {
  step: number;
  id: string;
  title: LocalizedText;
  role: LocalizedText;
  farmerExplanation: LocalizedText;
  farmerTip: LocalizedText;
  keyChecks: LocalizedList;
  icon: string;
  authoritativeSource?: AuthoritativeSource;
  unavailableInfoNotice?: LocalizedText;
}

export type CropType = 'orchard' | 'row-crops' | 'cereals' | 'vegetables' | 'pulses' | 'fodder';
export type SoilType = 'clay' | 'loamy' | 'sandy' | 'rocky';
export type WaterAvailability = 'scarce' | 'moderate' | 'abundant';
export type FarmSize = 'marginal' | 'small' | 'medium' | 'large';

export interface AdvisorInput {
  cropType: CropType;
  soilType: SoilType;
  waterAvailability: WaterAvailability;
  farmSize: FarmSize;
}

export interface AdvisorRecommendation {
  primaryIrrigationId: string;
  primaryIrrigationName: LocalizedText;
  efficiencyBadge: string;
  waterSavingNote: LocalizedText;
  rationale: LocalizedText;
  recommendedEquipment: Array<{
    id: string;
    name: LocalizedText;
    note: LocalizedText;
  }>;
  subsidyGuidance: LocalizedText;
  practicalTips: LocalizedList;
  authoritativeSource?: AuthoritativeSource;
  unavailableInfoNotice?: LocalizedText;
}
