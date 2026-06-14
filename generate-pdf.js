import fs from 'fs';
import { data } from './src/data.js';

let mdContent = '# Wszystkie pytania\n\n';

data.forEach((section) => {
  mdContent += `## ${section.topic}\n\n`;
  section.questions.forEach((q, i) => {
    mdContent += `**${i + 1}. ${q.q}**\n\n`;
    mdContent += `*Odp:* ${q.a}\n\n`;
  });
});

fs.writeFileSync('pytania.md', mdContent, 'utf-8');
console.log('Markdown generated successfully');
