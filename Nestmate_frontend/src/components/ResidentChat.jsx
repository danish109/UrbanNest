import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";

// ─── Constants ────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";
const SOCKET_URL = "http://localhost:5000";
const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const socket = io(SOCKET_URL, { withCredentials: true });
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

// ─── Helpers ──────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const now = new Date();
  const diffMins = Math.floor((now - date) / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const fmtFull = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const groupMsgsByDate = (msgs) => {
  const groups = {};
  msgs.forEach((m) => {
    const d = new Date(m.createdAt).toDateString();
    if (!groups[d]) groups[d] = [];
    groups[d].push(m);
  });
  return groups;
};

const dateLabel = (d) => {
  const today = new Date().toDateString();
  const yest = new Date(Date.now() - 86400000).toDateString();
  if (d === today) return "Today";
  if (d === yest) return "Yesterday";
  return new Date(d).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
};

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const typeConfig = {
  general:       { color: "#3b82f6", bg: "#eff6ff", label: "General",       icon: "💬" },
  announcements: { color: "#f59e0b", bg: "#fffbeb", label: "Announcement",  icon: "📢" },
  complaints:    { color: "#ef4444", bg: "#fef2f2", label: "Complaint",     icon: "🚨" },
  custom:        { color: "#10b981", bg: "#f0fdf4", label: "Custom",        icon: "⚙️" },
};

const avatarColors = [
  ["#dbeafe","#1d4ed8"], ["#dcfce7","#15803d"], ["#fce7f3","#be185d"],
  ["#fef3c7","#b45309"], ["#ede9fe","#6d28d9"], ["#ffedd5","#c2410c"],
];
const getAvatarColor = (name = "") => {
  if (!name || typeof name !== "string") {
    return avatarColors[0]; // fallback
  }

  const index = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[index] || avatarColors[0];
};

// ─── CSS Injection ─────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .rc-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .rc-root { font-family: 'Plus Jakarta Sans', sans-serif; }

  @keyframes rc-fadeUp   { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
  @keyframes rc-slideIn  { from { opacity:0; transform:translateX(-6px) } to { opacity:1; transform:none } }
  @keyframes rc-pop      { 0%{transform:scale(0.92)} 60%{transform:scale(1.03)} 100%{transform:scale(1)} }
  @keyframes rc-bounce   { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-4px)} }
  @keyframes rc-pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes rc-shimmer  {
    0%   { background-position: -400px 0 }
    100% { background-position: 400px 0 }
  }

  .rc-root ::-webkit-scrollbar        { width:4px; height:4px }
  .rc-root ::-webkit-scrollbar-track  { background:transparent }
  .rc-root ::-webkit-scrollbar-thumb  { background:#d1d5db; border-radius:99px }
  .rc-root ::-webkit-scrollbar-thumb:hover { background:#9ca3af }

  .rc-group-item { animation: rc-slideIn 0.18s ease both }
  .rc-group-item:hover .rc-group-actions { opacity:1 }
  .rc-group-actions { opacity:0; transition:opacity 0.15s }

  .rc-msg-wrap { animation: rc-fadeUp 0.2s ease both }
  .rc-msg-wrap:hover .rc-msg-actions { opacity:1; transform:translateY(0) }
  .rc-msg-actions {
    opacity:0;
    transform:translateY(4px);
    transition: opacity 0.15s, transform 0.15s;
  }

  .rc-send-btn:not(:disabled):hover { transform:scale(1.06); box-shadow:0 4px 16px rgba(59,130,246,0.35) }
  .rc-send-btn { transition: transform 0.15s, box-shadow 0.15s }

  .rc-input:focus { border-color:#93c5fd; box-shadow:0 0 0 3px rgba(59,130,246,0.1) }
  .rc-input { transition: border-color 0.15s, box-shadow 0.15s }

  .rc-tab-btn.active { background:#eff6ff; color:#1d4ed8; font-weight:600 }

  .rc-reaction:hover { transform:scale(1.15) }
  .rc-reaction { transition:transform 0.1s }

  .rc-emoji-btn:hover { background:#f3f4f6; transform:scale(1.2) }
  .rc-emoji-btn { transition: background 0.1s, transform 0.1s }

  .rc-member-row:hover { background:#f9fafb }
  .rc-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 800px 100%;
    animation: rc-shimmer 1.4s infinite;
    border-radius:6px;
  }
`;

// ─── Avatar ────────────────────────────────────────────────────
function Av({ name, photo, size = 36, online }) {
  const [bg, fg] = getAvatarColor(name || "User");
  return (
    <div style={{ position:"relative", flexShrink:0 }}>
      {photo ? (
        <img src={photo} alt={name}
          style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", display:"block" }} />
      ) : (
        <div style={{
          width:size, height:size, borderRadius:"50%",
          background:bg, color:fg,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: size * 0.36, fontWeight:700,
          fontFamily:"'Fraunces', serif", letterSpacing:-0.5,
          border:"1.5px solid rgba(0,0,0,0.06)",
        }}>{initials(name)}</div>
      )}
      {online && (
        <span style={{
          position:"absolute", bottom:1, right:1,
          width:size*0.28, height:size*0.28,
          background:"#22c55e", borderRadius:"50%",
          border:`${size*0.07}px solid white`,
        }}/>
      )}
    </div>
  );
}

// ─── Typing dots ───────────────────────────────────────────────
function TypingIndicator({ typers }) {
  if (!typers.length) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", color:"#6b7280", fontSize:12 }}>
      <div style={{ display:"flex", gap:3, alignItems:"center" }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width:5, height:5, borderRadius:"50%", background:"#9ca3af",
            display:"inline-block",
            animation:`rc-bounce 1.2s ${i*0.2}s infinite`,
          }}/>
        ))}
      </div>
      <span style={{ fontStyle:"italic" }}>
        {typers.length === 1 ? `${typers[0]} is typing` : `${typers.length} people are typing`}
      </span>
    </div>
  );
}

// ─── Reaction bar ──────────────────────────────────────────────
function ReactionBar({ reactions, onReact, messageId, currentUserId }) {
  const grouped = {};
  (reactions||[]).forEach(({ emoji, userId }) => {
    if (!grouped[emoji]) grouped[emoji] = [];
    grouped[emoji].push(userId?.toString());
  });
  if (!Object.keys(grouped).length) return null;
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>
      {Object.entries(grouped).map(([emoji, users]) => {
        const mine = users.includes(currentUserId?.toString());
        return (
          <button key={emoji} className="rc-reaction"
            onClick={() => onReact(messageId, emoji)}
            style={{
              display:"flex", alignItems:"center", gap:3,
              padding:"2px 7px", borderRadius:99,
              background: mine ? "#dbeafe" : "#f3f4f6",
              border: mine ? "1px solid #93c5fd" : "1px solid #e5e7eb",
              cursor:"pointer", fontSize:12,
              color: mine ? "#1d4ed8" : "#374151",
            }}>
            {emoji}
            <span style={{ fontSize:10, fontWeight:600 }}>{users.length}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Message bubble ────────────────────────────────────────────
function MessageBubble({ msg, isOwn, onReact, onReply, onEdit, onDelete, currentUserId }) {
  const [showActions, setShowActions] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="rc-msg-wrap"
      style={{
        display:"flex", flexDirection: isOwn ? "row-reverse" : "row",
        alignItems:"flex-end", gap:8, marginBottom:2,
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmoji(false); }}
    >
      {!isOwn && <Av name={msg.senderName} photo={msg.senderPhoto} size={30} />}

      <div style={{ maxWidth:"66%", display:"flex", flexDirection:"column", alignItems: isOwn ? "flex-end" : "flex-start" }}>
        {!isOwn && (
          <span style={{ fontSize:11, fontWeight:600, color:"#6b7280", marginBottom:3, paddingLeft:2 }}>
            {msg.senderName}
          </span>
        )}

        {/* Reply preview */}
        {msg.replyTo && (
          <div style={{
            background:"#f9fafb", borderLeft:"3px solid #93c5fd",
            padding:"4px 10px", borderRadius:"6px 6px 0 0",
            fontSize:11, color:"#6b7280", maxWidth:"100%",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>
            <strong style={{ color:"#3b82f6" }}>{msg.replyTo.senderName}: </strong>
            {msg.replyTo.message}
          </div>
        )}

        {/* Bubble */}
        <div style={{
          background: isOwn
            ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            : "#ffffff",
          color: isOwn ? "#fff" : "#111827",
          padding:"10px 14px",
          borderRadius: isOwn
            ? msg.replyTo ? "16px 4px 16px 16px" : "16px 4px 16px 16px"
            : msg.replyTo ? "4px 16px 16px 16px" : "4px 16px 16px 16px",
          fontSize:13.5, lineHeight:1.55,
          wordBreak:"break-word",
          boxShadow: isOwn
            ? "0 2px 12px rgba(59,130,246,0.25)"
            : "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
          position:"relative",
        }}>
          {msg.messageType === "image" && msg.fileUrl ? (
            <img src={msg.fileUrl} alt="img" style={{ maxWidth:200, borderRadius:8, display:"block" }} />
          ) : msg.message}
          {msg.isEdited && (
            <span style={{ fontSize:9, opacity:0.6, marginLeft:5 }}>(edited)</span>
          )}
        </div>

        <ReactionBar reactions={msg.reactions} onReact={onReact}
          messageId={msg._id} currentUserId={currentUserId} />

        <span style={{ fontSize:10, color:"#9ca3af", marginTop:3, paddingLeft:2 }}>
          {fmtFull(msg.createdAt)}
        </span>
      </div>

      {/* Action toolbar */}
      <div className="rc-msg-actions"
        style={{
          display:"flex", flexDirection:"column", gap:2,
          alignSelf:"center", visibility: showActions ? "visible" : "hidden",
        }}
      >
        <div style={{ position:"relative" }} ref={emojiRef}>
          <MsgBtn icon="😊" title="React" onClick={() => setShowEmoji(p => !p)} />
          {showEmoji && (
            <div style={{
              position:"absolute",
              [isOwn ? "right" : "left"]: "calc(100% + 4px)",
              bottom:0,
              background:"#fff",
              border:"1px solid #e5e7eb",
              borderRadius:12,
              padding:6,
              display:"flex", gap:2,
              boxShadow:"0 8px 24px rgba(0,0,0,0.12)",
              zIndex:20,
            }}>
              {EMOJIS.map(e => (
                <button key={e} className="rc-emoji-btn"
                  onClick={() => { onReact(msg._id, e); setShowEmoji(false); }}
                  style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, padding:"2px 3px", borderRadius:6 }}>
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
        <MsgBtn icon="↩" title="Reply" onClick={() => onReply(msg)} />
        {isOwn && <MsgBtn icon="✏" title="Edit" onClick={() => onEdit(msg)} />}
        {isOwn && <MsgBtn icon="🗑" title="Delete" onClick={() => onDelete(msg._id)} danger />}
      </div>
    </div>
  );
}

function MsgBtn({ icon, title, onClick, danger }) {
  return (
    <button title={title} onClick={onClick}
      style={{
        width:26, height:26, borderRadius:7,
        background:"#fff",
        border:"1px solid #e5e7eb",
        cursor:"pointer", fontSize:11,
        display:"flex", alignItems:"center", justifyContent:"center",
        color: danger ? "#ef4444" : "#6b7280",
        boxShadow:"0 1px 3px rgba(0,0,0,0.07)",
        transition:"all 0.12s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = danger ? "#fca5a5" : "#93c5fd";
        e.currentTarget.style.background = danger ? "#fef2f2" : "#eff6ff";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.background = "#fff";
      }}
    >{icon}</button>
  );
}

// ─── Selected members pills ────────────────────────────────────
function MemberPill({ name, onRemove }) {
  const safeName = name || "User"; // ✅ fallback

  const [bg, fg] = getAvatarColor(safeName);

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "3px 8px 3px 6px",
      borderRadius: 99,
      background: bg,
      color: fg,
      fontSize: 12,
      fontWeight: 600,
      border: `1px solid ${fg}30`,
    }}>
      <span style={{ fontSize: 11 }}>
        {initials(safeName)}
      </span>

      {safeName.split(" ")[0]} {/* ✅ safe now */}

      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: fg,
          fontSize: 12,
          padding: 0,
          marginLeft: 1,
        }}
      >
        ×
      </button>
    </span>
  );
}

// ─── Create Group Modal ────────────────────────────────────────
function CreateGroupModal({ onClose, onCreated, allResidents, currentUserId }) {
  const [form, setForm] = useState({ groupName:"", description:"", groupType:"general", members:[] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(1); // 1=details, 2=members

  const filtered = allResidents.filter(r =>
    r._id !== currentUserId &&
    (r.fullName?.toLowerCase().includes(search.toLowerCase()) || r.flatNo?.includes(search))
  );

  const toggle = (id) => setForm(f => ({
    ...f,
    members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id],
  }));

  const selectedResidents = allResidents.filter(r => form.members.includes(r._id));

  const submit = async () => {
    if (!form.groupName.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/chat/group/create", {
        ...form,
        members: [...new Set([...form.members, currentUserId])],
      });
      if (data.success) { onCreated(data.data); onClose(); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const tc = typeConfig[form.groupType];

  return createPortal(
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"rgba(17,24,39,0.45)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"#fff", borderRadius:20,
        width:"100%", maxWidth:500, maxHeight:"90vh",
        display:"flex", flexDirection:"column",
        boxShadow:"0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)",
        overflow:"hidden",
        animation:"rc-pop 0.25s ease",
      }}>
        {/* Modal header */}
        <div style={{
          padding:"20px 24px 0",
          borderBottom:"1px solid #f3f4f6",
          paddingBottom:16,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:600, color:"#111827", letterSpacing:-0.3 }}>
                New Group Chat
              </h3>
              <p style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>
                Step {step} of 2 — {step===1 ? "Group details" : "Add members"}
              </p>
            </div>
            <button onClick={onClose}
              style={{ background:"#f3f4f6", border:"none", borderRadius:8, width:30, height:30, cursor:"pointer", fontSize:14, color:"#6b7280", display:"flex", alignItems:"center", justifyContent:"center" }}>
              ✕
            </button>
          </div>
          {/* Step indicator */}
          <div style={{ display:"flex", gap:4, marginTop:14 }}>
            {[1,2].map(s => (
              <div key={s} style={{
                flex:1, height:3, borderRadius:99,
                background: s <= step ? "#3b82f6" : "#e5e7eb",
                transition:"background 0.3s",
              }}/>
            ))}
          </div>
        </div>

        {/* Step 1 — Details */}
        {step === 1 && (
          <div style={{ flex:1, overflow:"auto", padding:"20px 24px" }}>
            <FLabel>Group Name *</FLabel>
            <FInput placeholder="e.g. Block A Residents" value={form.groupName}
              onChange={e => setForm({...form, groupName:e.target.value})} />

            <FLabel>Description</FLabel>
            <FInput placeholder="What is this group for?" value={form.description}
              onChange={e => setForm({...form, description:e.target.value})} />

            <FLabel>Group Type</FLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <button key={key}
                  onClick={() => setForm({...form, groupType:key})}
                  style={{
                    padding:"10px 12px",
                    border: form.groupType===key ? `2px solid ${cfg.color}` : "2px solid #e5e7eb",
                    borderRadius:10,
                    background: form.groupType===key ? cfg.bg : "#fafafa",
                    cursor:"pointer",
                    display:"flex", alignItems:"center", gap:8,
                    transition:"all 0.15s",
                  }}>
                  <span style={{ fontSize:18 }}>{cfg.icon}</span>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:12, fontWeight:600, color: form.groupType===key ? cfg.color : "#374151" }}>
                      {cfg.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Members */}
        {step === 2 && (
          <div style={{ flex:1, overflow:"auto", padding:"20px 24px" }}>
            {/* Selected pills */}
            {selectedResidents.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                {selectedResidents.map(r => (
                  <MemberPill name={r.fullName || r.name || "User"}
                    onRemove={() => toggle(r._id)} />
                ))}
              </div>
            )}

            <div style={{ position:"relative", marginBottom:12 }}>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"#9ca3af" }}>🔍</span>
              <input placeholder="Search residents by name or flat…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="rc-input"
                style={{
                  width:"100%", padding:"9px 12px 9px 32px",
                  border:"1.5px solid #e5e7eb", borderRadius:10,
                  fontSize:13, color:"#111827", outline:"none",
                  background:"#fafafa",
                }}/>
            </div>

            <div style={{ border:"1px solid #f3f4f6", borderRadius:12, overflow:"hidden", maxHeight:260, overflowY:"auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding:"24px", textAlign:"center", color:"#9ca3af", fontSize:13 }}>
                  No residents found
                </div>
              ) : filtered.map(r => {
                const sel = form.members.includes(r._id);
                return (
                  <div key={r._id} className="rc-member-row"
                    onClick={() => toggle(r._id)}
                    style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"10px 12px", cursor:"pointer",
                      background: sel ? "#eff6ff" : "transparent",
                      borderBottom:"1px solid #f9fafb",
                      transition:"background 0.12s",
                    }}>
                    <Av name={r.fullName} photo={r.profilePhoto?.url} size={34} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{r.fullName}</div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>Flat {r.flatNo} • {r.block}</div>
                    </div>
                    <div style={{
                      width:18, height:18, borderRadius:5,
                      border: sel ? "none" : "1.5px solid #d1d5db",
                      background: sel ? "#3b82f6" : "transparent",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:10, color:"#fff", flexShrink:0,
                      transition:"all 0.15s",
                    }}>{sel ? "✓" : ""}</div>
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize:11, color:"#9ca3af", marginTop:8 }}>
              {form.members.length} member{form.members.length !== 1 ? "s" : ""} selected (you'll be added automatically)
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding:"16px 24px",
          borderTop:"1px solid #f3f4f6",
          display:"flex", gap:8, justifyContent:"flex-end",
        }}>
          {step === 2 && (
            <button onClick={() => setStep(1)}
              style={{ padding:"9px 18px", border:"1.5px solid #e5e7eb", borderRadius:10, background:"#fff", color:"#374151", cursor:"pointer", fontSize:13, fontWeight:500 }}>
              ← Back
            </button>
          )}
          <button onClick={onClose}
            style={{ padding:"9px 18px", border:"1.5px solid #e5e7eb", borderRadius:10, background:"#fff", color:"#374151", cursor:"pointer", fontSize:13, fontWeight:500 }}>
            Cancel
          </button>
          {step === 1 ? (
            <button
              onClick={() => form.groupName.trim() && setStep(2)}
              disabled={!form.groupName.trim()}
              style={{
                padding:"9px 22px", border:"none", borderRadius:10,
                background: form.groupName.trim() ? "#3b82f6" : "#e5e7eb",
                color: form.groupName.trim() ? "#fff" : "#9ca3af",
                cursor: form.groupName.trim() ? "pointer" : "default",
                fontSize:13, fontWeight:600,
              }}>
              Next →
            </button>
          ) : (
            <button onClick={submit} disabled={loading}
              style={{
                padding:"9px 22px", border:"none", borderRadius:10,
                background: loading ? "#93c5fd" : "#3b82f6",
                color:"#fff", cursor: loading ? "default" : "pointer",
                fontSize:13, fontWeight:600, minWidth:120,
              }}>
              {loading ? "Creating…" : "Create Group"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function FLabel({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, color:"#6b7280", letterSpacing:0.6, textTransform:"uppercase", marginBottom:6 }}>{children}</div>;
}
function FInput({ ...props }) {
  return (
    <input {...props} className="rc-input"
      style={{
        width:"100%", padding:"9px 12px",
        border:"1.5px solid #e5e7eb", borderRadius:10,
        fontSize:13, color:"#111827", outline:"none",
        background:"#fafafa", marginBottom:16,
        ...props.style,
      }}
      onFocus={e => e.currentTarget.style.borderColor = "#93c5fd"}
      onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"}
    />
  );
}

// ─── Group sidebar item ────────────────────────────────────────
function GroupItem({ group, isActive, unread, onClick }) {
  const tc = typeConfig[group.groupType] || typeConfig.general;
  return (
    <div className="rc-group-item"
      onClick={onClick}
      style={{
        display:"flex", alignItems:"center", gap:10,
        padding:"10px 14px", cursor:"pointer",
        background: isActive ? "#eff6ff" : "transparent",
        borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
        transition:"all 0.12s",
      }}
      onMouseEnter={e => !isActive && (e.currentTarget.style.background = "#f9fafb")}
      onMouseLeave={e => !isActive && (e.currentTarget.style.background = "transparent")}
    >
      <div style={{
        width:40, height:40, borderRadius:12,
        background: tc.bg, border:`1.5px solid ${tc.color}30`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:18, flexShrink:0,
      }}>{tc.icon}</div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:4 }}>
          <span style={{
            fontSize:13, fontWeight: isActive ? 700 : 600,
            color: isActive ? "#1d4ed8" : "#111827",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
            maxWidth:140,
          }}>{group.groupName}</span>
          <span style={{ fontSize:10, color:"#9ca3af", flexShrink:0 }}>
            {group.lastMessageTime ? fmt(group.lastMessageTime) : ""}
          </span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:1 }}>
          <span style={{
            fontSize:11.5, color:"#9ca3af",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:155,
          }}>
            {group.lastMessage?.message || group.description || "No messages yet"}
          </span>
          {unread > 0 && (
            <span style={{
              background:"#3b82f6", color:"#fff",
              borderRadius:99, padding:"1px 6px",
              fontSize:10, fontWeight:700, flexShrink:0, marginLeft:4,
              minWidth:18, textAlign:"center",
            }}>{unread > 99 ? "99+" : unread}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────
function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, padding:40, color:"#9ca3af", textAlign:"center" }}>
      <div style={{ fontSize:44, marginBottom:12, opacity:0.6 }}>{icon}</div>
      <div style={{ fontSize:15, fontWeight:600, color:"#6b7280", marginBottom:4 }}>{title}</div>
      {sub && <div style={{ fontSize:12, maxWidth:200, lineHeight:1.6 }}>{sub}</div>}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function ResidentChat() {
  const user = useSelector(s => s.auth?.user || s.user?.user || {});
  const currentUserId = user._id || user.id;

  const [groups, setGroups]           = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [msgLoading, setMsgLoading]   = useState(false);
  const [typers, setTypers]           = useState([]);
  const [replyTo, setReplyTo]         = useState(null);
  const [editMsg, setEditMsg]         = useState(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [allResidents, setAllResidents] = useState([]);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(false);
  const [unread, setUnread]           = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [groupSearch, setGroupSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showMemberList, setShowMemberList] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const typingTimeout  = useRef(null);
  const chatSocket     = useRef(null);

  // ─── Fetch groups ──────────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/chat/groups");
      if (data.success) setGroups(data.data);
    } catch (e) { console.error("fetchGroups:", e.response?.status, e.response?.data); }
    finally { setLoading(false); }
  }, []);

  // ─── Fetch residents ───────────────────────────────────────
  const fetchResidents = useCallback(async () => {
    try {
      const { data } = await api.get("/resident/all");
      setAllResidents(data.data || data || []);
    } catch (e) { console.error("fetchResidents:", e.response?.status); }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchResidents();
    if (currentUserId) socket.emit("registerResident", currentUserId);
  }, [fetchGroups, fetchResidents, currentUserId]);

  // ─── Chat namespace socket ─────────────────────────────────
  useEffect(() => {
    const cs = io(`${SOCKET_URL}/chat`, { withCredentials:true });
    chatSocket.current = cs;

    cs.on("receiveMessage", msg => {
      setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
      setGroups(gs => gs.map(g =>
        g._id === msg.groupId ? { ...g, lastMessage:msg, lastMessageTime:msg.createdAt } : g
      ));
      scrollToBottom();
    });
    cs.on("someoneTyping",        ({ name }) => setTypers(p => p.includes(name) ? p : [...p, name]));
    cs.on("someoneStoppedTyping", ({ name }) => setTypers(p => p.filter(n => n !== name)));
    cs.on("messageUpdated",  ({ messageId, message, editedAt }) =>
      setMessages(p => p.map(m => m._id === messageId ? {...m, message, isEdited:true, editedAt} : m))
    );
    cs.on("messageRemoved",  ({ messageId }) =>
      setMessages(p => p.filter(m => m._id !== messageId))
    );
    cs.on("userOnlineStatus", ({ userId, status }) =>
      setOnlineUsers(prev => { const s = new Set(prev); status==="online" ? s.add(userId) : s.delete(userId); return s; })
    );
    cs.on("reactionAdded", ({ messageId, reactions }) =>
      setMessages(p => p.map(m => m._id === messageId ? {...m, reactions} : m))
    );

    return () => cs.disconnect();
  }, []);

  // ─── Main socket: new messages + reactions ─────────────────
  useEffect(() => {
    socket.on("newMessage", msg => {
      if (activeGroup && msg.groupId === activeGroup._id) {
        setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
        scrollToBottom();
      } else {
        setUnread(prev => ({ ...prev, [msg.groupId]: (prev[msg.groupId]||0)+1 }));
      }
    });
    socket.on("reactionAdded", ({ messageId, reactions }) =>
      setMessages(p => p.map(m => m._id === messageId ? {...m, reactions} : m))
    );
    return () => { socket.off("newMessage"); socket.off("reactionAdded"); };
  }, [activeGroup]);

  // ─── Load messages when group changes ─────────────────────
  useEffect(() => {
    if (!activeGroup) return;
    setMessages([]); setPage(1); setReplyTo(null); setEditMsg(null); setShowMemberList(false);
    loadMessages(activeGroup._id, 1);
    markRead(activeGroup._id);
    if (chatSocket.current) {
      chatSocket.current.emit("joinGroup", activeGroup._id);
      chatSocket.current.emit("userOnline", { groupId:activeGroup._id, userId:currentUserId });
    }
  }, [activeGroup?._id]);

  const loadMessages = async (groupId, pg = 1) => {
    setMsgLoading(true);
    try {
      const { data } = await api.get(`/chat/messages/${groupId}?page=${pg}&limit=50`);
      if (data.success) {
        setMessages(prev => pg === 1 ? data.data : [...data.data, ...prev]);
        setHasMore(data.pagination.pages > pg);
        if (pg === 1) setTimeout(scrollToBottom, 100);
      }
    } catch (e) { console.error(e); }
    finally { setMsgLoading(false); }
  };

  const markRead = async (groupId) => {
    try {
      await api.post(`/chat/group/${groupId}/read`);
      setUnread(prev => ({ ...prev, [groupId]:0 }));
    } catch (_) {}
  };

  const scrollToBottom = () =>
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }), 50);

  // ─── Send / Edit ───────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeGroup) return;
    const payload = { message:text };
    if (replyTo) payload.replyTo = replyTo._id;
    try {
      if (editMsg) {
        await api.put(`/chat/message/${editMsg._id}`, { message:text });
        chatSocket.current?.emit("messageEdited", {
          groupId:activeGroup._id, messageId:editMsg._id, message:text,
        });
        setMessages(p => p.map(m => m._id === editMsg._id ? {...m, message:text, isEdited:true} : m));
        setEditMsg(null);
      } else {
        const { data } = await api.post(`/chat/message/${activeGroup._id}`, payload);
        if (data.success) {
          chatSocket.current?.emit("sendMessage", { ...data.data, groupId:activeGroup._id });
          setMessages(prev => prev.find(m => m._id === data.data._id) ? prev : [...prev, data.data]);
          scrollToBottom();
        }
      }
      setInput(""); setReplyTo(null); stopTyping();
    } catch (e) { console.error(e); }
  };

  // ─── Typing ────────────────────────────────────────────────
  const handleTyping = (val) => {
    setInput(val);
    if (!activeGroup || !chatSocket.current) return;
    chatSocket.current.emit("userTyping", { groupId:activeGroup._id, name:user.fullName });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(stopTyping, 1500);
  };
  const stopTyping = () => {
    if (!activeGroup || !chatSocket.current) return;
    chatSocket.current.emit("userStoppedTyping", { groupId:activeGroup._id, name:user.fullName });
  };

  // ─── Reactions ─────────────────────────────────────────────
  const handleReact = async (messageId, emoji) => {
    try { await api.post(`/chat/message/${messageId}/react`, { emoji }); }
    catch (e) { console.error(e); }
  };

  // ─── Delete message ────────────────────────────────────────
  const handleDelete = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/chat/message/${messageId}`);
      chatSocket.current?.emit("messageDeleted", { groupId:activeGroup._id, messageId });
      setMessages(p => p.filter(m => m._id !== messageId));
    } catch (e) { console.error(e); }
  };

  // ─── Leave group ───────────────────────────────────────────
  const handleLeave = async () => {
    if (!activeGroup || !window.confirm(`Leave "${activeGroup.groupName}"?`)) return;
    try {
      await api.post(`/chat/group/${activeGroup._id}/leave`);
      setGroups(prev => prev.filter(g => g._id !== activeGroup._id));
      setActiveGroup(null);
    } catch (e) { console.error(e); }
  };

  // ─── Key handler ──────────────────────────────────────────
  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === "Escape") { setReplyTo(null); setEditMsg(null); setInput(""); }
  };

  // ─── Filter groups ─────────────────────────────────────────
  const filteredGroups = groups.filter(g => {
    const matchSearch = g.groupName?.toLowerCase().includes(groupSearch.toLowerCase());
    const matchType = activeFilter === "all" || g.groupType === activeFilter;
    return matchSearch && matchType;
  });

  const totalUnread = Object.values(unread).reduce((a,b) => a+b, 0);
  const dateGrouped = groupMsgsByDate(messages);
  const activeTc = activeGroup ? (typeConfig[activeGroup.groupType] || typeConfig.general) : null;

  return (
    <>
      <style>{STYLES}</style>
      <div className="rc-root" style={{
        display:"flex", height:"100%", minHeight:0,
        background:"#f8fafc",
        borderRadius:16,
        overflow:"hidden",
        border:"1px solid #e5e7eb",
        boxShadow:"0 4px 24px rgba(0,0,0,0.06)",
      }}>

        {/* ══ LEFT SIDEBAR ═══════════════════════════════════ */}
        <div style={{
          width:300, flexShrink:0,
          display:"flex", flexDirection:"column",
          background:"#fff",
          borderRight:"1px solid #f3f4f6",
        }}>
          {/* Sidebar header */}
          <div style={{ padding:"18px 16px 12px", borderBottom:"1px solid #f3f4f6" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div>
                <h2 style={{
                  fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:600,
                  color:"#111827", letterSpacing:-0.4,
                }}>
                  Community
                  {totalUnread > 0 && (
                    <span style={{
                      marginLeft:8, background:"#ef4444", color:"#fff",
                      borderRadius:99, padding:"1px 7px", fontSize:10, fontWeight:700,
                      verticalAlign:"middle",
                    }}>{totalUnread}</span>
                  )}
                </h2>
                <p style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>
                  {groups.length} group{groups.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => { setShowCreate(true); fetchResidents(); }}
                style={{
                  width:34, height:34, borderRadius:10,
                  background:"#3b82f6", border:"none",
                  cursor:"pointer", fontSize:18, fontWeight:700,
                  color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 2px 8px rgba(59,130,246,0.4)",
                  transition:"transform 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                title="New Group"
              >+</button>
            </div>

            {/* Search */}
            <div style={{ position:"relative", marginBottom:10 }}>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"#9ca3af" }}>🔍</span>
              <input placeholder="Search groups…"
                value={groupSearch} onChange={e => setGroupSearch(e.target.value)}
                className="rc-input"
                style={{
                  width:"100%", padding:"7px 10px 7px 28px",
                  border:"1.5px solid #e5e7eb", borderRadius:9,
                  fontSize:12, color:"#111827", outline:"none",
                  background:"#f9fafb",
                }}
              />
            </div>

            {/* Filter tabs */}
            <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:2 }}>
              {[["all","All"],["general","💬"],["announcements","📢"],["complaints","🚨"],["custom","⚙️"]].map(([key,label]) => (
                <button key={key} className={`rc-tab-btn ${activeFilter===key?"active":""}`}
                  onClick={() => setActiveFilter(key)}
                  style={{
                    padding:"4px 10px", borderRadius:7, border:"none",
                    cursor:"pointer", fontSize:11, fontWeight:500,
                    whiteSpace:"nowrap",
                    background: activeFilter===key ? "#eff6ff" : "transparent",
                    color: activeFilter===key ? "#1d4ed8" : "#6b7280",
                    transition:"all 0.12s",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Group list */}
          <div style={{ flex:1, overflowY:"auto" }}>
            {loading ? (
              <div style={{ padding:"12px 14px" }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0" }}>
                    <div className="rc-shimmer" style={{ width:40, height:40, borderRadius:12 }} />
                    <div style={{ flex:1 }}>
                      <div className="rc-shimmer" style={{ height:12, width:"60%", marginBottom:6 }} />
                      <div className="rc-shimmer" style={{ height:10, width:"40%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredGroups.length === 0 ? (
              <EmptyState icon="💬"
                title={groupSearch ? "No matches" : "No groups yet"}
                sub={groupSearch ? "Try a different search" : "Create a group to start chatting"} />
            ) : (
              filteredGroups.map(g => (
                <GroupItem key={g._id} group={g}
                  isActive={activeGroup?._id === g._id}
                  unread={unread[g._id]||0}
                  onClick={() => setActiveGroup(g)} />
              ))
            )}
          </div>
        </div>

        {/* ══ CHAT AREA ═══════════════════════════════════════ */}
        {activeGroup ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, background:"#f8fafc" }}>

            {/* Chat header */}
            <div style={{
              padding:"12px 20px",
              borderBottom:"1px solid #e5e7eb",
              display:"flex", alignItems:"center", gap:12,
              background:"#fff",
              boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                width:42, height:42, borderRadius:12,
                background: activeTc.bg,
                border:`1.5px solid ${activeTc.color}30`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:20, flexShrink:0,
              }}>{activeTc.icon}</div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{
                  fontFamily:"'Fraunces',serif",
                  fontSize:15, fontWeight:600, color:"#111827",
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                }}>{activeGroup.groupName}</div>
                <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>
                  <span style={{ color: activeTc.color, textTransform:"capitalize", fontWeight:500 }}>
                    {activeTc.label}
                  </span>
                  {" · "}
                  <button
                    onClick={() => setShowMemberList(p => !p)}
                    style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"#6b7280", padding:0 }}>
                    {activeGroup.members?.length||0} members
                  </button>
                </div>
              </div>

              <button onClick={handleLeave}
                style={{
                  padding:"6px 12px", borderRadius:8,
                  background:"#fef2f2", border:"1px solid #fecaca",
                  color:"#ef4444", cursor:"pointer", fontSize:11, fontWeight:600,
                  transition:"all 0.12s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}
              >Leave</button>
            </div>

            {/* Member list panel */}
            {showMemberList && (
              <div style={{
                background:"#fff", borderBottom:"1px solid #e5e7eb",
                padding:"12px 20px", animation:"rc-fadeUp 0.2s ease",
              }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:0.6, marginBottom:8 }}>
                  Members ({activeGroup.members?.length||0})
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {(activeGroup.members||[]).slice(0,12).map((m, i) => {
                    const id = m._id || m;
                    const name = m.fullName || `Member ${i+1}`;
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 8px", background:"#f9fafb", borderRadius:99, border:"1px solid #e5e7eb" }}>
                        <Av name={name} size={18} online={onlineUsers.has(id?.toString())} />
                        <span style={{ fontSize:11, color:"#374151", fontWeight:500 }}>{name.split(" ")[0]}</span>
                      </div>
                    );
                  })}
                  {(activeGroup.members?.length||0) > 12 && (
                    <span style={{ fontSize:11, color:"#9ca3af", padding:"4px 8px" }}>
                      +{(activeGroup.members.length - 12)} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Messages area */}
            <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:0 }}>
              {hasMore && (
                <button onClick={() => { const n=page+1; setPage(n); loadMessages(activeGroup._id,n); }}
                  style={{
                    alignSelf:"center", margin:"0 0 12px",
                    padding:"6px 18px", borderRadius:99,
                    background:"#fff", border:"1px solid #e5e7eb",
                    color:"#3b82f6", fontSize:11, fontWeight:600,
                    cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
                  }}>
                  ↑ Load earlier messages
                </button>
              )}

              {msgLoading && messages.length === 0 ? (
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12, paddingTop:8 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-end", flexDirection: i%2===0?"row-reverse":"row" }}>
                      <div className="rc-shimmer" style={{ width:30, height:30, borderRadius:"50%", flexShrink:0 }} />
                      <div className="rc-shimmer" style={{ height:40, width: 120+i*30, borderRadius:12 }} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <EmptyState icon="👋" title="Start the conversation!" sub="Be the first to say something." />
              ) : (
                Object.entries(dateGrouped).map(([date, msgs]) => (
                  <div key={date}>
                    <div style={{ textAlign:"center", margin:"14px 0 10px" }}>
                      <span style={{
                        fontSize:11, color:"#9ca3af", fontWeight:500,
                        background:"#f1f5f9", padding:"3px 12px",
                        borderRadius:99, border:"1px solid #e2e8f0",
                      }}>{dateLabel(date)}</span>
                    </div>
                    {msgs.map((msg, idx) => {
                      const isOwn = msg.senderId?._id === currentUserId || msg.senderId === currentUserId;
                      const prevMsg = msgs[idx-1];
                      const sameSender = prevMsg && (prevMsg.senderId?._id||prevMsg.senderId) === (msg.senderId?._id||msg.senderId);
                      const gap = sameSender ? 2 : 10;
                      return (
                        <div key={msg._id} style={{ marginTop:gap }}>
                          <MessageBubble
                            msg={msg} isOwn={isOwn}
                            onReact={handleReact}
                            onReply={m => { setReplyTo(m); setEditMsg(null); inputRef.current?.focus(); }}
                            onEdit={m => { setEditMsg(m); setInput(m.message); setReplyTo(null); inputRef.current?.focus(); }}
                            onDelete={handleDelete}
                            currentUserId={currentUserId}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))
              )}

              <TypingIndicator typers={typers} />
              <div ref={messagesEndRef} />
            </div>

            {/* Reply/Edit banner */}
            {(replyTo || editMsg) && (
              <div style={{
                margin:"0 20px",
                padding:"8px 12px",
                background: replyTo ? "#eff6ff" : "#f0fdf4",
                borderLeft:`3px solid ${replyTo ? "#3b82f6" : "#22c55e"}`,
                borderRadius:"8px 8px 0 0",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                animation:"rc-fadeUp 0.15s ease",
              }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color: replyTo ? "#3b82f6" : "#16a34a", textTransform:"uppercase", letterSpacing:0.5, marginBottom:1 }}>
                    {replyTo ? `Replying to ${replyTo.senderName}` : "Editing message"}
                  </div>
                  <div style={{ fontSize:12, color:"#6b7280", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:360 }}>
                    {replyTo?.message || editMsg?.message}
                  </div>
                </div>
                <button onClick={() => { setReplyTo(null); setEditMsg(null); setInput(""); }}
                  style={{ background:"none", border:"none", color:"#9ca3af", cursor:"pointer", fontSize:16, padding:"0 4px" }}>
                  ✕
                </button>
              </div>
            )}

            {/* Input bar */}
            <div style={{
              padding:"12px 20px 16px",
              borderTop:"1px solid #e5e7eb",
              display:"flex", alignItems:"flex-end", gap:10,
              background:"#fff",
            }}>
              <div style={{
                flex:1,
                border: `1.5px solid ${replyTo||editMsg ? (replyTo?"#93c5fd":"#86efac") : "#e5e7eb"}`,
                borderRadius: replyTo||editMsg ? "0 0 12px 12px" : 12,
                overflow:"hidden",
                transition:"border-color 0.2s",
                background:"#fafafa",
              }}
                onFocusCapture={e => e.currentTarget.style.borderColor = "#93c5fd"}
                onBlurCapture={e => e.currentTarget.style.borderColor = replyTo||editMsg ? (replyTo?"#93c5fd":"#86efac") : "#e5e7eb"}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => handleTyping(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={editMsg ? "Edit message… (Enter to save)" : "Type a message… (Enter to send, Shift+Enter for new line)"}
                  rows={1}
                  style={{
                    width:"100%", padding:"10px 14px",
                    background:"transparent", border:"none",
                    color:"#111827", fontSize:13.5,
                    fontFamily:"'Plus Jakarta Sans', sans-serif",
                    resize:"none", outline:"none",
                    lineHeight:1.5, maxHeight:100, overflowY:"auto",
                    display:"block",
                  }}
                  onInput={e => {
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                  }}
                />
              </div>

              <button
                className="rc-send-btn"
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width:42, height:42, borderRadius:12, flexShrink:0,
                  background: input.trim()
                    ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                    : "#e5e7eb",
                  border:"none",
                  cursor: input.trim() ? "pointer" : "default",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:15, color: input.trim() ? "#fff" : "#9ca3af",
                  transition:"all 0.15s",
                }}>
                {editMsg ? "✓" : "➤"}
              </button>
            </div>
          </div>
        ) : (
          /* No group selected */
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#f8fafc" }}>
            <div style={{ textAlign:"center", maxWidth:280 }}>
              <div style={{
                width:72, height:72, borderRadius:20,
                background:"#eff6ff", border:"1.5px solid #bfdbfe",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:32, margin:"0 auto 16px",
              }}>💬</div>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:600, color:"#111827", marginBottom:8 }}>
                Your conversations
              </h3>
              <p style={{ fontSize:13, color:"#9ca3af", lineHeight:1.6, marginBottom:20 }}>
                Select a group from the sidebar or create a new one to start chatting with your community.
              </p>
              <button
                onClick={() => { setShowCreate(true); fetchResidents(); }}
                style={{
                  padding:"10px 24px", borderRadius:10,
                  background:"#3b82f6", border:"none",
                  color:"#fff", fontSize:13, fontWeight:600,
                  cursor:"pointer",
                  boxShadow:"0 2px 12px rgba(59,130,246,0.3)",
                }}>
                + New Group
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={g => { setGroups(prev => [g, ...prev]); setActiveGroup(g); }}
          allResidents={allResidents}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}