import type { ApplicationData, ExtractedLabel, FieldResult, ValidationReport } from '@/types/label';
import { fuzzyMatch, strictMatch, abvMatch, netContentsMatch } from './matchers';

function missingFail(field: string, expected: string): FieldResult {
  return { field, expected, extracted: null, status: 'FAIL', note: 'Not found on label' };
}

export function validateLabel(
  extracted: ExtractedLabel,
  application: ApplicationData,
  processingTimeMs: number
): ValidationReport {
  const fields: FieldResult[] = [];

  // Brand name — fuzzy: "STONE'S THROW" ≈ "Stone's Throw"
  if (!extracted.brand_name) {
    fields.push(missingFail('Brand Name', application.brand_name));
  } else {
    const { match, similarity } = fuzzyMatch(application.brand_name, extracted.brand_name);
    fields.push({
      field: 'Brand Name',
      expected: application.brand_name,
      extracted: extracted.brand_name,
      status: match ? 'PASS' : similarity >= 0.7 ? 'WARNING' : 'FAIL',
      note: !match ? `Similarity: ${(similarity * 100).toFixed(0)}%` : undefined,
    });
  }

  // Class/type — fuzzy
  if (!extracted.class_type) {
    fields.push(missingFail('Class/Type', application.class_type));
  } else {
    const { match, similarity } = fuzzyMatch(application.class_type, extracted.class_type);
    fields.push({
      field: 'Class/Type',
      expected: application.class_type,
      extracted: extracted.class_type,
      status: match ? 'PASS' : 'FAIL',
      note: !match ? `Similarity: ${(similarity * 100).toFixed(0)}%` : undefined,
    });
  }

  // ABV — numeric extraction with ±0.5% tolerance
  if (!extracted.abv) {
    fields.push(missingFail('Alcohol Content (ABV)', application.abv));
  } else {
    const { match, expectedVal, actualVal } = abvMatch(application.abv, extracted.abv);
    fields.push({
      field: 'Alcohol Content (ABV)',
      expected: application.abv,
      extracted: extracted.abv,
      status: match ? 'PASS' : 'FAIL',
      note:
        !match && expectedVal !== null && actualVal !== null
          ? `Expected ${expectedVal}%, found ${actualVal}%`
          : !match
          ? 'Could not parse ABV value'
          : undefined,
    });
  }

  // Net contents — unit-normalized match
  if (!extracted.net_contents) {
    fields.push(missingFail('Net Contents', application.net_contents));
  } else {
    const { match } = netContentsMatch(application.net_contents, extracted.net_contents);
    fields.push({
      field: 'Net Contents',
      expected: application.net_contents,
      extracted: extracted.net_contents,
      status: match ? 'PASS' : 'FAIL',
    });
  }

  // Bottler/producer — fuzzy
  if (!extracted.bottler_name) {
    fields.push(missingFail('Bottler/Producer', application.bottler_name));
  } else {
    const { match, similarity } = fuzzyMatch(application.bottler_name, extracted.bottler_name);
    fields.push({
      field: 'Bottler/Producer',
      expected: application.bottler_name,
      extracted: extracted.bottler_name,
      status: match ? 'PASS' : 'FAIL',
      note: !match ? `Similarity: ${(similarity * 100).toFixed(0)}%` : undefined,
    });
  }

  // Country of origin — fuzzy (only if provided in application)
  if (application.country_of_origin.trim()) {
    if (!extracted.country_of_origin) {
      fields.push(missingFail('Country of Origin', application.country_of_origin));
    } else {
      const { match } = fuzzyMatch(application.country_of_origin, extracted.country_of_origin);
      fields.push({
        field: 'Country of Origin',
        expected: application.country_of_origin,
        extracted: extracted.country_of_origin,
        status: match ? 'PASS' : 'FAIL',
      });
    }
  }

  // Government warning — STRICT: word-for-word, "GOVERNMENT WARNING:" must be all caps
  if (!extracted.warning_statement) {
    fields.push(missingFail('Government Warning Statement', application.warning_statement));
  } else {
    const hasCorrectPrefix = extracted.warning_statement.startsWith('GOVERNMENT WARNING:');
    const { match } = strictMatch(application.warning_statement, extracted.warning_statement);
    let note: string | undefined;
    if (!hasCorrectPrefix) note = '"GOVERNMENT WARNING:" prefix must be all caps';
    else if (!match) note = 'Warning text does not match exactly (word-for-word required)';
    fields.push({
      field: 'Government Warning Statement',
      expected: application.warning_statement,
      extracted: extracted.warning_statement,
      status: hasCorrectPrefix && match ? 'PASS' : 'FAIL',
      note,
    });
  }

  const overallStatus = fields.some((f) => f.status === 'FAIL') ? 'FAIL' : 'PASS';
  return { overallStatus, processingTimeMs, fields };
}
