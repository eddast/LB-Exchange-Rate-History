let fs = require('fs');
try {
  let f = fs.readFileSync('.env.json', {flag: 'w'});
  var m = JSON.parse(f.toString());
} catch (e) {
  m = {}
}
m.mode = process.argv[2];
fs.writeFile('.env.json', JSON.stringify(m));