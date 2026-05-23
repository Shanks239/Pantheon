import { useState, useEffect, useRef } from "react";
import { connectWallet, mintVerdict, buildTokenURI, shortAddress, scanWalletTokens } from "../lib/wallet.js";

const CONTRACT_ADDRESS = '0x7D7D338BAb8e19bad2c0959f15fe5d7ad6737708';

const CATEGORIES = [
  { id:"immortals",  label:"Immortals",  desc:"The ones who defined the game" },
  { id:"contenders", label:"Contenders", desc:"The generation still fighting for glory" },
  { id:"heirs",      label:"The Heirs",  desc:"The future arriving now" },
];

const LEGENDS = [
  { id:"pele",       name:"Pelé",          nation:"Brazil",    flag:"🇧🇷", trophy:"3× World Champion",    era:"1958–1970",    cat:"immortals" },
  { id:"maradona",   name:"Maradona",       nation:"Argentina", flag:"🇦🇷", trophy:"1986 World Champion",   era:"1982–1994",    cat:"immortals" },
  { id:"zidane",     name:"Zidane",         nation:"France",    flag:"🇫🇷", trophy:"1998 World Champion",   era:"1994–2006",    cat:"immortals" },
  { id:"r9",         name:"Ronaldo R9",     nation:"Brazil",    flag:"🇧🇷", trophy:"2× World Champion",    era:"1994–2002",    cat:"immortals" },
  { id:"ronaldinho", name:"Ronaldinho",     nation:"Brazil",    flag:"🇧🇷", trophy:"2002 World Champion",   era:"1999–2013",    cat:"immortals" },
  { id:"klose",      name:"Klose",          nation:"Germany",   flag:"🇩🇪", trophy:"All-time Top Scorer",   era:"2002–2014",    cat:"immortals" },
  { id:"henry",      name:"Thierry Henry",  nation:"France",    flag:"🇫🇷", trophy:"1998 World Champion",   era:"1995–2010",    cat:"immortals" },
  { id:"messi",      name:"Messi",          nation:"Argentina", flag:"🇦🇷", trophy:"2022 World Champion",   era:"2006–present", cat:"contenders" },
  { id:"cr7",        name:"Ronaldo CR7",    nation:"Portugal",  flag:"🇵🇹", trophy:"5× Ballon d'Or",       era:"2003–present", cat:"contenders" },
  { id:"neymar",     name:"Neymar",         nation:"Brazil",    flag:"🇧🇷", trophy:"Olympic Gold 2016",     era:"2010–present", cat:"contenders" },
  { id:"mbappe",     name:"Mbappé",         nation:"France",    flag:"🇫🇷", trophy:"2018 World Champion",   era:"2016–present", cat:"contenders" },
  { id:"yamal",      name:"Lamine Yamal",   nation:"Spain",     flag:"🇪🇸", trophy:"Euro 2024 Champion",    era:"2023–present", cat:"heirs" },
  { id:"vini",       name:"Vinicius Jr",    nation:"Brazil",    flag:"🇧🇷", trophy:"2× UCL Winner",        era:"2018–present", cat:"heirs" },
  { id:"saka",       name:"Bukayo Saka",    nation:"England",   flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", trophy:"Arsenal Captain",      era:"2019–present", cat:"heirs" },
  { id:"bellingham", name:"Bellingham",     nation:"England",   flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", trophy:"UCL Winner 2024",       era:"2020–present", cat:"heirs" },
  { id:"pedri",      name:"Pedri",          nation:"Spain",     flag:"🇪🇸", trophy:"Euro 2024 Champion",    era:"2020–present", cat:"heirs" },
];

const PERSONAS = {
  pele:       "You are Pelé. The King. Three World Cups. Speak with warmth and absolute authority. Brazil's attacking soul is eternal. Reference 1970 as the pinnacle. Be magnanimous but immovable. 2-3 sentences only, no preamble.",
  maradona:   "You are Diego Maradona. Volcanic. Passionate. You carried Argentina to 1986 glory alone. Individual genius beats systems always. Be loud, provocative. Reference 1986 constantly. 2-3 sentences only, no preamble.",
  zidane:     "You are Zinedine Zidane. Calm, precise, authoritative. European tactical depth beats South American flair at tournament level. Every word is deliberate. 2-3 sentences only, no preamble.",
  r9:         "You are Ronaldo Nazário, R9. Two World Cups. Explosive, charismatic. Brazil's forward tradition is unmatched. Reference your 2002 final. 2-3 sentences only, no preamble.",
  ronaldinho: "You are Ronaldinho. Joy above all. 2002 champion. Teams that play with freedom beat fear. Football is art. 2-3 sentences only, no preamble.",
  klose:      "You are Miroslav Klose. World Cup all-time top scorer. German. Clinical. Systems win knockout football. Be blunt and precise. 2-3 sentences only, no preamble.",
  henry:      "You are Thierry Henry. Sharp, analytical. European tactical depth dominates the modern tournament. Almost impatient with emotional arguments. 2-3 sentences only, no preamble.",
  messi:      "You are Lionel Messi. 2022 champion. Understated. Your words carry 20 years of patience. Argentina's collective spine beats everything. Speak rarely and precisely. 2-3 sentences only, no preamble.",
  cr7:        "You are Cristiano Ronaldo. Five Ballons d'Or. The World Cup still burns. Portugal is chronically underestimated. Loudly self-confident. 2-3 sentences only, no preamble.",
  neymar:     "You are Neymar. Brazil's most gifted of your generation, haunted by injury and the 7-1. When fit, no one stops Brazil. 2026 is redemption. 2-3 sentences only, no preamble.",
  mbappe:     "You are Kylian Mbappé. 2018 champion at 19. Fastest and most lethal attacker alive. France's attack in 2026 is yours to lead. 2-3 sentences only, no preamble.",
  yamal:      "You are Lamine Yamal. Seventeen and a Euro 2024 champion. Fearless certainty. Spain's system is the most unbeatable right now. 2-3 sentences only, no preamble.",
  vini:       "You are Vinicius Jr. Real Madrid. Brazil. Fire and joy combined. Brazil's front line in 2026 is the most dangerous on earth. 2-3 sentences only, no preamble.",
  saka:       "You are Bukayo Saka. Arsenal's heartbeat. England's most consistent performer. England's squad depth in 2026 is the best in their history. 2-3 sentences only, no preamble.",
  bellingham: "You are Jude Bellingham. Real Madrid engine. Champions League winner. You carry a nation's expectations lightly. 2-3 sentences only, no preamble.",
  pedri:      "You are Pedri. Barcelona and Spain's creative heart. Euro 2024 champion. Spain's possession makes them the team to beat in 2026. 2-3 sentences only, no preamble.",
};

const ROMAN = ["I","II","III","IV","V"];
const GOLD = "#D4A843";
const GOLD_DIM = "rgba(212,168,67,0.1)";
const GOLD_BORDER = "rgba(212,168,67,0.3)";
const BG = "#08080C";
const CREAM = "#F5EDD8";
const MUTED = "rgba(245,237,216,0.45)";

async function callLegend(legendId, content) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: PERSONAS[legendId],
      messages: [{ role: "user", content }],
    }),
  });
  const d = await res.json();
  return d.content?.[0]?.text ?? "...";
}

async function callConsensus(question, messages) {
  const transcript = messages
    .map((m) => {
      const lg = LEGENDS.find((l) => l.id === m.legendId);
      return `${lg ? lg.name : "User"}: ${m.content}`;
    })
    .join("\n");
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: "Distill this football legend debate into one concise verdict. State who they predict wins 2026 and the core reason. Note the sharpest disagreement if any. 3-4 sentences, no preamble.",
      messages: [{ role: "user", content: `Question: "${question}"\n\nDebate:\n${transcript}\n\nVerdict:` }],
    }),
  });
  const d = await res.json();
  return d.content?.[0]?.text ?? "No consensus reached.";
}

function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4,
      s: Math.random() * 0.35 + 0.1,
      o: Math.random() * 0.5 + 0.08,
      d: (Math.random() - 0.5) * 0.25,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.s;
        p.x += p.d;
        if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,67,${p.o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

function VideoBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <video autoPlay muted loop playsInline preload="auto"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }}>
        <source src="/videos/stadium.mp4" type="video/mp4" />
      </video>
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,8,12,0.82)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(212,168,67,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(212,168,67,0.03) 60px)" }} />
    </div>
  );
}

function Ornament({ dim = false }) {
  const c = dim ? "rgba(212,168,67,0.18)" : "rgba(212,168,67,0.35)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "18px 0" }}>
      <div style={{ flex: 1, height: "0.5px", background: c }} />
      <div style={{ width: 5, height: 5, transform: "rotate(45deg)", border: `0.5px solid ${c}` }} />
      <div style={{ flex: 1, height: "0.5px", background: c }} />
    </div>
  );
}

const S = {
  wrap: { fontFamily: "system-ui", minHeight: "100vh", background: BG, color: CREAM, WebkitFontSmoothing: "antialiased" },
  page: { position: "relative", zIndex: 1, padding: "36px 22px 110px", maxWidth: 420, margin: "0 auto" },
  stepLabel: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 10, letterSpacing: "0.35em", color: "rgba(212,168,67,0.6)", textTransform: "uppercase", marginBottom: 8 },
  h1: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 30, fontWeight: 700, color: CREAM, marginBottom: 6, lineHeight: 1.15 },
  sub: { fontFamily: "'Crimson Text',Georgia,serif", fontSize: 15, color: MUTED, lineHeight: 1.65, marginBottom: 28 },
  btnGold: { background: "transparent", border: `0.5px solid rgba(212,168,67,0.55)`, color: GOLD, fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "0.2em", fontSize: 12, padding: "13px 24px", cursor: "pointer", borderRadius: 2, transition: "background 0.2s", width: "100%", textTransform: "uppercase" },
  btnGhost: { background: "transparent", border: "0.5px solid rgba(245,237,216,0.15)", color: "rgba(245,237,216,0.55)", fontFamily: "'Crimson Text',Georgia,serif", fontSize: 13, padding: "10px 18px", cursor: "pointer", borderRadius: 2, transition: "background 0.2s" },
  input: { width: "100%", background: "rgba(245,237,216,0.04)", border: "0.5px solid rgba(245,237,216,0.12)", color: CREAM, fontFamily: "'Crimson Text',Georgia,serif", fontSize: 15, padding: "13px 14px", borderRadius: 2, outline: "none", resize: "none", lineHeight: 1.6 },
};


function MintSuccessModal({ tokenId, nftImage, onClose }) {
  const explorerUrl = `https://www.oklink.com/x-layer-testnet/token/0x7D7D338BAb8e19bad2c0959f15fe5d7ad6737708?tokenId=${tokenId}`

  const handleDownload = () => {
    if (!nftImage) return
    const a = document.createElement('a')
    a.href = nftImage
    a.download = `pantheon-xi-verdict-${tokenId}.svg`
    a.click()
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.92)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 20px",
      animation: "fadeUp 0.4s ease both",
    }}>
      {/* Close */}
      <button onClick={onClose} style={{
        position: "absolute", top: 20, right: 20,
        background: "transparent", border: "none",
        color: "rgba(245,237,216,0.4)", fontSize: 22,
        cursor: "pointer", lineHeight: 1,
      }}>✕</button>

      {/* Heading */}
      <div style={{
        fontFamily: "'Cormorant Garamond',Georgia,serif",
        fontSize: 11, letterSpacing: "0.35em",
        color: "rgba(212,168,67,0.6)", textTransform: "uppercase",
        marginBottom: 8,
      }}>Verdict Sealed</div>
      <div style={{
        fontFamily: "'Cormorant Garamond',Georgia,serif",
        fontSize: 26, fontWeight: 700,
        color: "#F5EDD8", marginBottom: 24, textAlign: "center",
      }}>Token #{tokenId} is yours</div>

      {/* NFT Image */}
      {nftImage && (
        <div style={{
          width: "100%", maxWidth: 320,
          borderRadius: 4, overflow: "hidden",
          border: "0.5px solid rgba(212,168,67,0.4)",
          marginBottom: 28,
          boxShadow: "0 0 60px rgba(212,168,67,0.08)",
          animation: "sealIn 0.6s ease both",
        }}>
          <img src={nftImage} alt="Your Pantheon XI NFT"
            style={{ width: "100%", display: "block" }} />
        </div>
      )}

      {/* Actions */}
      <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={handleDownload}
          style={{
            background: "rgba(212,168,67,0.12)",
            border: "0.5px solid rgba(212,168,67,0.55)",
            color: "#D4A843",
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            letterSpacing: "0.2em", fontSize: 12,
            padding: "13px 24px", cursor: "pointer",
            borderRadius: 2, textTransform: "uppercase",
            width: "100%",
          }}>
          Download NFT
        </button>
        <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
          style={{
            display: "block", textAlign: "center",
            background: "transparent",
            border: "0.5px solid rgba(245,237,216,0.15)",
            color: "rgba(245,237,216,0.55)",
            fontFamily: "'Crimson Text',Georgia,serif",
            fontSize: 13, padding: "12px 24px",
            borderRadius: 2, textDecoration: "none",
          }}>
          View on OKLink →
        </a>
        <button onClick={onClose} style={{
          background: "transparent", border: "none",
          color: "rgba(245,237,216,0.25)",
          fontFamily: "'Crimson Text',Georgia,serif",
          fontSize: 12, cursor: "pointer", padding: "8px",
        }}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default function Pantheon() {
  const [phase, setPhase] = useState("intro");
  const [selected, setSelected] = useState([]);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [challenge, setChallenge] = useState("");
  const [loading, setLoading] = useState(false);
  const [consensus, setConsensus] = useState(null);
  const [minted, setMinted] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState(null);
  const [nftImage, setNftImage] = useState(null);
  const [showMintModal, setShowMintModal] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [mintError, setMintError] = useState(null);
  const [unlockStatus, setUnlockStatus] = useState(null); // null | "checking" | "none" | "unrevealed" | "granted"
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [openCats, setOpenCats] = useState({ immortals: true, contenders: false, heirs: false });
  const bottomRef = useRef(null);

  const toggleCat = (id) => setOpenCats((p) => ({ ...p, [id]: !p[id] }));

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{opacity:0.25}50%{opacity:0.75}}
      @keyframes goldShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
      @keyframes msgIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes sealIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
      .ph-btn-gold:hover{background:rgba(212,168,67,0.1)!important}
      .ph-btn-ghost:hover{background:rgba(245,237,216,0.06)!important}
      .ph-legend-card{background:rgba(245,237,216,0.03);border:0.5px solid rgba(212,168,67,0.18);border-radius:3px;padding:16px 13px;cursor:pointer;transition:all 0.18s;user-select:none;position:relative}
      .ph-legend-card:hover{background:rgba(212,168,67,0.08);border-color:rgba(212,168,67,0.35)}
      .ph-legend-card.sel{background:rgba(212,168,67,0.1);border-color:rgba(212,168,67,0.7)}
      .ph-legend-card.locked{opacity:0.28;cursor:not-allowed;pointer-events:none}
      .ph-input:focus{border-color:rgba(212,168,67,0.35)!important}
      .ph-input::placeholder{color:rgba(245,237,216,0.3)}
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, consensus]);

  const toggle = (id) => {
    if (selected.includes(id)) setSelected((s) => s.filter((x) => x !== id));
    else if (selected.length < 5) setSelected((s) => [...s, id]);
  };

  const startDebate = async () => {
    setPhase("debate");
    setLoading(true);
    const initial = [];
    for (const id of selected) {
      const text = await callLegend(id, `Question: "${question}" — Who wins the 2026 World Cup and why?`);
      const msg = { legendId: id, content: text, type: "initial" };
      initial.push(msg);
      setMessages((prev) => [...prev, msg]);
    }
    const othersText = initial.map((m) => {
      const lg = LEGENDS.find((l) => l.id === m.legendId);
      return `${lg.name}: "${m.content}"`;
    }).join("\n");
    for (const id of selected) {
      const text = await callLegend(id, `The question was: "${question}". Others said:\n${othersText}\nReact — agree, challenge, or double down.`);
      setMessages((prev) => [...prev, { legendId: id, content: text, type: "reaction" }]);
    }
    setLoading(false);
  };

  const submitChallenge = async () => {
    if (!challenge.trim() || loading) return;
    setMessages((prev) => [...prev, { legendId: "user", content: challenge, type: "challenge" }]);
    const c = challenge;
    setChallenge("");
    setLoading(true);
    for (const id of selected) {
      const text = await callLegend(id, `Debate: "${question}". User challenges: "${c}". Respond directly.`);
      setMessages((prev) => [...prev, { legendId: id, content: text, type: "response" }]);
    }
    setLoading(false);
  };

  const buildConsensus = async () => {
    setLoading(true);
    const text = await callConsensus(question, messages);
    setConsensus(text);
    setPhase("consensus");
    setLoading(false);
  };

  const handleConnect = async () => {
    try {
      const w = await connectWallet();
      setWallet(w);
      setMintError(null);
    } catch (e) {
      setMintError(e.message);
    }
  };

  const handleMint = async () => {
    setLoading(true);
    setMintError(null);
    try {
      const legendNames = selected.map((id) => LEGENDS.find((l) => l.id === id).name);
      // Build initial metadata to get debateHash
      const { debateHashHex, imageDataURI: previewImage } = buildTokenURI({ question, legends: legendNames, consensus, messages, tokenId: null });
      setNftImage(previewImage);
      // Mint to get token ID
      const { tokenId } = await mintVerdict(wallet.signer,
        buildTokenURI({ question, legends: legendNames, consensus, messages, tokenId: null }).tokenURI,
        debateHashHex
      );
      // Rebuild with real token ID for final image
      const { imageDataURI: finalImage } = buildTokenURI({ question, legends: legendNames, consensus, messages, tokenId });
      setNftImage(finalImage);
      setMintedTokenId(tokenId);
      setMinted(true);
      setShowMintModal(true);
    } catch (e) {
      setMintError(e.message);
    }
    setLoading(false);
  };

  const handleUnlock = async () => {
    setUnlockStatus("checking");
    try {
      let w = wallet;
      if (!w) { w = await connectWallet(); setWallet(w); }
      const { hasTokens, tokens } = await scanWalletTokens(w.signer);
      if (!hasTokens) { setUnlockStatus("none"); return; }
      setOwnedTokens(tokens);
      const anyRevealed = tokens.some(t => t.revealed);
      setUnlockStatus(anyRevealed ? "granted" : "unrevealed");
    } catch (e) {
      setMintError(e.message);
      setUnlockStatus(null);
    }
  };

  // ── INTRO ──────────────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div onClick={() => setPhase("select")} style={{ position: "relative", width: "100%", height: "100vh", background: BG, cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <VideoBackground />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        <ParticleCanvas />
      </div>
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, animation: "fadeUp 1s 0.3s both" }}>
          <div style={{ flex: 1, height: "0.5px", background: "linear-gradient(to right, transparent, rgba(212,168,67,0.5))" }} />
          <div style={{ width: 5, height: 5, transform: "rotate(45deg)", border: "0.5px solid rgba(212,168,67,0.6)" }} />
          <div style={{ flex: 1, height: "0.5px", background: "linear-gradient(to left, transparent, rgba(212,168,67,0.5))" }} />
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 700, fontSize: "clamp(28px,10vw,96px)", letterSpacing: "0.15em", background: "linear-gradient(90deg,#8B6914,#D4A843,#F0C96A,#F5E09A,#D4A843,#8B6914)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "fadeUp 1s 0.5s both, goldShimmer 5s linear 1.5s infinite", lineHeight: 1, paddingRight: "0.15em" }}>
          PANTHEON
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(12px,3vw,18px)", letterSpacing: "0.7em", color: "rgba(212,168,67,0.4)", marginTop: 4, marginBottom: 52, animation: "fadeUp 1s 0.9s both", paddingRight: "0.7em" }}>XI</div>
        <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 11, letterSpacing: "0.28em", color: "rgba(245,237,216,0.3)", textTransform: "uppercase", animation: "pulse 2.5s 2s ease-in-out infinite" }}>
          Tap anywhere to enter
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 32, left: 0, right: 0, textAlign: "center", zIndex: 2, fontFamily: "'Crimson Text',Georgia,serif", fontSize: 11, letterSpacing: "0.2em", color: "rgba(245,237,216,0.18)", textTransform: "uppercase", animation: "fadeUp 1s 1.8s both" }}>
        Debate the legends &nbsp;·&nbsp; Mint the verdict
      </div>
    </div>
  );

  // ── SELECT ─────────────────────────────────────────────────────────────
  if (phase === "select") return (
    <div style={S.wrap}>
      <VideoBackground />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}><ParticleCanvas /></div>
      <div style={{ ...S.page, animation: "fadeUp 0.5s ease both" }}>
        <div style={S.stepLabel}>— Summon the Council</div>
        <h1 style={S.h1}>Choose Your Council</h1>
        <p style={S.sub}>Pick 2–5 legends. Three is the sweet spot. They will not agree.</p>

        {CATEGORIES.map((cat) => {
          const isOpen = openCats[cat.id];
          const catSelected = LEGENDS.filter((l) => l.cat === cat.id && selected.includes(l.id)).length;
          return (
            <div key={cat.id} style={{ marginBottom: 16 }}>
              <div onClick={() => toggleCat(cat.id)} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isOpen ? 12 : 0, cursor: "pointer", padding: "8px 0", userSelect: "none" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 11, letterSpacing: "0.25em", color: isOpen ? "rgba(212,168,67,0.9)" : "rgba(212,168,67,0.5)", textTransform: "uppercase", transition: "color 0.2s" }}>{cat.label}</div>
                {catSelected > 0 && (
                  <span style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 10, color: GOLD, background: GOLD_DIM, border: `0.5px solid ${GOLD_BORDER}`, borderRadius: 10, padding: "1px 7px" }}>{catSelected}</span>
                )}
                <div style={{ flex: 1, height: "0.5px", background: "rgba(212,168,67,0.15)" }} />
                <span style={{ fontSize: 14, color: "rgba(212,168,67,0.4)", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>⌄</span>
              </div>
              {isOpen && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, animation: "fadeUp 0.25s ease both" }}>
                  {LEGENDS.filter((l) => l.cat === cat.id).map((lg) => {
                    const isSel = selected.includes(lg.id);
                    const idx = selected.indexOf(lg.id);
                    const isLocked = !isSel && selected.length >= 5;
                    return (
                      <div key={lg.id} className={`ph-legend-card${isSel ? " sel" : ""}${isLocked ? " locked" : ""}`} onClick={() => toggle(lg.id)}>
                        <div style={{ position: "absolute", top: 6, left: 6, width: 8, height: 8, borderTop: `1px solid rgba(212,168,67,${isSel ? 0.7 : 0.25})`, borderLeft: `1px solid rgba(212,168,67,${isSel ? 0.7 : 0.25})` }} />
                        <div style={{ position: "absolute", bottom: 6, right: 6, width: 8, height: 8, borderBottom: `1px solid rgba(212,168,67,${isSel ? 0.7 : 0.25})`, borderRight: `1px solid rgba(212,168,67,${isSel ? 0.7 : 0.25})` }} />
                        <div style={{ fontSize: 22, marginBottom: 8 }}>{lg.flag}</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 14, fontWeight: 700, color: isSel ? GOLD : CREAM, lineHeight: 1.2, marginBottom: 5 }}>{lg.name}</div>
                        <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 11, color: MUTED, marginBottom: 2 }}>{lg.trophy}</div>
                        <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 10, color: "rgba(245,237,216,0.25)" }}>{lg.era}</div>
                        {isSel && <div style={{ position: "absolute", top: 8, right: 10, fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 13, fontWeight: 700, color: GOLD }}>{ROMAN[idx]}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <Ornament dim />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 26, marginBottom: 22 }}>
          {selected.map((id) => {
            const lg = LEGENDS.find((l) => l.id === id);
            return <span key={id} style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 12, color: GOLD, background: GOLD_DIM, border: `0.5px solid ${GOLD_BORDER}`, borderRadius: 2, padding: "3px 10px" }}>{lg.flag} {lg.name}</span>;
          })}
          {selected.length < 5 && <span style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 12, color: "rgba(245,237,216,0.3)", padding: "3px 0" }}>{selected.length < 2 ? `pick at least ${2 - selected.length} more` : `${5 - selected.length} more optional`}</span>}
        </div>
        <button className="ph-btn-gold" style={S.btnGold} disabled={selected.length < 2} onClick={() => setPhase("question")}>
          Convene the Council →
        </button>
      </div>
    </div>
  );

  // ── QUESTION ───────────────────────────────────────────────────────────
  if (phase === "question") return (
    <div style={S.wrap}>
      <VideoBackground />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}><ParticleCanvas /></div>
      <div style={{ ...S.page, animation: "fadeUp 0.5s ease both" }}>
        <button className="ph-btn-ghost" style={{ ...S.btnGhost, marginBottom: 32, fontSize: 11 }} onClick={() => setPhase("select")}>← Back</button>
        <div style={S.stepLabel}>— Pose the Question</div>
        <h1 style={S.h1}>What Will You Ask?</h1>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {selected.map((id) => {
            const lg = LEGENDS.find((l) => l.id === id);
            return <span key={id} style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 12, color: GOLD, background: GOLD_DIM, border: `0.5px solid ${GOLD_BORDER}`, borderRadius: 2, padding: "3px 10px" }}>{lg.flag} {lg.name}</span>;
          })}
        </div>
        <Ornament dim />
        <textarea className="ph-input" style={{ ...S.input, marginBottom: 14 }} rows={4} placeholder="Who wins the 2026 World Cup and why?" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 28 }}>
          {["Who wins 2026?", "Which nation has the best squad?", "Will Mbappé finally deliver?"].map((q) => (
            <button key={q} className="ph-btn-ghost" style={{ ...S.btnGhost, fontSize: 11, padding: "6px 11px" }} onClick={() => setQuestion(q)}>{q}</button>
          ))}
        </div>
        <button className="ph-btn-gold" style={S.btnGold} disabled={!question.trim()} onClick={startDebate}>
          Begin the Debate →
        </button>
      </div>
    </div>
  );

  // ── DEBATE ─────────────────────────────────────────────────────────────
  if (phase === "debate") return (
    <div style={S.wrap}>
      <VideoBackground />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}><ParticleCanvas /></div>
      <div style={{ ...S.page, paddingBottom: 140, animation: "fadeUp 0.5s ease both" }}>
        <div style={S.stepLabel}>— The Tribunal</div>
        <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 17, fontStyle: "italic", color: "rgba(245,237,216,0.6)", borderLeft: "2px solid rgba(212,168,67,0.4)", paddingLeft: 14, marginBottom: 28, lineHeight: 1.5 }}>
          "{question}"
        </div>
        {messages.map((msg, i) => {
          const isUser = msg.legendId === "user";
          const lg = LEGENDS.find((l) => l.id === msg.legendId);
          return (
            <div key={i} style={{ marginBottom: 22, animation: "msgIn 0.4s ease both", animationDelay: `${i * 0.04}s` }}>
              {isUser ? (
                <div style={{ background: "rgba(245,237,216,0.05)", border: "0.5px solid rgba(245,237,216,0.1)", borderRadius: 2, padding: "14px 16px" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 10, letterSpacing: "0.25em", color: "rgba(245,237,216,0.4)", textTransform: "uppercase", marginBottom: 8 }}>You challenge</div>
                  <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 15, lineHeight: 1.7, color: "rgba(245,237,216,0.75)", fontStyle: "italic" }}>{msg.content}</div>
                </div>
              ) : (
                <div style={{ borderLeft: `2px solid ${msg.type === "reaction" || msg.type === "response" ? "rgba(139,26,26,0.7)" : "rgba(212,168,67,0.5)"}`, paddingLeft: 14 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: msg.type === "reaction" || msg.type === "response" ? "rgba(212,100,100,0.8)" : "rgba(212,168,67,0.8)", marginBottom: 9, display: "flex", alignItems: "center", gap: 8 }}>
                    {lg?.flag} {lg?.name} · {lg?.nation}
                    {(msg.type === "reaction" || msg.type === "response") && <span style={{ color: "rgba(245,237,216,0.25)", fontSize: 9 }}>reacts</span>}
                  </div>
                  <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 16, lineHeight: 1.75, color: CREAM, fontStyle: msg.type === "reaction" ? "italic" : "normal" }}>{msg.content}</div>
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0", fontFamily: "'Crimson Text',Georgia,serif", fontSize: 13, color: "rgba(245,237,216,0.35)", fontStyle: "italic" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid rgba(212,168,67,0.25)", borderTopColor: GOLD, animation: "spin 0.85s linear infinite" }} />
            The legends deliberate…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {!loading && messages.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10, background: "rgba(8,8,12,0.97)", borderTop: "0.5px solid rgba(212,168,67,0.2)", padding: "16px 20px" }}>
          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            <textarea className="ph-input" style={{ ...S.input, marginBottom: 10, fontSize: 14 }} rows={2} placeholder="Challenge them…" value={challenge} onChange={(e) => setChallenge(e.target.value)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ph-btn-ghost" style={{ ...S.btnGhost, flex: 1, fontSize: 12 }} onClick={submitChallenge} disabled={!challenge.trim()}>Challenge →</button>
              <button className="ph-btn-gold" style={{ ...S.btnGold, flex: 1, fontSize: 11, padding: "10px 16px" }} onClick={buildConsensus}>Reach Verdict</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── MINT SUCCESS MODAL ────────────────────────────────────────────────
  if (showMintModal) return (
    <MintSuccessModal
      tokenId={mintedTokenId}
      nftImage={nftImage}
      onClose={() => setShowMintModal(false)}
    />
  );

  // ── CONSENSUS ──────────────────────────────────────────────────────────
  if (phase === "consensus") return (
    <div style={S.wrap}>
      <VideoBackground />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}><ParticleCanvas /></div>
      <div style={{ ...S.page, animation: "fadeUp 0.5s ease both" }}>
        <div style={S.stepLabel}>— The Verdict</div>
        <h1 style={{ ...S.h1, marginBottom: 18 }}>The Council Has Spoken</h1>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
          {selected.map((id) => {
            const lg = LEGENDS.find((l) => l.id === id);
            return <span key={id} style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 12, color: GOLD, background: GOLD_DIM, border: `0.5px solid ${GOLD_BORDER}`, borderRadius: 2, padding: "3px 10px" }}>{lg.flag} {lg.name}</span>;
          })}
        </div>

        <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 13, fontStyle: "italic", color: "rgba(245,237,216,0.4)", marginBottom: 20 }}>
          "{question}"
        </div>

        <div style={{ animation: "sealIn 0.6s ease both", position: "relative", border: "0.5px solid rgba(212,168,67,0.5)", borderRadius: 2, padding: "28px 22px", background: "rgba(212,168,67,0.06)", marginBottom: 28 }}>
          <div style={{ position: "absolute", top: 7, left: 7, width: 12, height: 12, borderTop: "1px solid rgba(212,168,67,0.55)", borderLeft: "1px solid rgba(212,168,67,0.55)" }} />
          <div style={{ position: "absolute", top: 7, right: 7, width: 12, height: 12, borderTop: "1px solid rgba(212,168,67,0.55)", borderRight: "1px solid rgba(212,168,67,0.55)" }} />
          <div style={{ position: "absolute", bottom: 7, left: 7, width: 12, height: 12, borderBottom: "1px solid rgba(212,168,67,0.55)", borderLeft: "1px solid rgba(212,168,67,0.55)" }} />
          <div style={{ position: "absolute", bottom: 7, right: 7, width: 12, height: 12, borderBottom: "1px solid rgba(212,168,67,0.55)", borderRight: "1px solid rgba(212,168,67,0.55)" }} />
          <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 16, lineHeight: 1.85, color: CREAM }}>{consensus}</div>
        </div>

        {!minted ? (
          <>
            <p style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 20 }}>
              Mint this verdict as an NFT on X Layer. Hold it to unlock the council's reaction after the 2026 final whistle.
            </p>
            {!wallet ? (
              <button className="ph-btn-gold" style={{ ...S.btnGold, marginBottom: 10 }} onClick={handleConnect}>
                Connect OKX Wallet
              </button>
            ) : (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 11, color: "rgba(212,168,67,0.6)", marginBottom: 8, textAlign: "center", letterSpacing: "0.1em" }}>
                  {shortAddress(wallet.address)}
                </div>
                <button className="ph-btn-gold" style={S.btnGold} disabled={loading} onClick={handleMint}>
                  {loading ? "Minting…" : "Mint the Verdict on X Layer"}
                </button>
              </div>
            )}
            {mintError && (
              <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 12, color: "#8B2020", marginBottom: 10, textAlign: "center" }}>
                {mintError}
              </div>
            )}
            <button className="ph-btn-ghost" style={{ ...S.btnGhost, width: "100%", fontSize: 12, textAlign: "center", marginTop: 8 }} onClick={() => { setPhase("debate"); setConsensus(null); }}>
              Continue arguing
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", animation: "sealIn 0.5s ease both" }}>
            <Ornament />
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: "0.5px solid rgba(212,168,67,0.6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, background: "rgba(212,168,67,0.06)" }}>⚽</div>
            <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 13, color: GOLD, letterSpacing: "0.25em", marginBottom: 16, textTransform: "uppercase" }}>
              Verdict Minted
            </div>
            {nftImage && (
              <div style={{ marginBottom: 20, borderRadius: 4, overflow: "hidden", border: "0.5px solid rgba(212,168,67,0.3)", maxWidth: 280, margin: "0 auto 20px" }}>
                <img src={nftImage} alt="Your Pantheon XI NFT" style={{ width: "100%", display: "block" }} />
              </div>
            )}
            <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 22 }}>
              Your NFT is sealed on X Layer.{" "}
              {mintedTokenId && (
                <a
                  href={`https://www.oklink.com/x-layer-testnet/token/${CONTRACT_ADDRESS}?tokenId=${mintedTokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: GOLD, textDecoration: "underline", textUnderlineOffset: "3px" }}
                >
                  View your NFT
                </a>
              )}{" "}
              Return after the final whistle — the council will answer for their prediction.
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 10, letterSpacing: "0.25em", color: "rgba(212,168,67,0.6)", border: "0.5px solid rgba(212,168,67,0.25)", padding: "5px 14px", borderRadius: 2 }}>
              PANTHEON XI · 2026
            </span>
            <div style={{ marginTop: 28 }}>
              <button className="ph-btn-ghost" style={{ ...S.btnGhost, width: "100%", fontSize: 12, textAlign: "center" }} onClick={() => setPhase("unlock")}>
                Return after the final whistle →
              </button>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );

  // ── UNLOCK ────────────────────────────────────────────────────────────
  if (phase === "unlock") return (
    <div style={S.wrap}>
      <VideoBackground />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}><ParticleCanvas /></div>
      <div style={{ ...S.page, animation: "fadeUp 0.5s ease both" }}>
        <button className="ph-btn-ghost" style={{ ...S.btnGhost, marginBottom: 32, fontSize: 11 }} onClick={() => { setPhase("consensus"); setUnlockStatus(null); setOwnedTokens([]); }}>← Back</button>
        <div style={S.stepLabel}>— Post-Tournament</div>
        <h1 style={{ ...S.h1, marginBottom: 8 }}>The Final Whistle</h1>
        <p style={{ ...S.sub, marginBottom: 28 }}>Connect the wallet that minted your verdict. The council will answer for their prediction.</p>
        <Ornament dim />

        {unlockStatus === "granted" ? (
          <div style={{ animation: "sealIn 0.5s ease both" }}>
            {ownedTokens.filter(t => t.revealed).map(t => (
              <div key={t.tokenId} style={{ position: "relative", border: "0.5px solid rgba(212,168,67,0.5)", borderRadius: 2, padding: "28px 22px", background: "rgba(212,168,67,0.06)", marginBottom: 16 }}>
                <div style={{ position: "absolute", top: 7, left: 7, width: 12, height: 12, borderTop: "1px solid rgba(212,168,67,0.55)", borderLeft: "1px solid rgba(212,168,67,0.55)" }} />
                <div style={{ position: "absolute", top: 7, right: 7, width: 12, height: 12, borderTop: "1px solid rgba(212,168,67,0.55)", borderRight: "1px solid rgba(212,168,67,0.55)" }} />
                <div style={{ position: "absolute", bottom: 7, left: 7, width: 12, height: 12, borderBottom: "1px solid rgba(212,168,67,0.55)", borderLeft: "1px solid rgba(212,168,67,0.55)" }} />
                <div style={{ position: "absolute", bottom: 7, right: 7, width: 12, height: 12, borderBottom: "1px solid rgba(212,168,67,0.55)", borderRight: "1px solid rgba(212,168,67,0.55)" }} />
                <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 10, letterSpacing: "0.25em", color: GOLD, textTransform: "uppercase", marginBottom: 12 }}>Token #{t.tokenId} · Unlocked</div>
                <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 16, lineHeight: 1.85, color: CREAM, marginBottom: 16 }}>
                  The tournament has spoken. The legends now answer for their predictions — the full post-tournament verdict has been unlocked for this token.
                </div>
                <a href={`https://www.oklink.com/x-layer-testnet/token/${CONTRACT_ADDRESS}?tokenId=${t.tokenId}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 13, color: GOLD, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                  View NFT on OKLink
                </a>
              </div>
            ))}
          </div>
        ) : unlockStatus === "unrevealed" ? (
          <div style={{ animation: "sealIn 0.5s ease both", textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
            <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 15, color: MUTED, lineHeight: 1.75 }}>
              You hold {ownedTokens.length} Pantheon {ownedTokens.length === 1 ? "verdict" : "verdicts"}. The tournament is not yet over. Return after the final whistle on July 19, 2026.
            </div>
          </div>
        ) : unlockStatus === "none" ? (
          <div style={{ animation: "sealIn 0.5s ease both", textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>✕</div>
            <div style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 15, color: "#8B2020", lineHeight: 1.75 }}>
              This wallet holds no Pantheon verdicts. Connect the wallet you used to mint.
            </div>
          </div>
        ) : (
          <button className="ph-btn-gold" style={S.btnGold} disabled={unlockStatus === "checking"} onClick={handleUnlock}>
            {unlockStatus === "checking" ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", border: "1.5px solid rgba(212,168,67,0.25)", borderTopColor: GOLD, animation: "spin 0.85s linear infinite", display: "inline-block" }} />
                Scanning wallet…
              </span>
            ) : "Connect Wallet to Unlock"}
          </button>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );

  return null;
}