export type ProblemCategory = 'disease' | 'pest' | 'deficiency' | 'other';

export type PlantPart = 'leaves' | 'stem' | 'fruit' | 'flower' | 'root' | 'whole-plant';

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

export interface AuthoritativeSource {
  institution: LocalizedText;
  referenceDocument: LocalizedText;
  portalUrl?: string;
  portalName?: string;
}

export interface IntegratedManagementPlan {
  cultural: LocalizedList;
  biologicalMechanical: LocalizedList;
  chemicalCautionGuidance: LocalizedText;
}

export interface DiseasePestEntry {
  id: string;
  cropId: string;
  cropName: LocalizedText;
  name: LocalizedText;
  scientificName: string;
  category: ProblemCategory;
  categoryLabel: LocalizedText;
  affectedParts: PlantPart[];
  affectedPartsLabel: LocalizedText;
  symptoms: LocalizedList;
  symptomKeywords: string[];
  typicalConditions: LocalizedText;
  prevention: LocalizedList;
  integratedManagement: IntegratedManagementPlan;
  expertConsultationSigns: LocalizedList;
  safetyNotice: LocalizedText;
  authoritativeSource: AuthoritativeSource;
  aiModelClassId?: string;
}

export interface SupportedCrop {
  id: string;
  name: LocalizedText;
  category: string;
  categoryLabel: LocalizedText;
  season: string;
  seasonLabel: LocalizedText;
  icon: string;
  image?: string;
  description: LocalizedText;
}

export interface GuidedFlowInput {
  cropId: string;
  affectedParts: PlantPart[];
  symptomKeywords: string[];
  customSymptomQuery?: string;
}

export interface GuidedMatchResult {
  entry: DiseasePestEntry;
  matchScore: number; // 0 - 100
  matchedSymptoms: LocalizedList;
  matchRationale: LocalizedText;
}

export interface AiDiagnosticInput {
  predictedLabel: string;
  cropId: string;
  confidenceScore: number;
  detectedSymptoms?: string[];
  notes?: string;
}

export interface AiDiagnosticAdaptationResult {
  entry: DiseasePestEntry;
  confidenceScore: number;
  isAiIdentified: boolean;
  matchConfidenceBadge: string;
  aiNotice: LocalizedText;
}
