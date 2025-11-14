import React, { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "../components/Header";
import { useAuth } from "../components/auth/AuthContext";
import { API_BASE_URL } from "../config";

const Slider = ({ label, value, onChange, min = 0, max = 5 }) => (
  <div className="mb-8">
    <label className="block text-lg mb-2 text-gray-800">
      {label}: {value.toFixed(1)}
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step="0.1"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-rose-500"
    />
  </div>
);

const MatchSettings = () => {
  const { token } = useAuth();
  const [genreWeight, setGenreWeight] = useState(1);
  const [artistWeight, setArtistWeight] = useState(1);
  const [songWeight, setSongWeight] = useState(1);
  const [saving, setSaving] = useState(false);

  // Fetch initial settings
  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API_BASE_URL}/api/settings/match-weights/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setGenreWeight(Number(res.data.genre_weight) || 1);
        setArtistWeight(Number(res.data.artist_weight) || 1);
        setSongWeight(Number(res.data.song_weight) || 1);
      })
      .catch((err) => console.error("Failed to load settings:", err));
  }, [token]);

  const saveSettings = () => {
    if (!token) return;
    setSaving(true);

    axios
      .post(
        `${API_BASE_URL}/api/settings/match-weights/`,
        {
          genre_weight: genreWeight,
          artist_weight: artistWeight,
          song_weight: songWeight,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      )
      .then(() => {
        setSaving(false);
        alert("Settings saved successfully!");
      })
      .catch((err) => {
        console.error("Failed to save settings:", err);
        setSaving(false);
        alert("Failed to save settings. Check console for details.");
      });
  };

  return (
    <>
      <Header />

      <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl mb-6 text-center text-gray-900">
          Match Preference Settings
        </h1>

        <Slider label="Genre Importance" value={genreWeight} onChange={setGenreWeight} />
        <Slider label="Artist Importance" value={artistWeight} onChange={setArtistWeight} />
        <Slider label="Song Importance" value={songWeight} onChange={setSongWeight} />

        <button
          onClick={saveSettings}
          className="w-full mt-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </>
  );
};

export default MatchSettings;
