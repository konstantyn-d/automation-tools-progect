import os, urllib.request
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
os.makedirs('covers/pool', exist_ok=True)
ok = 0
for line in open('covers/ids.txt'):
    pid = line.strip()
    if not pid: continue
    url = f'https://images.unsplash.com/photo-{pid}?w=480&h=300&fit=crop&q=60&fm=jpg'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'image/*'})
        data = urllib.request.urlopen(req, timeout=60).read()
        if len(data) < 3000: raise ValueError('tiny')
        open(f'covers/pool/{pid}.jpg', 'wb').write(data); ok += 1
    except Exception as e:
        print('missing', pid, e)
print('downloaded', ok)
