export type RiskLevel = 'safe' | 'caution' | 'danger';

export interface DetectedIndicator {
  type: string;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  match?: string;
}

export interface ScanResult {
  riskScore: number;
  riskLevel: RiskLevel;
  indicators: DetectedIndicator[];
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
