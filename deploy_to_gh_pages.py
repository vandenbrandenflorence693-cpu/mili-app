"""
mili-app GitHub Pages 部署脚本
使用 GitHub API 直接推送 dist 目录到 gh-pages 分支

使用方法:
  python deploy_to_gh_pages.py
"""
import base64, os, sys

# ============ 配置区 ============
GITHUB_TOKEN = os.environ.get('GH_TOKEN', '')
# 如果没有设置环境变量，脚本会提示你输入
if not GITHUB_TOKEN:
    GITHUB_TOKEN = input('请输入 GitHub Token: ').strip()
REPO = 'vandenbrandenflorence693-cpu/mili-app'
DIST_DIR = r'd:/米粒/dist'
# ================================

import requests

headers = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
}

def api(url, method='GET', data=None, retries=3):
    for i in range(retries):
        try:
            r = requests.request(method, url, headers=headers, json=data, timeout=30)
            return r.status_code, r.json() if r.content else {}
        except Exception as e:
            if i < retries - 1:
                import time; time.sleep(2)
            else:
                return 0, {'error': str(e)}

def main():
    print(f"Deploying {DIST_DIR} to https://github.com/{REPO}/tree/gh-pages")
    print()

    # Step 1: Get or determine parent commit
    code_ref, ref = api(f'https://api.github.com/repos/{REPO}/git/refs/heads/gh-pages')
    gh_pages_exists = (code_ref == 200)
    if gh_pages_exists:
        parent = ref['object']['sha']
        print(f"✓ gh-pages exists, parent: {parent[:8]}")
    else:
        _, master = api(f'https://api.github.com/repos/{REPO}/git/refs/heads/master')
        parent = master['object']['sha']
        print(f"✓ New gh-pages, parent from master: {parent[:8]}")

    # Step 2: Upload dist files as blobs
    print()
    file_blobs = {}
    for root, dirs, files in os.walk(DIST_DIR):
        for name in files:
            path = os.path.join(root, name)
            rel = os.path.relpath(path, DIST_DIR).replace(os.sep, '/')
            with open(path, 'rb') as f:
                content_b64 = base64.b64encode(f.read()).decode()
            code, blob = api(f'https://api.github.com/repos/{REPO}/git/blobs', 'POST', {
                'content': content_b64, 'encoding': 'base64'
            })
            status = "✓" if code == 201 else "✗"
            print(f"  {status} {rel}: {'OK' if code == 201 else f'FAIL {code}'}")
            if code == 201:
                file_blobs[rel] = blob['sha']

    # Add .nojekyll
    code, blob = api(f'https://api.github.com/repos/{REPO}/git/blobs', 'POST', {
        'content': '', 'encoding': 'utf-8'
    })
    if code == 201:
        file_blobs['.nojekyll'] = blob['sha']
        print(f"  ✓ .nojekyll: OK")

    if not file_blobs:
        print("ERROR: No files uploaded!")
        sys.exit(1)

    # Step 3: Create tree
    print()
    tree_items = [{'path': p, 'mode': '100644', 'type': 'blob', 'sha': s}
                  for p, s in file_blobs.items()]
    code, tree = api(f'https://api.github.com/repos/{REPO}/git/trees', 'POST', {
        'tree': tree_items
    })
    if code != 201:
        print(f"ERROR: Tree creation failed: {tree}")
        sys.exit(1)
    print(f"✓ Tree created: {tree['sha'][:8]}")

    # Step 4: Create commit
    print()
    code, commit = api(f'https://api.github.com/repos/{REPO}/git/commits', 'POST', {
        'message': f'Deploy mili-app',
        'tree': tree['sha'],
        'parents': [parent]
    })
    if code != 201:
        print(f"ERROR: Commit failed: {commit}")
        sys.exit(1)
    print(f"✓ Commit created: {commit['sha'][:8]}")

    # Step 5: Update gh-pages ref
    print()
    if gh_pages_exists:
        code2, result = api(f'https://api.github.com/repos/{REPO}/git/refs/heads/gh-pages', 'PATCH',
            {'sha': commit['sha']})
    else:
        code2, result = api(f'https://api.github.com/repos/{REPO}/git/refs', 'POST',
            {'ref': 'refs/heads/gh-pages', 'sha': commit['sha']})

    if code2 in [200, 201]:
        print(f"✓ gh-pages updated!")
    else:
        print(f"ERROR: Ref update failed: {result}")
        sys.exit(1)

    print()
    print(f"========================================")
    print(f"  部署完成！")
    print(f"  网站地址: https://vandenbrandenflorence693-cpu.github.io/mili-app/")
    print(f"========================================")

if __name__ == '__main__':
    main()
