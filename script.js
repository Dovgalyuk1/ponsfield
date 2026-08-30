/* ===== Lord Ponsfield — $PONSFIELD =====
   Replace the placeholder values below once the token actually exists.
   Nothing here fabricates numbers — if CA is empty, the site honestly
   shows "TBD" / "Not deployed yet" instead of fake stats. */

const CONFIG = {
  // Paste the real contract address here once minted, e.g. "0xABC123..." or a Solana mint address.
  CA: "",

  // Where "Buy" should send people (pump.fun page, DEX swap URL, launchpad page, etc).
  BUY_URL: "",

  // DexScreener / chart URL. If left empty and CA is set, we try to guess a DexScreener URL.
  CHART_URL: "",

  X_URL: "",
  TELEGRAM_URL: "",
};

// ---------- Wire up social/CTA links from CONFIG ----------
function wireLinks() {
  const setHref = (selector, url) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (url) {
        el.href = url;
        el.removeAttribute("aria-disabled");
      } else {
        el.href = "#";
        el.setAttribute("aria-disabled", "true");
      }
    });
  };

  setHref('[data-role="chart-link"]', CONFIG.CHART_URL || guessChartUrl());
  setHref('[data-role="x-link"]', CONFIG.X_URL);
  setHref('[data-role="telegram-link"]', CONFIG.TELEGRAM_URL);

  const buyBtn = document.querySelector('.btn--marigold[href="#ca"]');
  if (buyBtn && CONFIG.BUY_URL) {
    buyBtn.href = CONFIG.BUY_URL;
    buyBtn.target = "_blank";
    buyBtn.rel = "noopener";
  }
}

function guessChartUrl() {
  if (!CONFIG.CA) return "";
  return `https://dexscreener.com/search?q=${encodeURIComponent(CONFIG.CA)}`;
}

// ---------- Ticker: CA display + copy ----------
function wireTicker() {
  const caField = document.querySelector('[data-field="ca"]');
  const copyBtn = document.getElementById("copyBtn");

  if (CONFIG.CA) {
    caField.textContent = CONFIG.CA;
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(CONFIG.CA).then(() => {
        const original = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = original), 1500);
      });
    });
  } else {
    caField.textContent = "Not deployed yet";
    copyBtn.textContent = "N/A";
    copyBtn.disabled = true;
    copyBtn.style.opacity = "0.4";
    copyBtn.style.cursor = "not-allowed";
  }
}

// ---------- Live price/volume/change from DexScreener, only if CA exists ----------
async function loadMarketData() {
  if (!CONFIG.CA) return; // Honest placeholder stays as "TBD" — no invented numbers.

  const priceField = document.querySelector('[data-field="price"]');
  const volField = document.querySelector('[data-field="vol"]');
  const changeField = document.querySelector('[data-field="change"]');

  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONFIG.CA}`);
    const data = await res.json();
    const pair = data && data.pairs && data.pairs[0];

    if (!pair) {
      priceField.textContent = "Not indexed yet";
      volField.textContent = "—";
      changeField.textContent = "—";
      return;
    }

    priceField.textContent = pair.priceUsd ? `$${Number(pair.priceUsd).toFixed(6)}` : "—";
    volField.textContent = pair.volume?.h24 ? `$${Number(pair.volume.h24).toLocaleString()}` : "—";

    const change = pair.priceChange?.h24;
    if (typeof change === "number") {
      changeField.textContent = `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
      changeField.style.color = change >= 0 ? "#7fbf7a" : "#e0765a";
    }
  } catch (err) {
    priceField.textContent = "Unavailable";
    volField.textContent = "—";
    changeField.textContent = "—";
    console.warn("DexScreener fetch failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  wireLinks();
  wireTicker();
  loadMarketData();
});
