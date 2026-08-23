import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0755957312",
  appId: "1:351595867851:web:d47017723ec8903dc7b54e",
  apiKey: "AIzaSyDErZVDwXet3Iw49DPsHI5KlVuEJ-_jw68",
  authDomain: "gen-lang-client-0755957312.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-880e9b05-0dd6-40de-91c9-d89b5d9eb971"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, "ai-studio-880e9b05-0dd6-40de-91c9-d89b5d9eb971");
const DOC_REF = doc(db, 'app_data', 'global_state');

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.get('/api/data', async (req, res) => {
    try {
      const docSnap = await getDoc(DOC_REF);
      if (docSnap.exists()) {
        res.json(docSnap.data());
      } else {
        res.json(null);
      }
    } catch (e) {
      console.error("Error fetching data from Firestore", e);
      res.json(null);
    }
  });

  app.post('/api/data', async (req, res) => {
    try {
      await setDoc(DOC_REF, req.body);
      res.json({ success: true });
    } catch (e) {
      console.error("Error saving data to Firestore", e);
      res.status(500).json({ success: false, error: e });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
