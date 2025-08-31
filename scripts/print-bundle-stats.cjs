const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(dist)) {
  console.log('No dist found.');
  process.exit(0);
}

function walk(dir, res = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, res);
    else res.push({ p, size: st.size });
  }
  return res;
}
const files = walk(dist).sort((a, b) => b.size - a.size).slice(0, 20);
console.log('Largest bundle files:');
for (const f of files) console.log(`${Math.round(f.size / 1024)} KiB\t${path.relative(dist, f.p)}`);