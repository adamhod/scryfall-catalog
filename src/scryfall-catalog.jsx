import { useState, useCallback } from "react";
import { searchCards } from "./api";

const COLORS = [
  { code: "W", label: "White", symbol: "☀️" },
  { code: "U", label: "Blue", symbol: "💧" },
  { code: "B", label: "Black", symbol: "💀" },
  { code: "R", label: "Red", symbol: "🔥" },
  { code: "G", label: "Green", symbol: "🌲" },
];

const TYPES = ["Creature", "Instant", "Sorcery", "Enchantment", "Artifact", "Planeswalker", "Land"];
const RARITIES = ["common", "uncommon", "rare", "mythic"];
const FORMATS = ["standard", "pioneer", "modern", "legacy", "vintage", "commander", "pauper"];

const COLOR_STYLES = {
  W: { bg: "#f9f3e3", border: "#d4b96a", text: "#7a6520" },
  U: { bg: "#d8eaf8", border: "#4a90c4", text: "#1a4a7a" },
  B: { bg: "#2a2a2a", border: "#666", text: "#ccc" },
  R: { bg: "#fde8d8", border: "#e05020", text: "#8a2000" },
  G: { bg: "#d8f0d8", border: "#3a8a3a", text: "#1a5a1a" },
};

const RARITY_COLORS = {
  common: "#aaa",
  uncommon: "#aab8c2",
  rare: "#d4af37",
  mythic: "#e07020",
};

function buildQuery(filters) {
  const parts = [];
  if (filters.colors.length > 0) parts.push(`c:${filters.colors.join("")}`);
  if (filters.type) parts.push(`t:${filters.type.toLowerCase()}`);
  if (filters.rarity) parts.push(`r:${filters.rarity}`);
  if (filters.format) parts.push(`f:${filters.format}`);
  if (filters.maxCost !== "") parts.push(`cmc<=${filters.maxCost}`);
  if (filters.minCost !== "") parts.push(`cmc>=${filters.minCost}`);
  if (filters.text) parts.push(filters.text);
  return parts.join(" ") || "type:creature";
}

function CardSkeleton() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      borderRadius: "12px",
      overflow: "hidden",
      aspectRatio: "0.72",
      animation: "pulse 1.5s ease-in-out infinite",
    }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
    </div>
  );
}

function CardItem({ card, onClick }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;

  return (
    <div
      onClick={() => onClick(card)}
      style={{
        cursor: "pointer",
        borderRadius: "12px",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.6)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
      }}
    >
      {!imgLoaded && <CardSkeleton />}
      {imgUrl && (
        <img
          src={imgUrl}
          alt={card.name}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: "100%",
            display: imgLoaded ? "block" : "none",
            borderRadius: "12px",
          }}
        />
      )}
      {!imgUrl && imgLoaded === false && (
        <div style={{
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          borderRadius: "12px",
          padding: "16px",
          aspectRatio: "0.72",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#aaa",
          fontSize: "13px",
          textAlign: "center",
        }}>
          {card.name}
        </div>
      )}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
        padding: "24px 10px 10px",
        borderRadius: "0 0 12px 12px",
        opacity: 0,
        transition: "opacity 0.2s",
      }}
        className="card-overlay"
      >
        <div style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>{card.name}</div>
        <div style={{ color: RARITY_COLORS[card.rarity], fontSize: "11px", textTransform: "capitalize" }}>{card.rarity}</div>
      </div>
    </div>
  );
}

function CardModal({ card, onClose }) {
  if (!card) return null;
  const imgUrl = card.image_uris?.large || card.card_faces?.[0]?.image_uris?.large;
  const price = card.prices?.usd;
  const priceForix = card.prices?.usd_foil;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "20px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)",
          borderRadius: "20px",
          padding: "28px",
          maxWidth: "700px",
          width: "100%",
          display: "flex",
          gap: "28px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.8)",
          maxHeight: "90vh",
          overflowY: "auto",
          flexWrap: "wrap",
        }}
      >
        {imgUrl && (
          <img src={imgUrl} alt={card.name} style={{ width: "240px", borderRadius: "12px", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ color: "#fff", fontSize: "22px", fontWeight: 700, marginBottom: "6px", fontFamily: "Georgia, serif" }}>
            {card.name}
          </div>
          <div style={{ color: "#aaa", fontSize: "14px", marginBottom: "16px" }}>
            {card.type_line}
          </div>
          {card.oracle_text && (
            <div style={{
              color: "#ccc", fontSize: "14px", lineHeight: "1.6",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px", padding: "14px",
              marginBottom: "16px",
              borderLeft: "3px solid rgba(212,175,55,0.5)",
            }}>
              {card.oracle_text}
            </div>
          )}
          {card.flavor_text && (
            <div style={{ color: "#888", fontSize: "13px", fontStyle: "italic", marginBottom: "16px" }}>
              "{card.flavor_text}"
            </div>
          )}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {card.mana_cost && (
              <Pill label="Mana" value={card.mana_cost} color="#d4af37" />
            )}
            {card.rarity && (
              <Pill label="Rarity" value={card.rarity} color={RARITY_COLORS[card.rarity]} />
            )}
            {card.set_name && (
              <Pill label="Set" value={card.set_name} color="#aaa" />
            )}
            {card.power && (
              <Pill label="P/T" value={`${card.power}/${card.toughness}`} color="#e07020" />
            )}
          </div>
          {(price || priceForix) && (
            <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
              {price && <Pill label="USD" value={`$${price}`} color="#4caf50" />}
              {priceForix && <Pill label="Foil" value={`$${priceForix}`} color="#9c6fe4" />}
            </div>
          )}
          <a
            href={card.scryfall_uri}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 20px",
              background: "linear-gradient(135deg, #d4af37, #a07820)",
              color: "#000",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            View on Scryfall ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function Pill({ label, value, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.07)",
      borderRadius: "6px",
      padding: "6px 10px",
      fontSize: "12px",
    }}>
      <span style={{ color: "#777" }}>{label}: </span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}

export default function ScryfallCatalog() {
  const [filters, setFilters] = useState({
    colors: [], type: "", rarity: "", format: "",
    minCost: "", maxCost: "", text: "",
  });
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const [totalCards, setTotalCards] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
const search = useCallback(async (append = false) => {
    setLoading(true);
    setError("");
    const query = buildQuery(filters);

    try {
      const data = await searchCards(query, nextPage, append);
      setCards(prev => append ? [...prev, ...data.data] : data.data);
      setNextPage(data.has_more ? data.next_page : null);
      setTotalCards(data.total_cards || 0);
      setHasSearched(true);
    } catch (err) {
      setError(err.message || "Failed to reach Scryfall. Check your connection.");
      if (!append) setCards([]);
    } finally {
      setLoading(false);
    }
  }, [filters, nextPage]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleColor = (code) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(code)
        ? prev.colors.filter(c => c !== code)
        : [...prev.colors, code],
    }));
  };

  const handleSearch = () => {
    setNextPage(null);
    search(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #080812 0%, #0f0f1e 50%, #080812 100%)",
      fontFamily: "'Trebuchet MS', sans-serif",
      color: "#fff",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        select option { background: #1a1a2e; }
        .card-grid > div:hover .card-overlay { opacity: 1 !important; }
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: "center",
        padding: "48px 20px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          fontSize: "42px",
          fontWeight: 800,
          letterSpacing: "-1px",
          fontFamily: "Georgia, serif",
          background: "linear-gradient(135deg, #d4af37, #f0d060, #a07820)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "8px",
        }}>
          ✦ Arcane Catalog ✦
        </div>
        <div style={{ color: "#666", fontSize: "15px", letterSpacing: "3px", textTransform: "uppercase" }}>
          Magic: The Gathering Card Search
        </div>
      </div>

      {/* Filter Panel */}
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 24px",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "28px",
          marginBottom: "32px",
        }}>

          {/* Color Filter */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ color: "#888", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
              Colors
            </label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {COLORS.map(c => {
                const active = filters.colors.includes(c.code);
                return (
                  <button
                    key={c.code}
                    onClick={() => toggleColor(c.code)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: `2px solid ${active ? COLOR_STYLES[c.code].border : "rgba(255,255,255,0.1)"}`,
                      background: active ? COLOR_STYLES[c.code].bg : "rgba(255,255,255,0.04)",
                      color: active ? COLOR_STYLES[c.code].text : "#aaa",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: active ? 700 : 400,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {c.symbol} {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2 filters */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div>
              <label style={{ color: "#888", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Type</label>
              <select value={filters.type} onChange={e => handleFilterChange("type", e.target.value)} style={selectStyle}>
                <option value="">Any</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#888", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Rarity</label>
              <select value={filters.rarity} onChange={e => handleFilterChange("rarity", e.target.value)} style={selectStyle}>
                <option value="">Any</option>
                {RARITIES.map(r => <option key={r} value={r} style={{ color: RARITY_COLORS[r] }}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#888", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Format</label>
              <select value={filters.format} onChange={e => handleFilterChange("format", e.target.value)} style={selectStyle}>
                <option value="">Any</option>
                {FORMATS.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#888", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Min Mana Cost</label>
              <input type="number" min="0" max="20" placeholder="0" value={filters.minCost}
                onChange={e => handleFilterChange("minCost", e.target.value)}
                onKeyDown={handleKeyDown} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: "#888", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Max Mana Cost</label>
              <input type="number" min="0" max="20" placeholder="10" value={filters.maxCost}
                onChange={e => handleFilterChange("maxCost", e.target.value)}
                onKeyDown={handleKeyDown} style={inputStyle} />
            </div>
          </div>

          {/* Text search */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ color: "#888", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Card Name or Text
            </label>
            <input
              type="text"
              placeholder='e.g. "flying" or "Dragon"'
              value={filters.text}
              onChange={e => handleFilterChange("text", e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ ...inputStyle, width: "100%" }}
            />
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? "rgba(212,175,55,0.3)"
                : "linear-gradient(135deg, #d4af37 0%, #a07820 100%)",
              color: loading ? "#aaa" : "#000",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "1px",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Searching..." : "✦ Search Cards"}
          </button>
        </div>

        {/* Results header */}
        {hasSearched && !error && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ color: "#888", fontSize: "14px" }}>
              Showing <span style={{ color: "#d4af37" }}>{cards.length}</span>
              {totalCards > 0 && <> of <span style={{ color: "#d4af37" }}>{totalCards.toLocaleString()}</span></>} cards
            </div>
            <div style={{ color: "#555", fontSize: "12px", letterSpacing: "1px" }}>
              Query: <span style={{ color: "#777" }}>{buildQuery(filters)}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(220,50,50,0.1)",
            border: "1px solid rgba(220,50,50,0.3)",
            borderRadius: "10px",
            padding: "16px 20px",
            color: "#e07070",
            marginBottom: "24px",
          }}>
            {error}
          </div>
        )}

        {/* Card Grid */}
        <div
          className="card-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          {cards.map(card => (
            <CardItem key={card.id} card={card} onClick={setSelectedCard} />
          ))}
          {loading && !cards.length && Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Load more */}
        {nextPage && !loading && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              onClick={() => search(true)}
              style={{
                padding: "12px 40px",
                background: "rgba(212,175,55,0.1)",
                border: "1px solid rgba(212,175,55,0.4)",
                borderRadius: "10px",
                color: "#d4af37",
                fontSize: "14px",
                cursor: "pointer",
                letterSpacing: "1px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(212,175,55,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(212,175,55,0.1)"}
            >
              Load More Cards
            </button>
          </div>
        )}

        {loading && cards.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "30px", color: "#888" }}>Loading more...</div>
        )}

        {/* Empty state */}
        {!loading && !error && hasSearched && cards.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#555" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔮</div>
            <div>No cards matched your search.</div>
          </div>
        )}

        {!hasSearched && (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#444" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>✦</div>
            <div style={{ fontSize: "18px", color: "#666", marginBottom: "8px" }}>Set your filters and search</div>
            <div style={{ fontSize: "14px" }}>Powered by the Scryfall API</div>
          </div>
        )}
      </div>

      {/* Modal */}
      <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
