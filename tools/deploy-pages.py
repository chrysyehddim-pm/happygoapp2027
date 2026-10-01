"""Configure this demo's Pages workflow with existing Git credentials.

Credentials remain in memory and are never written or printed.
"""
import json
import os
import subprocess
import sys
import urllib.request
import urllib.error

repo = 'chrysyehddim-pm/happygoapp2027'
env = dict(os.environ, GIT_TERMINAL_PROMPT='0', GCM_INTERACTIVE='never')
result = subprocess.run(['git', '-c', 'credential.interactive=false', 'credential', 'fill'],
    input='protocol=https\nhost=github.com\n\n', text=True, capture_output=True, env=env)
credentials = dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)
token = credentials.get('password')
if not token:
    sys.exit('Existing Git credential unavailable; no credentials were printed.')

def api(path, method='GET', body=None):
    request = urllib.request.Request('https://api.github.com/repos/' + repo + path,
        data=json.dumps(body).encode() if body is not None else None, method=method,
        headers={'Authorization': 'Bearer '+token, 'Accept':'application/vnd.github+json',
                 'X-GitHub-Api-Version':'2022-11-28', 'Content-Type':'application/json',
                 'User-Agent':'GO-surprise-deploy'})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data=response.read()
            return response.status, json.loads(data) if data else {}
    except urllib.error.HTTPError as error:
        data=json.loads(error.read())
        return error.code, {'message':data.get('message','Request failed')}

if len(sys.argv)>1 and sys.argv[1]=='setup':
    status, pages=api('/pages')
    if status==404:
        status,pages=api('/pages','POST',{'build_type':'workflow'})
    elif status==200 and pages.get('build_type')!='workflow':
        status,pages=api('/pages','PUT',{'build_type':'workflow'})
    print(json.dumps({'pages_setup_status':status,'url':pages.get('html_url'),
                      'message':pages.get('message')}))
    if status not in (200,201,204):
        sys.exit(1)
    status,data=api('/actions/workflows/pages.yml/dispatches','POST',{'ref':'main'})
    print(json.dumps({'workflow_dispatch_status':status,'message':data.get('message')}))
    if status!=204:
        sys.exit(1)
else:
    status,pages=api('/pages')
    print(json.dumps({'pages_status':status,'url':pages.get('html_url'),'build_type':pages.get('build_type')}))
    status,data=api('/actions/workflows/pages.yml/runs?per_page=3')
    print(json.dumps({'runs_status':status,'runs':[{k:r.get(k) for k in
        ['id','status','conclusion','head_sha','html_url']} for r in data.get('workflow_runs',[])]}))
