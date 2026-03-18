import fs from 'fs/promises';
import path from 'path';
import { createWorker } from 'tesseract.js';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'hymns_data.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function main() {
  console.log('Loading hymns data...');
  const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
  
  console.log('Initializing Tesseract worker for Vietnamese (vie)...');
  const worker = await createWorker('vie');

  let count = 0;
  for (const hymn of data) {
    if (count >= 3) break;
    
    if (hymn.image_url) {
      const imagePath = path.join(PUBLIC_DIR, hymn.image_url);
      console.log(`Processing ${hymn.id}: ${hymn.title}...`);
      try {
        const { data: { text } } = await worker.recognize(imagePath);
        console.log(`\n--- Extracted Text for ${hymn.title} ---\n${text}\n---------------------------------------\n`);
        // Clean up the text: replace newlines with spaces and trim
        hymn.lyrics = text.replace(/\n/g, ' ').trim();
        count++;
      } catch (err) {
        console.error(`Error processing ${hymn.id}:`, err);
        hymn.lyrics = "";
      }
    }
  }

  await worker.terminate();

  console.log('Saving updated data...');
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Successfully updated hymns_data.json with lyrics.');
}

main().catch(console.error);
