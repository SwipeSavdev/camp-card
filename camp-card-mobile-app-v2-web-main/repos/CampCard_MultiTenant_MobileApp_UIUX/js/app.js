/* Camp Card MultiTenant App Prototype (Vanilla JS)
 - One login, different role experiences (Customer / Troop Leader / Scout)
 - Screen routing + bottom tabs
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
 tenant: "Central Florida Council",
 role: null, // "customer" | "leader" | "scout"
 userName: "Taylor",
 troopName: "Troop 512",
 scoutName: "Avery",
 geoNotifications: true,
 offersNearMe: true,
 loggedIn: false,

 // sample metrics
 customer: {
 savedThisMonth: 18.50,
 favoriteOffers: 6,
 },
 leader: {
 fundsRaised: 3480,
 cardsSold: 116,
 goal: 5000,
 troopLink: "https://campcard.app/cfc/troop/512?src=app",
 scouts: [
 { name: "Avery R.", cards: 18, funds: 540 },
 { name: "Jordan K.", cards: 12, funds: 360 },
 { name: "Sam P.", cards: 9, funds: 270 },
 { name: "Casey L.", cards: 7, funds: 210 },
 ]
 },
 scout: {
 cardsSold: 18,
 fundsRaised: 540,
 goal: 750,
 scoutLink: "https://campcard.app/cfc/scout/averyr?src=app",
 }
};

const screens = {
 login: "login",
 signup: "signup",

 customerHome: "customer-home",
 customerOffers: "customer-offers",
 customerSettings: "customer-settings",

 leaderHome: "leader-home",
 leaderShare: "leader-share",
 leaderScouts: "leader-scouts",
 leaderSettings: "leader-settings",

 scoutHome: "scout-home",
 scoutShare: "scout-share",
 scoutSettings: "scout-settings",
};

const roleMeta = {
 customer: { label: "Customer", accent: "red" },
 leader: { label: "Troop Leader", accent: "red" },
 scout: { label: "Scout", accent: "red" },
};

function fmtMoney(n) {
 try {
 return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
 } catch {
 return "$" + Math.round(n).toString();
 }
}

function fmtMoney2(n) {
 try {
 return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
 } catch {
 return "$" + n.toFixed(2);
 }
}

function setHeader(screenLabel) {
 $("#tenantName").textContent = state.tenant;
 $("#screenName").textContent = screenLabel;
 $("#rolePill").innerHTML = `<span class="dot"></span><strong>${roleMeta[state.role]?.label ?? "Guest"}</strong>`;
}

function toast(msg) {
 const t = $("#toast");
 t.textContent = msg;
 t.classList.add("is-on");
 setTimeout(() => t.classList.remove("is-on"), 1800);
}

function showScreen(id) {
 $$(".screen").forEach(s => s.classList.remove("is-active"));
 const el = $(`.screen[data-screen="${id}"]`);
 if (!el) return;

 el.classList.add("is-active");
 $("#content").scrollTop = 0;
}

function showTabbar(role) {
 const tabbar = $("#tabbar");
 tabbar.classList.remove("is-visible", "three");
 $$("#tabbar .tab").forEach(t => t.remove());

 if (!role) return;

 const tabs = (role === "customer") ? [
 { key: "home", label: "Home", icon: "home", screen: screens.customerHome },
 { key: "offers", label: "Offers", icon: "tag", screen: screens.customerOffers },
 { key: "settings", label: "Settings", icon: "settings", screen: screens.customerSettings },
 ] : (role === "leader") ? [
 { key: "home", label: "Home", icon: "home", screen: screens.leaderHome },
 { key: "share", label: "Share", icon: "share", screen: screens.leaderShare },
 { key: "scouts", label: "Scouts", icon: "users", screen: screens.leaderScouts },
 { key: "settings", label: "Settings", icon: "settings", screen: screens.leaderSettings },
 ] : [
 { key: "home", label: "Home", icon: "home", screen: screens.scoutHome },
 { key: "share", label: "Share", icon: "share", screen: screens.scoutShare },
 { key: "settings", label: "Settings", icon: "settings", screen: screens.scoutSettings },
 ];

 tabbar.classList.add("is-visible");
 if (tabs.length === 3) tabbar.classList.add("three");

 tabs.forEach((t, idx) => {
 const btn = document.createElement("button");
 btn.className = "tab";
 btn.type = "button";
 btn.dataset.tab = t.key;
 btn.dataset.screen = t.screen;
 btn.innerHTML = `${iconSvg(t.icon)}<div class="t">${t.label}</div>`;
 btn.addEventListener("click", () => navigate(t.screen));
 tabbar.appendChild(btn);
 });
}

function setActiveTabByScreen(screenId) {
 const tab = $(`#tabbar .tab[data-screen="${screenId}"]`);
 $$("#tabbar .tab").forEach(t => t.classList.remove("is-active"));
 if (tab) tab.classList.add("is-active");
}

function iconSvg(name) {
 // Inline SVGs to keep everything self-contained.
 const icons = {
 home: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
 <path d="M3 10.5 12 3l9 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M5.5 10.5V21h13V10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M10 21v-6h4v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>`,
 tag: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
 <path d="M20 13l-7 7-10-10V3h7l10 10Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
 <path d="M7.5 7.5h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
 </svg>`,
 share: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
 <path d="M16 8a3 3 0 1 0-2.83-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
 <path d="M6 14a3 3 0 1 0 2.83 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
 <path d="M18 12a3 3 0 1 0 0 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
 <path d="M8.6 15.3l6.8-2.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
 <path d="M8.6 8.7l6.8 2.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
 </svg>`,
 users: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>`,
 settings: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
 <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="2"/>
 <path d="M19.4 15a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7.8 7.8 0 0 0-.1 1 7.8 7.8 0 0 0 .1 1l-2 1.5 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.4 2.6h4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
 </svg>`,
 copy: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
 <path d="M9 9h10v12H9V9Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
 <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
 </svg>`,
 back: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
 <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>`,
 qr: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
 <path d="M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 11v-5h2v5h-2Zm4-8h3v8h-3v-8Zm-4 0h2v2h-2v-2Zm4-3h3v2h-3v-2Zm-5 3h2v2h-2v-2Z" fill="currentColor"/>
 </svg>`,
 };
 return icons[name] ?? "";
}

function renderLeaderScouts() {
 const list = $("#scoutList");
 list.innerHTML = "";
 state.leader.scouts
 .slice()
 .sort((a,b) => b.funds - a.funds)
 .forEach(s => {
 const el = document.createElement("div");
 el.className = "item";
 el.innerHTML = `
 <div class="top">
 <div>
 <p class="title">${s.name}</p>
 <div class="meta">${s.cards} cards  ${fmtMoney(s.funds)} raised</div>
 </div>
 <span class="chip ${s.cards >= 15 ? "green" : ""}">${s.cards >= 15 ? "On track" : "In progress"}</span>
 </div>
 `;
 list.appendChild(el);
 });

 // Aggregate totals (simple rollup)
 const totalCards = state.leader.scouts.reduce((acc,s) => acc + s.cards, 0);
 const totalFunds = state.leader.scouts.reduce((acc,s) => acc + s.funds, 0);
 $("#leaderTotals").textContent = `${totalCards} cards  ${fmtMoney(totalFunds)} raised (scouts shown)`;
}

function render() {
 // Header role pill
 if (!state.role) {
 $("#rolePill").style.visibility = "hidden";
 } else {
 $("#rolePill").style.visibility = "visible";
 }

 // Customer numbers
 $("#customerSaved").textContent = fmtMoney2(state.customer.savedThisMonth);
 $("#customerFav").textContent = state.customer.favoriteOffers.toString();

 // Leader numbers
 $("#leaderFunds").textContent = fmtMoney(state.leader.fundsRaised);
 $("#leaderCards").textContent = state.leader.cardsSold.toString();
 const pct = Math.min(100, Math.round((state.leader.fundsRaised / state.leader.goal) * 100));
 $("#leaderGoalPct").textContent = pct + "%";
 $("#leaderGoalValue").textContent = fmtMoney(state.leader.goal);
 $("#leaderProgressBar").style.width = pct + "%";
 $("#troopLink").textContent = state.leader.troopLink;

 // Scout numbers
 $("#scoutFunds").textContent = fmtMoney(state.scout.fundsRaised);
 $("#scoutCards").textContent = state.scout.cardsSold.toString();
 const spct = Math.min(100, Math.round((state.scout.fundsRaised / state.scout.goal) * 100));
 $("#scoutGoalPct").textContent = spct + "%";
 $("#scoutGoalValue").textContent = fmtMoney(state.scout.goal);
 $("#scoutProgressBar").style.width = spct + "%";
 $("#scoutLink").textContent = state.scout.scoutLink;

 // Toggles
 $("#toggleGeo").classList.toggle("is-on", state.geoNotifications);

 // Scouts management list
 renderLeaderScouts();
}

function navigate(screenId) {
 // Screen label mapping for header
 const labels = {
 [screens.login]: "Sign in",
 [screens.signup]: "Create account",

 [screens.customerHome]: "Home",
 [screens.customerOffers]: "Discount offers",
 [screens.customerSettings]: "Settings",

 [screens.leaderHome]: "Dashboard",
 [screens.leaderShare]: "Share link",
 [screens.leaderScouts]: "Scouts",
 [screens.leaderSettings]: "Settings",

 [screens.scoutHome]: "Home",
 [screens.scoutShare]: "Share link",
 [screens.scoutSettings]: "Settings",
 };

 showScreen(screenId);
 setActiveTabByScreen(screenId);

 // Update header title
 setHeader(labels[screenId] ?? "Camp Card");

 // Back button behavior (only on signup)
 const backBtn = $("#backBtn");
 if (screenId === screens.signup) {
 backBtn.style.visibility = "visible";
 } else {
 backBtn.style.visibility = "hidden";
 }
}

function loginAs(role) {
 state.role = role;
 state.loggedIn = true;
 showTabbar(role);
 render();

 if (role === "customer") navigate(screens.customerHome);
 if (role === "leader") navigate(screens.leaderHome);
 if (role === "scout") navigate(screens.scoutHome);
}

function logout() {
 state.role = null;
 state.loggedIn = false;
 $("#tabbar").classList.remove("is-visible", "three");
 $$("#tabbar .tab").forEach(t => t.remove());
 $("#backBtn").style.visibility = "hidden";
 setHeader("Sign in");
 navigate(screens.login);
 toast("Signed out");
}

function setupEvents() {
 // Login form
 $("#loginForm").addEventListener("submit", (e) => {
 e.preventDefault();
 const role = $("#roleSelect").value;
 const name = $("#loginName").value.trim();
 if (name) state.userName = name;

 loginAs(role);
 toast(`Welcome, ${state.userName}!`);
 });

 // Sign up entry
 $("#gotoSignup").addEventListener("click", () => {
 navigate(screens.signup);
 });
 $("#backBtn").addEventListener("click", () => {
 navigate(screens.login);
 });

 // Sign up form
 $("#signupForm").addEventListener("submit", (e) => {
 e.preventDefault();
 const role = $("#signupRole").value;
 const name = $("#signupName").value.trim() || "Taylor";
 state.userName = name;
 // Tenant select (prototype keeps one; hook is here)
 const tenant = $("#signupTenant").value;
 state.tenant = tenant;

 loginAs(role);
 toast("Account created");
 });

 // Settings toggles
 $("#toggleGeo").addEventListener("click", () => {
 state.geoNotifications = !state.geoNotifications;
 render();
 toast(state.geoNotifications ? "Geo notifications ON" : "Geo notifications OFF");
 });

 // Copy link buttons
 $("#copyTroopLink").addEventListener("click", async () => {
 await copyToClipboard(state.leader.troopLink);
 toast("Troop link copied");
 });
 $("#copyScoutLink").addEventListener("click", async () => {
 await copyToClipboard(state.scout.scoutLink);
 toast("Scout link copied");
 });

 // Web share buttons
 $("#shareTroopLink").addEventListener("click", async () => {
 await shareLink("Support our troop!", state.leader.troopLink);
 });
 $("#shareScoutLink").addEventListener("click", async () => {
 await shareLink("Support my Camp Card fundraising!", state.scout.scoutLink);
 });

 // Leader: add scout
 $("#addScoutBtn").addEventListener("click", () => {
 const name = prompt("Scout name (prototype):", "New Scout");
 if (!name) return;
 state.leader.scouts.unshift({ name, cards: 0, funds: 0 });
 render();
 toast("Scout added");
 });

 // Global: role quick-switch (for demo)
 $("#rolePill").addEventListener("click", () => {
 if (!state.loggedIn) return;
 const next = state.role === "customer" ? "leader" : state.role === "leader" ? "scout" : "customer";
 loginAs(next);
 toast(`Switched to ${roleMeta[next].label} view`);
 });

 // Logout
 $$(".logoutBtn").forEach(btn => btn.addEventListener("click", logout));

 // Keyboard shortcuts (helpful when reviewing)
 window.addEventListener("keydown", (e) => {
 if (e.key === "1") loginAs("customer");
 if (e.key === "2") loginAs("leader");
 if (e.key === "3") loginAs("scout");
 });
}

async function copyToClipboard(text) {
 try {
 await navigator.clipboard.writeText(text);
 } catch {
 // fallback
 const ta = document.createElement("textarea");
 ta.value = text;
 document.body.appendChild(ta);
 ta.select();
 document.execCommand("copy");
 ta.remove();
 }
}

async function shareLink(title, url) {
 try {
 if (navigator.share) {
 await navigator.share({ title, text: title, url });
 } else {
 await copyToClipboard(url);
 toast("Sharing not supported here  link copied");
 }
 } catch {
 toast("Share canceled");
 }
}

function init() {
 // Initialize header and first screen
 setHeader("Sign in");
 $("#backBtn").style.visibility = "hidden";
 navigate(screens.login);
 setupEvents();
 render();

 // Auto-start role if provided (useful for role-specific HTML entrypoints)
 try {
 const hash = (location.hash || "").replace("#", "");
 const params = new URLSearchParams(hash.includes("&") ? hash : hash.replace("role=", "role="));
 const roleFromHash = (hash.startsWith("role=") ? hash.split("=")[1] : (params.get("role") || "")).toLowerCase();
 const roleFromGlobal = (window.__initialRole || "").toLowerCase();
 const role = (roleFromGlobal || roleFromHash);
 if (["customer","leader","scout"].includes(role)) {
 loginAs(role);
 }
 } catch {}

}

document.addEventListener("DOMContentLoaded", init);
