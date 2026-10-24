export type RiskLevel = 'safe' | 'caution' | 'danger';

export type IndicatorSeverity = 'low' | 'medium' | 'high';

export interface DetectedIndicator {
  type: string;
  label: string;
  description: string;
  severity: IndicatorSeverity;
  match?: string;
  badge?: string;
}

export interface ThreatMatch {
  start: number;
  end: number;
  label: string;
  severity: IndicatorSeverity;
  description: string;
  badge?: string;
}

export interface TyposquatFinding {
  url: string;
  domain: string;
  brand: string;
  signals: string[];
  start: number;
  end: number;
}

export interface ScanResult {
  riskScore: number;
  riskLevel: RiskLevel;
  indicators: DetectedIndicator[];
  matches: ThreatMatch[];
  summary: string;
  breakdown: {
    category: string;
    score: number;
  }[];
}

export interface ScanRecord {
  id: string;
  input_text: string;
  risk_score: number;
  risk_level: RiskLevel;
  detected_indicators: DetectedIndicator[];
  summary: string;
  created_at: string;
}
