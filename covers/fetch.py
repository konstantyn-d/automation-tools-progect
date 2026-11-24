import json, os, re, time, urllib.parse, urllib.request
Q = json.load(open('covers/queries.json'))
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
def get(url, accept='*/*'):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': accept, 'Accept-Language': 'en-US,en;q=0.9'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def unsplash(q):
    html = get('https://unsplash.com/s/photos/' + urllib.parse.quote(q.replace(' ', '-')) + '?orientation=landscape', 'text/html').decode('utf-8', 'replace')
    ids = []
    for m in re.finditer(r'https://images\.unsplash\.com/(photo-[0-9]+-[0-9a-f]+)', html):
        if m.group(1) not in ids: ids.append(m.group(1))
    # photographer names appear as "Photo by NAME" in alt/aria texts; keep the page links for credits
    return [{'src': 'unsplash', 'id': i, 'url': f'https://images.unsplash.com/{i}?w=640&h=400&fit=crop&q=70&fm=jpg', 'raw': f'https://images.unsplash.com/{i}'} for i in ids]

def openverse(q):
    data = json.loads(get('https://api.openverse.org/v1/images/?' + urllib.parse.urlencode({'q': q, 'license_type': 'commercial', 'aspect_ratio': 'wide', 'size': 'large', 'page_size': 12}), 'application/json'))
    return [{'src': 'openverse', 'id': r['id'], 'url': r['url'], 'raw': r['url'], 'author': r.get('creator'), 'license': f"{r.get('license')} {r.get('license_version')}", 'link': r.get('foreign_landing_url'), 'title': r.get('title')} for r in data.get('results', [])]

os.makedirs('covers/candidates', exist_ok=True)
meta = {}
for slug, q in Q.items():
    found = []
    for name, fn in (('unsplash', unsplash), ('openverse', openverse)):
        try:
            found = fn(q)
        except Exception as e:
            print(slug, name, 'failed', e)
            found = []
        if len(found) >= 4: break
    meta[slug] = []
    for i, p in enumerate(found[:6]):
        try:
            data = get(p['url'], 'image/*')
            if len(data) < 5000: raise ValueError('too small')
            open(f'covers/candidates/{slug}-{i}.jpg', 'wb').write(data)
            meta[slug].append({**p, 'i': i})
        except Exception as e:
            print(slug, i, 'download failed', e)
    print(slug, len(meta[slug]), meta[slug][0]['src'] if meta[slug] else '-')
    time.sleep(1)
json.dump(meta, open('covers/meta.json', 'w'), indent=1)
