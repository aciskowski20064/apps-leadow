// Pozwala całkowicie wyłączyć import z Google Maps (np. gdy nie chcesz płacić
// za Google Places API) bez wpływu na ręczne dodawanie leadów. Domyślnie
// włączone — ustaw VITE_ENABLE_GOOGLE_IMPORT=false w .env, żeby wyłączyć.
export const isGoogleImportEnabled = import.meta.env.VITE_ENABLE_GOOGLE_IMPORT !== "false"
