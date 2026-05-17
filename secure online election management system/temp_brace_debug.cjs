const fs = require('fs');
const path = 'c:/Users/PICID/Desktop/secure online election management system/src/pages/elections/ElectionDetailPage.tsx';
const text = fs.readFileSync(path, 'utf8');
const lines = text.split(/\r?\n/);
let b=0,p=0,q=0;
for(let i=0;i<lines.length;i++){
  const line = lines[i];
  for(const c of line){
    if(c==='{' ) b++;
    else if(c==='}') b--;
    else if(c==='(') p++;
    else if(c===')') p--;
    else if(c==='[') q++;
    else if(c===']') q--;
  }
  if(i >= 250 && i <= 370){
    console.log(`${i+1} b=${b} p=${p} q=${q} |${line}|`);
  }
}
console.log('final', b, p, q);
