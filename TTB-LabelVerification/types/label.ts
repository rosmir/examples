export interface ApplicationData {
  brand_name: string;
  class_type: string;
  abv: string;
  net_contents: string;
  bottler_name: string;
  bottler_address: string;
  country_of_origin: string;
  warning_statement: string;
}

export interface ExtractedLabel {
  brand_name: string | null;
  class_type: string | null;
  abv: string | null;
  net_contents: string | null;
  bottler_name: string | null;
  bottler_address: string | null;
  country_of_origin: string | null;
  warning_statement: string | null;
  extraction_notes?: string | null;
}

export type FieldStatus = 'PASS' | 'FAIL' | 'WARNING';

export interface FieldResult {
  field: string;
  expected: string;
  extracted: string | null;
  status: FieldStatus;
  note?: string;
}

export interface ValidationReport {
  overallStatus: 'PASS' | 'FAIL';
  processingTimeMs: number;
  fields: FieldResult[];
}

export interface VerifyResponse {
  extracted: ExtractedLabel;
  report: ValidationReport;
}
