/* recap.js – buduje stronę odcinka z danych ODCINEK. Nie trzeba go edytować. */
(function () {
  const E = ODCINEK, Z = E.zawodnicy;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const name = id => (Z.find(z => z.id === id) || {}).imie || "";
  const pln = n => (n < 0 ? "−" : "") + Math.abs(n).toLocaleString("pl-PL");

  function meta(p) {
    const w = p.kto || 0, m = [];
    if (w) m.push("Poprawnie: " + esc(name(w)));
    else m.push("Nikt nie odpowiedział poprawnie");
    if ((p.zle || []).length) m.push("Błędnie: " + p.zle.map(i => esc(name(i))).join(", "));
    return m.join("<br>");
  }
  function cell(p) {
    return `<td class="clue" data-w="${p.kto || 0}"${p.premia ? ' data-premia="1"' : ""} tabindex="0">` +
      `<div class="val">${esc(p.kwota)}</div><div class="q">${esc(p.pytanie)}</div>` +
      `<div class="a"><span class="ans">${esc(p.odpowiedz)}</span><span class="meta">${meta(p)}</span></div></td>`;
  }
  function scores(w) {
    return `<table class="scores"><tr>${Z.map(z => `<th>${esc(z.imie)}</th>`).join("")}</tr>` +
      `<tr>${w.map(n => `<td class="${n < 0 ? "neg" : ""}">${pln(n)}</td>`).join("")}</tr></table>`;
  }
  function round(r, i) {
    const rows = Math.max(...r.kategorie.map(c => c.pytania.length));
    let h = `<section class="card"><div class="bar">${esc(r.nazwa)}</div><div class="scroll"><table class="board"><tr>` +
      r.kategorie.map(c => `<th class="cat">${esc(c.nazwa)}</th>`).join("") + "</tr>";
    for (let k = 0; k < rows; k++)
      h += "<tr>" + r.kategorie.map(c => c.pytania[k] ? cell(c.pytania[k]) : '<td class="clue"></td>').join("") + "</tr>";
    return h + `</table></div><h3>Wyniki po ${["pierwszej", "drugiej"][i] || ""} rundzie</h3>${scores(r.wyniki)}</section>`;
  }
  function final(F) {
    const rows = F.wyniki.map(w =>
      `<tr><td>${esc(name(w.zawodnik))}</td><td class="${w.poprawnie ? "ok" : "bad"}">${w.poprawnie ? "✔" : "✘"} ${esc(w.odpowiedz)}</td>` +
      `<td>${pln(w.zaklad)}</td><td><b>${pln(w.wynik)}</b></td><td>${esc(w.uwagi)}</td></tr>`).join("");
    return `<section class="card"><div class="bar">Pytanie finałowe Va Banque</div><div class="scroll"><table class="board" style="min-width:0">` +
      `<tr><th class="cat">${esc(F.kategoria)}</th></tr><tr><td class="clue" style="height:auto;min-height:90px" tabindex="0">` +
      `<div class="q">${esc(F.pytanie)}</div><div class="a"><span class="ans">${esc(F.odpowiedz)}</span></div></td></tr></table></div>` +
      `<h3>Wyniki końcowe</h3><table class="scores"><tr><th>Zawodnik</th><th>Odpowiedź</th><th>Zakład</th><th>Wynik końcowy</th><th>Miejsce</th></tr>${rows}</table></section>`;
  }

  document.title = `TeleStats – ${E.program}, odcinek ${E.numer} (${E.data})`;
  document.getElementById("app").innerHTML =
    `<h1>${esc(E.program)} – odcinek ${esc(E.numer)}</h1><div class="sub">Data emisji: ${esc(E.data)} · ${esc(E.typ)}</div>` +
    (E.uwaga ? `<div class="note">${esc(E.uwaga)}</div>` : "") +
    `<section class="card"><div class="bar">Zawodnicy</div><div class="pad">${Z.map(z => `<p><b>${esc(z.imie)}</b>, ${esc(z.opis)}</p>`).join("")}</div></section>` +
    `<div class="tools"><label><input type="checkbox" id="cb-who">Pokaż, kto odpowiedział</label>` +
    `<label><input type="checkbox" id="cb-premia">Pokaż premie</label>` +
    `<div class="legend">${Z.map(z => `<span><i class="sw" style="background:var(--p${z.id})"></i>${esc(z.imie)}</span>`).join("")}` +
    `<span><i class="sw" style="background:var(--p0)"></i>Nikt (pytanie bez odpowiedzi)</span></div></div>` +
    E.rundy.map(round).join("") + final(E.final);

  const body = document.body;
  document.getElementById("cb-who").onchange = e => body.classList.toggle("show-who", e.target.checked);
  document.getElementById("cb-premia").onchange = e => body.classList.toggle("show-premia", e.target.checked);
  // dotyk / klawiatura: kliknięcie pokazuje odpowiedź
  document.addEventListener("click", e => { const c = e.target.closest("td.clue"); if (c) c.classList.toggle("open"); });
  document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.matches("td.clue")) e.target.classList.toggle("open"); });
})();
