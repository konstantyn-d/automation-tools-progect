import json, os, time, urllib.parse, urllib.request
Q = json.load(open('covers/queries.json'))
H = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36', 'Accept': 'application/json'}
def get(url, accept=None):
    h = dict(H)
    if accept: h['Accept'] = accept
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=60) as r:
        return r.read()
os.makedirs('covers/candidates', exist_ok=True)
meta = {}
for slug, q in Q.items():
    try:
        data = json.loads(get('https://unsplash.com/napi/search/photos?' + urllib.parse.urlencode({'query': q, 'per_page': 20, 'orientation': 'landscape'})))
    except Exception as e:
        print('search failed', slug, e); continue
    picks = []
    for p in data.get('results', []):
        if p.get('premium') or p.get('plus') or 'plus.unsplash.com' in p['urls']['raw']:
            continue
        picks.append(p)
        if len(picks) == 6: break
    meta[slug] = []
    for i, p in enumerate(picks):
        url = p['urls']['raw'] + '&w=640&h=400&fit=crop&q=70&fm=jpg'
        try:
            open(f'covers/candidates/{slug}-{i}.jpg', 'wb').write(get(url, 'image/*'))
        except Exception as e:
            print('download failed', slug, i, e); continue
        meta[slug].append({'i': i, 'id': p['id'], 'raw': p['urls']['raw'], 'author': p['user']['name'], 'username': p['user']['username'], 'alt': p.get('alt_description'), 'link': p['links']['html']})
    print(slug, len(meta[slug]))
    time.sleep(0.5)
json.dump(meta, open('covers/meta.json', 'w'), indent=1)
