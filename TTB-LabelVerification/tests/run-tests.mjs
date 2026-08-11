// Curated 8-label smoke test — covers each failure category without burning quota.
// Requires the dev server running on localhost:3000 and tests/labels/ populated.
// Run: node tests/run-tests.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LABELS_DIR = path.join(__dirname, 'labels');
const API_URL = 'http://localhost:3000/api/verify';

const TTB_WARNING =
  'GOVERNMENT WARNING: (1) ACCORDING TO THE SURGEON GENERAL, WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY BECAUSE OF THE RISK OF BIRTH DEFECTS. (2) CONSUMPTION OF ALCOHOLIC BEVERAGES IMPAIRS YOUR ABILITY TO DRIVE A CAR OR OPERATE MACHINERY, AND MAY CAUSE HEALTH PROBLEMS.';

// 8 cases: clean control, fuzzy-match trap, wrong ABV, wrong net contents,
// missing warning, missing country, blurry image, flipped orientation
const TEST_CASES = [
  {
    label: 'old_tom_distillery.png',
    appData: {
      brand_name: 'OLD TOM DISTILLERY',
      class_type: 'Kentucky Straight Bourbon Whiskey',
      abv: '45% Alc./Vol. (90 Proof)',
      net_contents: '750 mL',
      bottler_name: 'Old Tom Distillery',
      bottler_address: 'Louisville, KY',
      country_of_origin: '',
      warning_statement: TTB_WARNING,
    },
    expectedOverall: 'PASS',
  },
  {
    label: 'stones_throw_case_variation.png',
    appData: {
      brand_name: "Stone's Throw",        // label has "STONE'S THROW" — fuzzy must pass
      class_type: 'Kentucky Straight Bourbon Whiskey',
      abv: '45% Alc./Vol. (90 Proof)',
      net_contents: '750 mL',
      bottler_name: 'Stone & Throw Distillery',
      bottler_address: 'Frankfort, KY',
      country_of_origin: '',
      warning_statement: TTB_WARNING,
    },
    expectedOverall: 'PASS',
  },
  {
    label: 'north_point_wrong_abv.png',
    appData: {
      brand_name: 'NORTH POINT VODKA',
      class_type: 'Vodka',
      abv: '45% Alc./Vol.',              // label has a different ABV — expect FAIL
      net_contents: '750 mL',
      bottler_name: 'North Point Spirits',
      bottler_address: 'Portland, OR',
      country_of_origin: '',
      warning_statement: TTB_WARNING,
    },
    expectedOverall: 'FAIL',
  },
  {
    label: 'hilltop_wrong_net_contents.png',
    appData: {
      brand_name: 'HILLTOP GIN',
      class_type: 'Gin',
      abv: '40% Alc./Vol.',
      net_contents: '750 mL',           // label shows different volume — expect FAIL
      bottler_name: 'Hilltop Distillery',
      bottler_address: 'Denver, CO',
      country_of_origin: '',
      warning_statement: TTB_WARNING,
    },
    expectedOverall: 'FAIL',
  },
  {
    label: 'red_ridge_missing_warning.png',
    appData: {
      brand_name: 'RED RIDGE DISTILLING',
      class_type: 'Rye Whiskey',
      abv: '45% Alc./Vol. (90 Proof)',
      net_contents: '750 mL',
      bottler_name: 'Red Ridge Distilling Co.',
      bottler_address: 'Asheville, NC',
      country_of_origin: '',
      warning_statement: TTB_WARNING,   // label is missing warning — expect FAIL
    },
    expectedOverall: 'FAIL',
  },
  {
    label: 'sol_y_mar_missing_country.png',
    appData: {
      brand_name: 'SOL Y MAR',
      class_type: 'Tequila',
      abv: '40% Alc./Vol.',
      net_contents: '750 mL',
      bottler_name: 'Sol Y Mar Imports',
      bottler_address: 'Miami, FL',
      country_of_origin: 'Mexico',      // label omits country — expect FAIL
      warning_statement: TTB_WARNING,
    },
    expectedOverall: 'FAIL',
  },
  {
    label: 'midnight_vodka_blurry.png',
    appData: {
      brand_name: 'MIDNIGHT CURRENT',
      class_type: 'Vodka',
      abv: '40% Alc./Vol. (80 Proof)',
      net_contents: '1 L',
      bottler_name: 'Midnight Current Spirits',
      bottler_address: 'Detroit, MI',
      country_of_origin: '',
      warning_statement: TTB_WARNING,
    },
    expectedOverall: 'PASS',
  },
  {
    label: 'jade_dragon_flipped.png',
    appData: {
      brand_name: 'JADE DRAGON',
      class_type: 'Rice Spirit',
      abv: '38% Alc./Vol. (76 Proof)',
      net_contents: '700 mL',
      bottler_name: 'Jade Dragon Imports',
      bottler_address: 'Seattle, WA',
      country_of_origin: 'China',
      warning_statement: TTB_WARNING,
    },
    expectedOverall: 'PASS',
  },
];

const PASS  = '\x1b[32mPASS\x1b[0m';
const FAIL  = '\x1b[31mFAIL\x1b[0m';
const WARN  = '\x1b[33mWARN\x1b[0m';
const CHECK = '\x1b[32m✓\x1b[0m';
const CROSS = '\x1b[31m✗\x1b[0m';

function statusColor(s) {
  if (s === 'PASS') return PASS;
  if (s === 'FAIL') return FAIL;
  return WARN;
}

async function runTest(tc, index) {
  const imagePath = path.join(LABELS_DIR, tc.label);
  if (!fs.existsSync(imagePath)) {
    console.error(`  [${tc.label}] image not found — skipping`);
    return null;
  }

  const form = new FormData();
  const imageBytes = fs.readFileSync(imagePath);
  form.append('image', new Blob([imageBytes], { type: 'image/png' }), tc.label);
  form.append('appData', JSON.stringify(tc.appData));

  const start = Date.now();
  const res = await fetch(API_URL, { method: 'POST', body: form });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    console.error(`  [${tc.label}] HTTP ${res.status}: ${err.error}`);
    return null;
  }

  const { report } = await res.json();
  const correct = report.overallStatus === tc.expectedOverall;

  console.log(
    `\n[${index + 1}/8] ${tc.label}  (${elapsed}s)`
  );
  console.log(
    `  Overall: ${statusColor(report.overallStatus)}  ` +
    `Expected: ${tc.expectedOverall}  ${correct ? CHECK + ' correct' : CROSS + ' UNEXPECTED'}`
  );

  for (const f of report.fields) {
    const icon = f.status === 'PASS' ? CHECK : f.status === 'WARNING' ? '\x1b[33m⚠\x1b[0m' : CROSS;
    const note = f.note ? `  (${f.note})` : '';
    console.log(`    ${icon} ${f.field}: ${f.status}${note}`);
  }

  return { label: tc.label, overall: report.overallStatus, expected: tc.expectedOverall, correct, elapsed };
}

async function main() {
  console.log('TTB Label Verification — smoke test');
  console.log(`Endpoint: ${API_URL}`);
  console.log(`Running ${TEST_CASES.length} test cases (≈$0.05–0.10 in API costs)\n`);
  console.log('─'.repeat(60));

  const results = [];
  for (let i = 0; i < TEST_CASES.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 2000)); // avoid TPM burst
    const r = await runTest(TEST_CASES[i], i);
    if (r) results.push(r);
  }

  console.log('\n' + '─'.repeat(60));
  console.log('Summary');
  console.log('─'.repeat(60));

  const correct = results.filter(r => r.correct).length;
  const avgTime = (results.reduce((s, r) => s + parseFloat(r.elapsed), 0) / results.length).toFixed(1);

  for (const r of results) {
    const icon = r.correct ? CHECK : CROSS;
    console.log(`  ${icon} ${r.label.padEnd(40)} ${r.overall.padEnd(5)} (${r.elapsed}s)`);
  }

  console.log(`\n  ${correct}/${results.length} matched expected outcome   avg ${avgTime}s per label`);
}

main().catch(err => { console.error(err); process.exit(1); });
