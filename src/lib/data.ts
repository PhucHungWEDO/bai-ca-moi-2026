import fs from "fs";
import path from "path";

export interface Hymn {
  id: string;
  hymn_number: string;
  title: string;
  category: string;
  image_url: string;
  keywords: string[];
  vibes: string[];
  duration_seconds: number;
  lyrics?: string;
}

export const getAllHymns = (): Hymn[] => {
  const dataPath = path.join(process.cwd(), "src/data/hymns_data.json");
  const raw = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(raw) as Hymn[];
};

const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const searchHymns = (query: string): Hymn[] => {
  if (!query) return getAllHymns();

  const normalizedQuery = removeAccents(query.toLowerCase().trim());

  return getAllHymns().filter((hymn) => {
    const normalizedTitle = removeAccents(hymn.title);
    const normalizedNumber = hymn.hymn_number.toLowerCase();
    const keywordsMatch = hymn.keywords.some((kw) =>
      removeAccents(kw).includes(normalizedQuery)
    );
    const lyricsMatch = hymn.lyrics
      ? removeAccents(hymn.lyrics).includes(normalizedQuery)
      : false;

    return (
      normalizedTitle.includes(normalizedQuery) ||
      normalizedNumber.includes(normalizedQuery) ||
      keywordsMatch ||
      lyricsMatch
    );
  });
};