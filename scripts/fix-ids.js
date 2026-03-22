const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'src', 'data', 'hymns_data.json');
const hymnsDir = path.join(__dirname, '..', 'public', 'hymns');

function fixIds() {
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found:', jsonPath);
    return;
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const files = fs.readdirSync(hymnsDir);

  // Mapping of filename to extracted ID
  const fileToId = {};
  files.forEach(file => {
    if (file.endsWith('.webp')) {
      const match = file.match(/^(\d+)/);
      if (match) {
        fileToId[file] = match[1];
      }
    }
  });

  const updatedData = data.map(item => {
    const fileName = path.basename(item.image_url);
    if (fileToId[fileName]) {
      item.id = fileToId[fileName];
    }
    return item;
  });

  // Sort by ID (numeric)
  // If IDs are the same, sort by hymn_number or title
  updatedData.sort((a, b) => {
    const idA = parseInt(a.id);
    const idB = parseInt(b.id);
    
    if (idA !== idB) {
      return idA - idB;
    }
    
    // Stable sort tie-breaker
    return a.hymn_number.localeCompare(b.hymn_number);
  });

  fs.writeFileSync(jsonPath, JSON.stringify(updatedData, null, 2), 'utf8');
  console.log('Successfully updated IDs and sorted JSON data.');
}

fixIds();
