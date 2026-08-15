const STORAGE_KEY = "mi-navidad-data-v1";
const PRIZES = [
  { id: "first", label: "1º premio", short: "El Gordo", amount: 400000 },
  { id: "second", label: "2º premio", short: "Segundo", amount: 125000 },
  { id: "third", label: "3º premio", short: "Tercero", amount: 50000 },
  { id: "fourth", label: "4º premio", short: "Cuarto", amount: 20000 },
  { id: "fifth", label: "5º premio", short: "Quinto", amount: 6000 },
  { id: "pedrea", label: "Pedrea", short: "Pedrea", amount: 100 },
  { id: "firstApproach", label: "Aproximación al Gordo", short: "Anterior/posterior Gordo", amount: 2000 },
  { id: "secondApproach", label: "Aproximación al 2º", short: "Anterior/posterior 2º", amount: 1250 },
  { id: "thirdApproach", label: "Aproximación al 3º", short: "Anterior/posterior 3º", amount: 960 },
  { id: "firstEnding", label: "Terminación Gordo", short: "2, 3 o 4 cifras + reintegro", amount: 120 },
  { id: "otherEnding", label: "Terminación 2º / 3º", short: "Dos últimas cifras", amount: 100 },
  { id: "threeEnding", label: "Tres últimas cifras", short: "2º, 3º o 4º", amount: 100 },
  { id: "refund", label: "Reintegro", short: "Última cifra del Gordo", amount: 20 }
];
const demoData = {
  2026: { first: "", second: "", third: "", fourth: ["", ""], fifth: ["", "", "", "", "", "", "", ""], pedrea: [], tickets: [] },
  2025: {
    first: "79432", second: "70048", third: "90693", fourth: ["78477", ""], fifth: ["25508", "", "", "", "", "", "", ""], pedrea: [],
    tickets: [
      { number: "23112", amount: 20, person: "Yo", note: "Administración", origin: "Administración", commission: 0, given: 0, received: 0, shared: false },
      { number: "60649", amount: 20, person: "María", note: "Intercambio", origin: "María", commission: 0, given: 0, received: 20, shared: true },
      { number: "77715", amount: 20, person: "Carlos", note: "Intercambio", origin: "Carlos", commission: 0, given: 0, received: 20, shared: true },
      { number: "25412", amount: 20, person: "Yo", note: "Peña familiar", origin: "Peña familiar", commission: 0, given: 0, received: 0, shared: false },
      { number: "61366", amount: 20, person: "Ana", note: "Intercambio", origin: "Ana", commission: 0, given: 0, received: 20, shared: true },
      { number: "41716", amount: 20, person: "Yo", note: "Administración", origin: "Administración", commission: 0, given: 0, received: 0, shared: false },
      { number: "18669", amount: 20, person: "Luis", note: "Intercambio", origin: "Luis", commission: 0, given: 0, received: 20, shared: true },
      { number: "80389", amount: 20, person: "Yo", note: "Administración", origin: "Administración", commission: 0, given: 0, received: 0, shared: false },
      { number: "44356", amount: 20, person: "Sonia", note: "Intercambio", origin: "Sonia", commission: 0, given: 0, received: 20, shared: true },
      { number: "93240", amount: 20, person: "Yo", note: "Administración", origin: "Administración", commission: 0, given: 0, received: 0, shared: false },
      { number: "39183", amount: 20, person: "Yo", note: "Administración", origin: "Administración", commission: 0, given: 0, received: 0, shared: false },
      { number: "12072", amount: 20, person: "Papeleta", note: "Peña", origin: "Peña", commission: 0, given: 0, received: 20, shared: true },
      { number: "86109", amount: 16.8, person: "Yo", note: "Participación", origin: "Participación", commission: 0, given: 0, received: 0, shared: false },
      { number: "26278", amount: 5, person: "Yo", note: "Participación", origin: "Participación", commission: 0, given: 0, received: 0, shared: false },
      { number: "80680", amount: 5, person: "Yo", note: "Participación", origin: "Participación", commission: 0, given: 0, received: 0, shared: false }
    ]
  }
};

let data = structuredClone(demoData);
let selectedYear = Number(localStorage.getItem("mi-navidad-year") || 2026);
let currentView = "resumen";
let currentNick = null;
let saveTimer = null;

const euro = value => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value || 0);
const pad = value => String(value || "").replace(/\D/g, "").slice(0, 5).padStart(5, "0");
const validNumber = value => /^\d{5}$/.test(String(value || ""));
const numberList = value => Array.isArray(value) ? value.filter(validNumber) : validNumber(value) ? [value] : [];
const current = () => {
  if (!data[selectedYear]) data[selectedYear] = structuredClone(demoData[2026]);
  const year = data[selectedYear];
  year.fourth = Array.isArray(year.fourth) ? year.fourth : [year.fourth || "", ""];
  year.fifth = Array.isArray(year.fifth) ? year.fifth : [year.fifth || "", "", "", "", "", "", "", ""];
  year.pedrea = Array.isArray(year.pedrea) ? year.pedrea : [];
  year.tickets = (year.tickets || []).map(ticket => ({ origin: "", commission: 0, given: 0, received: 0, ...ticket }));
  return year;
};
const tickets = () => current().tickets || [];
const spentAmount = ticket => Math.max(0, Number(ticket.amount || 0) + Number(ticket.commission || 0) - Number(ticket.received || 0));
const netPrize = gross => gross <= 40000 ? gross : 40000 + (gross - 40000) * 0.8;
const prizeMatches = ticket => {
  const winning = current();
  const number = Number(ticket.number);
  const matches = [];
  const exact = [
    [winning.first, "El Gordo", 400000], [winning.second, "Segundo premio", 125000], [winning.third, "Tercer premio", 50000],
    ...numberList(winning.fourth).map(value => [value, "Cuarto premio", 20000]), ...numberList(winning.fifth).map(value => [value, "Quinto premio", 6000])
  ];
  const exactMatch = exact.find(([value]) => value === ticket.number);
  if (exactMatch) return [{ label: exactMatch[1], gross: exactMatch[2] }];
  const approaches = [[winning.first, "Aproximación al Gordo", 2000], [winning.second, "Aproximación al 2º premio", 1250], [winning.third, "Aproximación al 3º premio", 960]];
  const approach = approaches.find(([value]) => validNumber(value) && (number === Number(value) - 1 || number === Number(value) + 1));
  if (approach) matches.push({ label: approach[1], gross: approach[2] });
  const firstEnding = validNumber(winning.first) && [2, 3, 4].some(size => ticket.number.slice(-size) === winning.first.slice(-size));
  if (firstEnding) matches.push({ label: "Terminación del Gordo (incluye reintegro)", gross: 120 });
  const otherTwo = [winning.second, winning.third].some(value => validNumber(value) && ticket.number.slice(-2) === value.slice(-2));
  if (otherTwo) matches.push({ label: "Dos últimas cifras del 2º/3º", gross: 100 });
  const threeEnding = [winning.second, winning.third, ...numberList(winning.fourth)].some(value => validNumber(value) && ticket.number.slice(-3) === value.slice(-3));
  if (threeEnding) matches.push({ label: "Tres últimas cifras", gross: 100 });
  if (ticket.pedrea) matches.push({ label: "Pedrea", gross: 100 });
  if (!firstEnding && validNumber(winning.first) && ticket.number.slice(-1) === winning.first.slice(-1)) matches.push({ label: "Reintegro", gross: 20 });
  return matches;
};
const earnedFor = ticket => prizeMatches(ticket).reduce((sum, prize) => sum + netPrize(prize.gross * (Number(ticket.amount || 0) / 20)), 0);
const prizeLabel = ticket => prizeMatches(ticket).map(prize => prize.label).join(" + ");
const totalPlayed = () => tickets().reduce((sum, ticket) => sum + Number(ticket.amount || 0), 0);
const totalSpent = () => tickets().reduce((sum, ticket) => sum + spentAmount(ticket), 0);
const totalEarned = () => tickets().reduce((sum, ticket) => sum + earnedFor(ticket), 0);
const el = id => document.getElementById(id);

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem("mi-navidad-year", String(selectedYear));
  if (!currentNick) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    window.LoteriaAuth.saveData(currentNick, data).catch(error => console.error("Error guardando en Firestore", error));
  }, 600);
}
function renderYearOptions() {
  const years = [...new Set([...Object.keys(data).map(Number), 2026, 2025])].sort((a, b) => b - a);
  el("yearSelect").innerHTML = years.map(year => `<option value="${year}" ${year === selectedYear ? "selected" : ""}>${year}</option>`).join("");
}
function prizeSummary() {
  const winning = current();
  return PRIZES.map(prize => {
    const numbers = prize.id === "first" ? [winning.first] : prize.id === "second" ? [winning.second] : prize.id === "third" ? [winning.third] : prize.id === "fourth" ? numberList(winning.fourth) : prize.id === "fifth" ? numberList(winning.fifth) : [];
    const matches = tickets().filter(ticket => numbers.includes(ticket.number));
    return { ...prize, number: numbers, matches, earned: matches.reduce((sum, ticket) => sum + earnedFor(ticket), 0) };
  });
}
function empty(text) { return `<div class="empty-state">${text}</div>`; }
function renderSummary() {
  const played = totalPlayed(); const spent = totalSpent(); const earned = totalEarned(); const count = tickets().length;
  const progress = spent ? Math.min(100, Math.round((earned / spent) * 100)) : 0;
  const recent = tickets().slice(-4).reverse();
  return `<div class="dashboard-grid">
    <div class="stat-card featured"><div><div class="stat-label">Premios netos estimados</div><div class="stat-value">${euro(earned)}</div><div class="stat-sub">Después de impuestos · ${selectedYear}</div></div><div class="stat-accent">✦</div></div>
    <div class="stat-card"><div><div class="stat-label">Total gastado</div><div class="stat-value">${euro(spent)}</div><div class="stat-sub">${euro(played)} de importe jugado · ${count} registros</div></div><div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div><div class="split-row"><span>Retorno sobre gasto</span><strong>${progress}%</strong></div></div>
    <div class="metrics"><div class="stat-card"><div class="stat-label">Décimos y participaciones</div><div class="stat-value">${count}</div><div class="stat-sub">Registrados este año</div></div><div class="stat-card"><div class="stat-label">Con intercambio</div><div class="stat-value">${tickets().filter(ticket => Number(ticket.given || 0) > 0).length}</div><div class="stat-sub">Filas con importe dado</div></div><div class="stat-card"><div class="stat-label">Premios detectados</div><div class="stat-value">${tickets().filter(ticket => earnedFor(ticket) > 0).length}</div><div class="stat-sub">Según resultados introducidos</div></div></div>
    <section class="panel"><div class="panel-heading"><div><h2>Últimos décimos</h2><p>Lo añadido más recientemente</p></div><button class="link-button" data-view="decimos">Ver todos →</button></div><div class="activity-list">${recent.length ? recent.map(ticket => `<div class="activity-item"><div class="activity-icon">◌</div><div><p class="item-title">${ticket.number} <span class="badge">${ticket.person || "Sin asignar"}</span></p><p class="item-meta">${ticket.note || "Sin notas"}</p></div><div class="item-amount">${euro(ticket.amount)}</div></div>`).join("") : empty("Aún no hay décimos en este año.")}</div></section>
    <section class="panel"><div class="panel-heading"><div><h2>Resultados introducidos</h2><p>Actualiza los números cuando se publiquen</p></div><button class="link-button" data-view="premios">Gestionar →</button></div><div class="activity-list">${prizeSummary().slice(0, 5).map(prize => `<div class="activity-item"><div class="activity-icon">${prize.id === "first" ? "★" : "·"}</div><div><p class="item-title">${prize.label}</p><p class="item-meta">${prize.number.join(", ") || "Pendiente de introducir"}</p></div><div class="item-amount ${prize.earned ? "positive" : ""}">${prize.earned ? euro(prize.earned) : "—"}</div></div>`).join("")}</div></section>
  </div>`;
}
function renderTickets() {
  return `<div class="view-grid"><section class="panel"><div class="panel-heading"><div><h2>Mis décimos y participaciones</h2><p>${tickets().length} registros · ${euro(totalSpent())} gastados · ${euro(totalPlayed())} jugados</p></div></div><div class="table-wrap"><table class="ticket-table"><thead><tr><th>Número</th><th>Origen</th><th>Importe jugado</th><th>Gastado</th><th>Comisión</th><th>Dado</th><th>Recibido</th><th>Pedrea</th><th>Premio total</th><th>Premio sin impuestos</th><th></th></tr></thead><tbody>${tickets().length ? tickets().map((ticket, index) => { const gross = prizeMatches(ticket).reduce((sum, prize) => sum + prize.gross * (Number(ticket.amount || 0) / 20), 0); const net = earnedFor(ticket); return `<tr class="${Number(ticket.given || 0) > 0 ? "shared-row" : ""}"><td class="number-cell">${ticket.number}</td><td>${ticket.origin || "—"}</td><td class="money-cell">${euro(ticket.amount)}</td><td class="money-cell strong-cell">${euro(spentAmount(ticket))}</td><td class="money-cell">${euro(ticket.commission)}</td><td class="money-cell">${euro(ticket.given)}</td><td class="money-cell">${euro(ticket.received)}</td><td><label class="pedrea-check"><input type="checkbox" data-ticket-pedrea="${index}" ${ticket.pedrea ? "checked" : ""}> <span>Cantado</span></label></td><td class="money-cell ${gross ? "positive" : ""}">${gross ? euro(gross) : "—"}</td><td class="money-cell ${net ? "positive" : ""}">${net ? `<strong>${euro(net)}</strong><small class="prize-detail">${prizeLabel(ticket)}</small>` : "—"}</td><td><button class="link-button" data-delete-ticket="${index}" title="Eliminar décimo">Eliminar</button></td></tr>`; }).join("") : `<tr><td colspan="11">${empty("Añade tu primer décimo para empezar.")}</td></tr>`}</tbody></table></div></section></div>`;
}
function renderEndings() {
  const endings = Array.from({ length: 10 }, (_, ending) => {
    const matching = tickets().filter(ticket => ticket.number.slice(-1) === String(ending));
    return { ending, count: matching.length, played: matching.reduce((sum, ticket) => sum + Number(ticket.amount || 0), 0) };
  });
  const covered = endings.filter(item => item.count > 0).length;
  return `<div class="view-grid"><section class="panel"><div class="panel-heading"><div><h2>Importe jugado por terminación</h2><p>${covered} de 10 terminaciones cubiertas · ${euro(totalPlayed())} jugados en total</p></div></div><div class="ending-grid">${endings.map(item => `<div class="ending-card ${item.count ? "ending-covered" : ""}"><div class="ending-digit">${item.ending}</div><div><strong>${euro(item.played)}</strong><span>${item.count} ${item.count === 1 ? "registro" : "registros"}</span></div></div>`).join("")}</div></section></div>`;
}
function renderPrizes() {
  const winning = current();
  const single = [["first", "El Gordo", 400000], ["second", "Segundo premio", 125000], ["third", "Tercer premio", 50000]];
  const field = (label, key, value, index = "") => `<label class="prize-card"><span class="stat-label">${label}</span><input class="prize-input" data-prize="${key}" data-index="${index}" value="${value || ""}" inputmode="numeric" maxlength="5" placeholder="00000"><p>${euro(key === "first" ? 400000 : key === "second" ? 125000 : key === "third" ? 50000 : key === "fourth" ? 20000 : 6000)} por décimo</p></label>`;
  return `<div class="view-grid"><section class="panel"><div class="panel-heading"><div><h2>Premios principales de ${selectedYear}</h2><p>Introduce todos los números premiados y el cálculo se actualiza solo.</p></div></div><div class="prize-grid">${single.map(([key, label]) => field(label, key, winning[key])).join("")}${winning.fourth.map((value, index) => field(`Cuarto premio ${index + 1}`, "fourth", value, index)).join("")}${winning.fifth.map((value, index) => field(`Quinto premio ${index + 1}`, "fifth", value, index)).join("")}</div></section><section class="panel"><div class="panel-heading"><div><h2>Premios automáticos</h2><p>La app los calcula a partir de los números anteriores.</p></div></div><div class="auto-prize-grid"><div><strong>Aproximaciones</strong><span>Anterior y posterior del 1º, 2º y 3º premio</span></div><div><strong>Terminaciones</strong><span>2, 3 y 4 cifras del Gordo; 2 cifras del 2º y 3º; 3 cifras del 2º, 3º y 4º</span></div><div><strong>Reintegro</strong><span>Última cifra del Gordo</span></div><div><strong>Pedrea</strong><span>Se marca en cada décimo cuando se canta: 5 € por cada euro jugado</span></div></div></section></div>`;
}
function render() {
  renderYearOptions(); el("headingYear").textContent = selectedYear;
  const labels = { resumen: "Resumen de tu lotería", decimos: "Tus décimos", terminaciones: "Terminaciones", premios: "Premios y resultados" };
  el("viewTitle").textContent = labels[currentView];
  el("appContent").innerHTML = currentView === "resumen" ? renderSummary() : currentView === "decimos" ? renderTickets() : currentView === "terminaciones" ? renderEndings() : renderPrizes();
  document.querySelectorAll(".nav-link").forEach(button => button.classList.toggle("active", button.dataset.view === currentView));
  document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => { currentView = button.dataset.view; render(); }));
  document.querySelectorAll("[data-add-ticket]").forEach(button => button.addEventListener("click", openDialog));
  document.querySelectorAll("[data-delete-ticket]").forEach(button => button.addEventListener("click", () => { tickets().splice(Number(button.dataset.deleteTicket), 1); save(); render(); }));
  document.querySelectorAll("[data-ticket-pedrea]").forEach(input => input.addEventListener("change", event => {
    tickets()[Number(event.target.dataset.ticketPedrea)].pedrea = event.target.checked;
    save();
    render();
  }));
  document.querySelectorAll("[data-prize]").forEach(input => input.addEventListener("input", event => {
    const key = event.target.dataset.prize;
    if (key === "pedrea") current().pedrea = event.target.value.split(/[\s,;]+/).map(pad).filter(validNumber);
    else if (event.target.dataset.index !== "") current()[key][Number(event.target.dataset.index)] = event.target.value.replace(/\D/g, "").slice(0, 5);
    else current()[key] = pad(event.target.value);
    save();
  }));
}
function openDialog() { el("ticketDialog").showModal(); el("ticketForm").reset(); }
function closeDialog() { el("ticketDialog").close(); }
el("yearSelect").addEventListener("change", event => { selectedYear = Number(event.target.value); save(); render(); });
document.querySelectorAll(".nav-link").forEach(button => button.addEventListener("click", () => { currentView = button.dataset.view; render(); }));
el("addTicketButton").addEventListener("click", openDialog); el("cancelDialog").addEventListener("click", closeDialog); el("closeDialog").addEventListener("click", closeDialog);
el("ticketForm").addEventListener("submit", event => { event.preventDefault(); const form = new FormData(event.target); tickets().push({ number: pad(form.get("number")), origin: String(form.get("origin") || ""), amount: Number(form.get("amount")), commission: Number(form.get("commission") || 0), given: Number(form.get("given") || 0), received: Number(form.get("received") || 0), person: String(form.get("person") || ""), note: String(form.get("note") || ""), pedrea: false }); save(); closeDialog(); currentView = "decimos"; render(); });
el("resetButton").addEventListener("click", () => { data = structuredClone(demoData); selectedYear = 2026; save(); render(); });
el("exportButton").addEventListener("click", () => { const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `mi-navidad-${selectedYear}.json`; link.click(); URL.revokeObjectURL(link.href); });

function showAuthScreen() { el("authScreen").hidden = false; el("appRoot").hidden = true; }
function hideAuthScreen() { el("authScreen").hidden = true; el("appRoot").hidden = false; }
function setAuthError(message) { const box = el("authError"); box.textContent = message || ""; box.hidden = !message; }

async function enterApp(nick) {
  currentNick = nick;
  localStorage.setItem("mi-navidad-user", nick);
  el("userLabel").textContent = nick;
  hideAuthScreen();
  const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (cached) { data = cached; render(); }
  try {
    const remote = await window.LoteriaAuth.loadData(nick);
    data = remote || cached || structuredClone(demoData);
  } catch (error) {
    console.error("No se pudo cargar de Firestore", error);
    data = cached || structuredClone(demoData);
  }
  render();
}

el("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  setAuthError("");
  const form = new FormData(event.target);
  const nick = String(form.get("nick") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  if (!/^[a-z0-9_-]{3,20}$/.test(nick)) { setAuthError("El usuario debe tener 3-20 caracteres (letras, números, - o _)."); return; }
  if (password.length < 4) { setAuthError("La contraseña debe tener al menos 4 caracteres."); return; }
  try {
    await window.LoteriaAuth.ready();
    if (el("newAccountCheck").checked) await window.LoteriaAuth.register(nick, password);
    else await window.LoteriaAuth.login(nick, password);
    await enterApp(nick);
  } catch (error) {
    setAuthError(error.message || "No se pudo iniciar sesión.");
  }
});

el("signOutButton").addEventListener("click", () => {
  currentNick = null;
  localStorage.removeItem("mi-navidad-user");
  showAuthScreen();
});

(async function bootstrapAuth() {
  await window.LoteriaAuth.ready();
  const saved = localStorage.getItem("mi-navidad-user");
  if (saved) await enterApp(saved);
  else showAuthScreen();
})();
