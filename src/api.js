export async function searchCards(query, nextPage = null, append = false) {
  const url = append && nextPage
    ? nextPage
    : `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=name`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.object === "error") {
    throw new Error(data.details || "No cards found.");
  }

  return data;
}
