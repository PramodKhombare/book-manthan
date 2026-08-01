import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const SAMPLE_ID = 'atomic-habits';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const validateAnalysisResponse = (response, source) => {
  assert(response && typeof response === 'object', `${source}: Response must be an object.`);
  assert(typeof response.title === 'string' && response.title.length > 0, `${source}: title is required.`);
  assert(typeof response.author === 'string' && response.author.length > 0, `${source}: author is required.`);
  assert(typeof response.category === 'string' && response.category.length > 0, `${source}: category is required.`);
  assert(typeof response.summary === 'string' && response.summary.length > 0, `${source}: summary is required.`);
  assert(Array.isArray(response.timelessInsights), `${source}: timelessInsights must be an array.`);
  assert(response.timelessInsights.length > 0, `${source}: timelessInsights cannot be empty.`);
  assert(response.practicalApplication && typeof response.practicalApplication === 'object', `${source}: practicalApplication is required.`);
  assert(response.top5Evaluation && typeof response.top5Evaluation === 'object', `${source}: top5Evaluation is required.`);
};

const postJson = async (url, data) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${body}`);
  }
  return JSON.parse(body);
};

const postMultipart = async (url, filePath) => {
  const fileData = await fs.promises.readFile(filePath);
  const form = new FormData();
  form.append('file', new Blob([fileData], { type: 'text/plain' }), path.basename(filePath));
  const response = await fetch(url, {
    method: 'POST',
    body: form
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${body}`);
  }
  return JSON.parse(body);
};

const run = async () => {
  console.log('Running analysis endpoint regression tests...');

  console.log('1) Testing sample book analysis response');
  const sampleResult = await postJson(`${BASE_URL}/api/analyze-book`, { sampleId: SAMPLE_ID });
  validateAnalysisResponse(sampleResult, 'Sample result');
  console.log('   ✅ Sample book analysis returned a valid structured payload.');

  console.log('2) Testing file upload analysis response');
  const uploadResult = await postMultipart(`${BASE_URL}/api/analyze-book`, path.join(process.cwd(), 'test-sample.txt'));
  validateAnalysisResponse(uploadResult, 'Upload result');
  console.log('   ✅ File upload analysis returned a valid structured payload.');

  console.log('All regression tests passed successfully.');
};

run().catch((error) => {
  console.error('Regression test failed:', error.message || error);
  process.exit(1);
});