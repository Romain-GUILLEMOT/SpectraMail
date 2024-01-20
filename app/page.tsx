"use client"
import React, { useEffect, useState } from "react";
import ky from "ky";

async function fetchData() {
  try {
    const response = await ky.get('/api/mail');
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return null;
  }
}

export default function Home() {
  const [data, setData] = useState<any>();

  useEffect(() => {
    fetchData().then(fetchedData => {
      console.log(fetchedData);
      setData(fetchedData);
    });
  }, []);

  return (
      <div>
        <p>Données chargées: {JSON.stringify(data)}</p>
      </div>
  );
}
