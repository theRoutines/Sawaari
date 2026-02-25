import { useState } from "react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function LocationInput({ placeholder, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const search = async (value) => {
    setQuery(value);

    if (value.length < 3) {
      setResults([]);
      return;
    }

    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&country=IN`
    );

    const data = await res.json();
    setResults(data.features || []);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      {results.length > 0 && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white shadow-xl">
          {results.map((place) => (
            <div
              key={place.id}
              onClick={() => {
                setQuery(place.place_name);
                setResults([]);
                onSelect(place);
              }}
              className="cursor-pointer px-4 py-3 text-sm hover:bg-neutral-100"
            >
              {place.place_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
