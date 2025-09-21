const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
} else {
    console.log('📁 Uploads directory already exists');
}

// Create a .gitkeep file to ensure the directory is tracked by git
const gitkeepFile = path.join(uploadsDir, '.gitkeep');
if (!fs.existsSync(gitkeepFile)) {
    fs.writeFileSync(gitkeepFile, '');
    console.log('✅ Created .gitkeep file');
} else {
    console.log('📄 .gitkeep file already exists');
}

console.log('\n🎯 Uploads directory setup complete!');
console.log('📁 Path:', uploadsDir);
console.log('💡 Profile images will be stored here');

