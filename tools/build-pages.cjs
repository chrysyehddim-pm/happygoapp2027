// Only public demo files enter the deployment artifact.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
fs.mkdirSync(out,{recursive:true});
for(const name of ['index.html','style.css','app.js','.nojekyll'])fs.copyFileSync(path.join(root,name),path.join(out,name));
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true,filter:source=>!source.endsWith('-raw.png')});
console.log('GitHub Pages artifact ready: dist/');
