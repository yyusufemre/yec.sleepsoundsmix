const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3001;
const ROOT_DIR = path.join(__dirname, '..');
const SOUNDLIST_PATH = path.join(ROOT_DIR, 'soundlist.json');
const BUCKET_URL = 'gs://comyecsleepsoundsmix.firebasestorage.app/soundlist.json';

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-file-name');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve admin/index.html
  if ((req.method === 'GET' || req.method === 'HEAD') && (req.url === '/' || req.url === '/index.html' || !req.url.startsWith('/api'))) {
    const indexPath = path.join(__dirname, 'index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('index.html okunamadı.');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // API Endpoint 1: Publish soundlist.json to Firebase Storage
  if (req.method === 'POST' && req.url === '/api/publish') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (!Array.isArray(parsed)) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Payload bir ses listesi array olmalı.' }));
          return;
        }

        const formattedJson = JSON.stringify(parsed, null, 2);

        // 0. Automatic backup of existing soundlist.json before overwriting
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        if (fs.existsSync(SOUNDLIST_PATH)) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          fs.copyFileSync(SOUNDLIST_PATH, path.join(backupDir, `soundlist-backup-${timestamp}.json`));
        }

        // 1. Save soundlist.json locally
        fs.writeFileSync(SOUNDLIST_PATH, formattedJson, 'utf8');

        // 2. Upload soundlist.json to Firebase Storage via gcloud
        const uploadCmd = `gcloud storage cp "${SOUNDLIST_PATH}" "${BUCKET_URL}"`;

        exec(uploadCmd, (execErr, stdout, stderr) => {
          if (execErr) {
            console.error('[AdminServer] Firebase Yükleme Hatası:', stderr || execErr.message);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              error: `Firebase'e yüklenirken hata oluştu: ${stderr || execErr.message}`
            }));
            return;
          }

          console.log('[AdminServer] soundlist.json Firebase Storage\'a yüklendi!');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            success: true,
            message: "soundlist.json başarıyla yerel dosyaya kaydedildi ve Firebase Storage'a yüklendi!"
          }));
        });
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: `Geçersiz JSON formatı: ${err.message}` }));
      }
    });
    return;
  }

  // API Endpoint 2: Upload Audio file (.mp3 / .m4a) to Firebase Storage Sounds folder
  if (req.method === 'POST' && req.url === '/api/upload-audio') {
    const rawFileName = req.headers['x-file-name'] || 'audio-' + Date.now() + '.m4a';
    const fileName = decodeURIComponent(rawFileName).replace(/[^a-zA-Z0-9_.-]/g, '-');
    const uploadsDir = path.join(__dirname, 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const tempFilePath = path.join(uploadsDir, fileName);
    const writeStream = fs.createWriteStream(tempFilePath);

    req.pipe(writeStream);

    writeStream.on('finish', () => {
      const gcloudTarget = `gs://comyecsleepsoundsmix.firebasestorage.app/Sounds/${fileName}`;
      const uploadCmd = `gcloud storage cp "${tempFilePath}" "${gcloudTarget}"`;

      console.log(`[AdminServer] Ses dosyası yükleniyor: ${fileName} -> ${gcloudTarget}`);

      exec(uploadCmd, (execErr, stdout, stderr) => {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }

        if (execErr) {
          console.error('[AdminServer] Ses Yükleme Hatası:', stderr || execErr.message);
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: `Ses dosyası yüklenirken hata oluştu: ${stderr || execErr.message}` }));
          return;
        }

        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/comyecsleepsoundsmix.firebasestorage.app/o/Sounds%2F${encodeURIComponent(fileName)}?alt=media`;
        console.log(`[AdminServer] Ses yüklendi! Public URL: ${publicUrl}`);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          url: publicUrl,
          filename: fileName
        }));
      });
    });

    writeStream.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: `Dosya yazma hatası: ${err.message}` }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n🚀 Calmix Admin Server Çalışıyor: http://localhost:${PORT}`);
  console.log(`📁 Dosya: ${SOUNDLIST_PATH}`);
  console.log(`🔥 Hedef: ${BUCKET_URL}\n`);
});
