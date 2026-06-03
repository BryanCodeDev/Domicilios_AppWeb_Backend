import fs from 'fs/promises';
import path from 'path';

const filePath = path.join('C:\\Users\\aprendizsistemas\\Documents\\proyecto3\\backend\\src\\config\\database.js');
const content = await fs.readFile(filePath, 'utf-8');
const buf = await fs.readFile(filePath);
const firstBytes = Array.from(buf.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' ');
console.log('First bytes:', firstBytes);
console.log('Length:', buf.length);
console.log('Char 0 code:', buf[0]);
console.log('Is BOM:', buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF);
console.log('Content snippet:', content.slice(0, 100));
