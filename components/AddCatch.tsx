import { API_BASE } from "@/constants/config";
import React, { useState } from "react";

interface AddCatchProps {
  onCatchAdded: () => void; // callback after successful upload
}

const AddCatch: React.FC<AddCatchProps> = ({ onCatchAdded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [species, setSpecies] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [baitUsed, setBaitUsed] = useState("");
  const [gear, setGear] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a photo of your catch.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("species", species);
    formData.append("location_description", locationDescription);
    formData.append("bait_used", baitUsed);
    formData.append("gear", gear);
    formData.append("notes", notes);

    try {
      const response = await fetch(`${API_BASE}/catches/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload catch");
      }

      await response.json();

      // reset form
      setFile(null);
      setSpecies("");
      setLocationDescription("");
      setBaitUsed("");
      setGear("");
      setNotes("");
      setSuccess(true);
      onCatchAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 p-4 border rounded-lg shadow"
    >
      <label className="bg-blue-500 text-white px-4 py-2 rounded text-center cursor-pointer">
        Upload Photo
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>
      {file && (
        <span className="text-sm text-gray-700">{file.name}</span>
      )}
      <input
        type="text"
        placeholder="Species"
        value={species}
        onChange={(e) => setSpecies(e.target.value)}
      />
      <input
        type="text"
        placeholder="Location description"
        value={locationDescription}
        onChange={(e) => setLocationDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Bait used"
        value={baitUsed}
        onChange={(e) => setBaitUsed(e.target.value)}
      />
      <input
        type="text"
        placeholder="Gear"
        value={gear}
        onChange={(e) => setGear(e.target.value)}
      />
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Add Catch"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Catch added successfully!</p>}
    </form>
  );
};

export default AddCatch;
