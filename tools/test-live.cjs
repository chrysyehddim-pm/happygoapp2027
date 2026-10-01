// Run the same journey regression against the published demo.
const fs=require('fs'),path=require('path'),Module=require('module');
const filename=path.resolve(__dirname,'test-demo.cjs');
const source=fs.readFileSync(filename,'utf8').replace("await page.goto('http://127.0.0.1:4173/demo/');", "await page.goto('https://chrysyehddim-pm.github.io/happygoapp2027/');");
const runner=new Module(filename,module);
runner.filename=filename;runner.paths=Module._nodeModulePaths(path.dirname(filename));
runner._compile(source,filename);
