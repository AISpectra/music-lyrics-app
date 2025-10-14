import { getLS, setLS } from './utils.mjs';

const STORAGE_KEY = 'ml:favorites:v1';

function readFavorites() {
  const list = getLS(STORAGE_KEY);
  return Array.isArray(list) ? list : [];
}

function writeFavorites(list) {
  setLS(STORAGE_KEY, list);
  dispatchChange(list);
}

function dispatchChange(list) {
  window.dispatchEvent(
    new CustomEvent('favorites:change', {
      detail: list,
    })
  );
}

function coerce(value) {
  if (!value) return null;

  const id = value.id || value.idArtist || value.slug || value.strArtist;
  const name = value.name || value.strArtist || value.title;

  if (!id || !name) return null;

  const record = {
    id: String(id),
    name,
    thumb:
      value.thumb ||
      value.strArtistThumb ||
      value.strArtistFanart ||
      value.strTrackThumb ||
      value.strAlbumThumb ||
      '',
    genre: value.genre || value.strGenre || value.strStyle || '',
    country: value.country || value.strCountry || '',
    formedYear: value.formedYear || value.intFormedYear || '',
    addedAt: value.addedAt || Date.now(),
  };

  return record;
}

export function getFavorites() {
  return readFavorites();
}

export function isFavorite(id) {
  if (!id && id !== 0) return false;
  const list = readFavorites();
  return list.some((item) => item.id === String(id));
}

export function addFavorite(payload) {
  const favorite = coerce(payload);
  if (!favorite) return { favorite: false, list: readFavorites() };

  const list = readFavorites();
  const exists = list.some((item) => item.id === favorite.id);
  if (exists) {
    return { favorite: true, list };
  }

  const next = [favorite, ...list].slice(0, 25);
  writeFavorites(next);
  return { favorite: true, list: next };
}

export function removeFavorite(id) {
  if (!id && id !== 0) return readFavorites();
  const list = readFavorites();
  const next = list.filter((item) => item.id !== String(id));
  if (next.length !== list.length) {
    writeFavorites(next);
  }
  return next;
}

export function toggleFavorite(payload) {
  const favorite = coerce(payload);
  if (!favorite) {
    return { favorite: false, list: readFavorites() };
  }

  const list = readFavorites();
  const index = list.findIndex((item) => item.id === favorite.id);

  if (index >= 0) {
    const next = [...list.slice(0, index), ...list.slice(index + 1)];
    writeFavorites(next);
    return { favorite: false, list: next };
  }

  favorite.addedAt = Date.now();
  const next = [favorite, ...list].slice(0, 25);
  writeFavorites(next);
  return { favorite: true, list: next };
}

export function updateFavorite(payload) {
  const favorite = coerce(payload);
  if (!favorite) return { favorite: false, list: readFavorites() };

  const list = readFavorites();
  const index = list.findIndex((item) => item.id === favorite.id);

  if (index >= 0) {
    const next = [...list];
    favorite.addedAt = next[index].addedAt || favorite.addedAt;
    next[index] = { ...next[index], ...favorite };
    writeFavorites(next);
    return { favorite: true, list: next };
  }

  return addFavorite(favorite);
}

export function clearFavorites() {
  writeFavorites([]);
}

export function asFavoritePayload(artist = {}) {
  return {
    id: artist.idArtist || artist.id || artist.strArtist,
    name: artist.strArtist || artist.name || '',
    thumb: artist.strArtistThumb || artist.strArtistFanart || '',
    genre: artist.strGenre || '',
    country: artist.strCountry || '',
    formedYear: artist.intFormedYear || '',
  };
}