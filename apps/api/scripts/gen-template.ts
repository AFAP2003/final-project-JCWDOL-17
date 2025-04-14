import fs from 'fs';
import path from 'path';

function gentmplType() {
  const dirpath = path.resolve(__dirname, '../src/templates');
  const outputFile = path.resolve(__dirname, '../src/types/template.type.ts');

  if (!fs.existsSync(dirpath)) {
    console.error('❌ Error: Template directory not found:', dirpath);
    process.exit(1);
  }

  const files = fs.readdirSync(dirpath);
  const hbsFiles = files
    .filter((file) => path.extname(file) === '.hbs')
    .map((file) => `"${path.basename(file, '.hbs')}"`);

  const typeDefinition = `// ⚠️ AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n\nexport type TemplateName = ${
    hbsFiles.length > 0 ? hbsFiles.join(' | ') : 'never'
  };\n`;

  fs.writeFileSync(outputFile, typeDefinition, 'utf-8');
}

gentmplType();
