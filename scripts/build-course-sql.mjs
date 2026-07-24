import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const [, , inputJsonPath, outputSqlPath] = process.argv;

if (!inputJsonPath) {
  console.error('Usage: node scripts/build-course-sql.mjs <input-json> [output-sql]');
  process.exit(1);
}

const templatePath = path.resolve('supabase/publish_course_from_json.sql');
const template = readFileSync(templatePath, 'utf8');
const rawInput = readFileSync(inputJsonPath, 'utf8').trim();

function extractJsonPayload(text) {
  if (text.startsWith('{') || text.startsWith('[')) return text;

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch) {
    const fenced = fencedMatch[1].trim();
    if (fenced.startsWith('{') || fenced.startsWith('[')) return fenced;
  }

  const firstObject = text.indexOf('{');
  const firstArray = text.indexOf('[');
  let start = -1;
  if (firstObject === -1) start = firstArray;
  else if (firstArray === -1) start = firstObject;
  else start = Math.min(firstObject, firstArray);

  const lastObject = text.lastIndexOf('}');
  const lastArray = text.lastIndexOf(']');
  const end = Math.max(lastObject, lastArray);

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return text.slice(start, end + 1).trim();
}

const payload = extractJsonPayload(rawInput);

if (!payload) {
  console.error('Input file must contain valid JSON or a fenced JSON block.');
  process.exit(1);
}

try {
  JSON.parse(payload);
} catch (error) {
  console.error('Input JSON could not be parsed. Make sure the file contains valid JSON only.');
  console.error(String(error.message || error));
  process.exit(1);
}

const marker = "v_payload jsonb := '{}'::jsonb; -- Replace with your full JSON payload.";
const replacement = `v_payload jsonb := $json$\n${payload}\n$json$::jsonb;`;

if (!template.includes(marker)) {
  console.error('Template marker not found in supabase/publish_course_from_json.sql');
  process.exit(1);
}

const sql = template.replace(marker, replacement);

if (outputSqlPath) {
  writeFileSync(outputSqlPath, sql, 'utf8');
  console.log(`Wrote ${outputSqlPath}`);
} else {
  process.stdout.write(sql);
}
