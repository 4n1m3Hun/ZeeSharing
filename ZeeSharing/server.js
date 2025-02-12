const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // CORS csomag importálása
const app = express();
const port = 3000;

// CORS engedélyezése minden kéréshez
app.use(cors());

app.get('/api/music-files', (req, res) => {
  const musicFolderPath = 'C:/ZeeSharing'; // A mappa elérési útja

  // A mappa fájljainak lekérése
  fs.readdir(musicFolderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to read directory', error: err });
    }

    // Csak a zenei fájlokat listázzuk (pl. mp3, wav, stb.)
    const musicFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.mp3' || ext === '.wav'; // Bővíthető további fájltípusokkal
    }).map(file => path.join(musicFolderPath, file));

    res.json(musicFiles); // Visszaküldjük a zenék elérési útját
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
