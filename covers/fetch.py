import json, os, urllib.request
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
final = json.load(open('covers/final.json'))
os.makedirs('covers/final', exist_ok=True)
for slug, pid in final.items():
    url = f'https://images.unsplash.com/photo-{pid}?w=720&h=720&fit=crop&crop=entropy&q=72&fm=jpg'
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'image/*'})
    open(f'covers/final/{slug}.jpg', 'wb').write(urllib.request.urlopen(req, timeout=60).read())
    print(slug, 'ok')
