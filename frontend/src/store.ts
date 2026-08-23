import { useState, useEffect, useCallback } from 'react';

const LS = "stv3_";

const fetchData = async () => {
  try {
    const res = await fetch('/api/data');
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch data", e);
    return null;
  }
};

const pushData = async (data: any) => {
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error("Failed to push data", e);
  }
};

let globalState: any = null;
let saveTimeout: any = null;

export const useStore = (key: string, seed: any) => {
  const [val, setVal] = useState(() => {
    try {
      const v = localStorage.getItem(LS + key);
      return v ? JSON.parse(v) : seed;
    } catch {
      return seed;
    }
  });

  useEffect(() => {
    const load = async () => {
      if (!globalState) {
        const remoteData = await fetchData();
        if (remoteData) {
          globalState = remoteData;
        } else {
          globalState = {};
        }
      }
      if (globalState[key] !== undefined) {
        setVal(globalState[key]);
        localStorage.setItem(LS + key, JSON.stringify(globalState[key]));
      }
    };
    load();
  }, [key]);

  const set = useCallback((updater: any) => {
    setVal((prev: any) => {
      const nextVal = typeof updater === "function" ? updater(prev) : updater;
      
      try { localStorage.setItem(LS + key, JSON.stringify(nextVal)); } catch {}
      
      if (!globalState) globalState = {};
      globalState[key] = nextVal;
      
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        pushData(globalState);
      }, 500);
      
      return nextVal;
    });
  }, [key]);

  return [val, set] as const;
};

export const lsG = (k: string, fb: any) => {
  try {
    const v = localStorage.getItem(LS + k);
    return v ? JSON.parse(v) : fb;
  } catch {
    return fb;
  }
};

export const lsS = (k: string, v: any) => {
  try {
    localStorage.setItem(LS + k, JSON.stringify(v));
  } catch {}
};
