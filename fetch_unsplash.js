const https = require('https');
https.get('https://unsplash.com/napi/search/photos?query=cosmetics&per_page=30', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const urls = json.results.map(r => r.urls.raw);
      console.log(urls.join('\n'));
    } catch(e) { console.error("Error parsing", e); }
  });
}).on('error', (e) => console.error(e));
