import express from 'express';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0755957312",
  appId: "1:351595867851:web:d47017723ec8903dc7b54e",
  apiKey: "AIzaSyDErVZDwXet3Iw49DPsHI5KlVuEJ-_jw68",
  authDomain: "gen-lang-client-0755957312.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-880e9b05-0dd6-40de-91c9-d89b5d9eb971"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, "ai-studio-880e9b05-0dd6-40de-91c9-d89b5d9eb971");
const DOC_REF = doc(db, 'app_data', 'global_state');

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json({ limit: '50mb' }));

app.get('/', (_req, res) => {
  res.json({ service: 'SiteTrack backend', status: 'ok' });
});

app.get('/api/data', async (_req, res) => {
  try {
    const docSnap = await getDoc(DOC_REF);
    res.json(docSnap.exists() ? docSnap.data() : null);
  } catch (error) {
    console.error("Error fetching data from Firestore", error);
    res.json(null);
  }
});

app.post('/api/data', async (req, res) => {
  try {
    await setDoc(DOC_REF, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving data to Firestore", error);
    res.status(500).json({ success: false, error });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend API running on port ${PORT}`);
});
