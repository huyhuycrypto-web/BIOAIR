(() => {
const C = window.BIOAIR, T = window.I18N;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp01 = x => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
let L = localStorage.getItem("lang") || "vi";
const S = { style: C.style || "white", pod: C.pods[0].id, step: 1, code: "" };
const t = k => T[L][k] ?? k;
const money = n => n.toLocaleString("vi-VN") + " VNĐ";
const fill = s => s.replace("{price}", money(C.price)).replace("{dep}", money(C.deposit)).replace("{del}", C.delivery[L]);
const podName = id => { const p = C.pods.find(p => p.id === id); return p ? p[L] : id; };
const dlg = $("#rs"), fm = $("#fm"), err = $("#err"), nx = $("#nx"), bkb = $("#bk-btn");

function render() {
  document.documentElement.lang = L; document.body.dataset.style = S.style;
  $$("[data-i18n]").forEach(e => e.textContent = t(e.dataset.i18n));
  $$("[data-price]").forEach(e => e.textContent = money(C[e.dataset.price]));
  $$("[data-delivery]").forEach(e => e.textContent = C.delivery[L]);
  $("#ben").innerHTML = T[L].benefits.map(b => `<li>${b}</li>`).join("");
  $("#how").innerHTML = T[L].how.map(h => `<li>${fill(h)}</li>`).join("");
  $("#faq-list").innerHTML = T[L].faq.map(([q, a]) => `<details><summary>${q}</summary><p>${fill(a)}</p></details>`).join("");
  $("#pods-view").innerHTML = C.pods.map(p => `<button type="button" class="podb${S.pod === p.id ? " on" : ""}" data-v="${p.id}"><img src="${p.img}" alt="" loading="lazy">${p[L]}</button>`).join("");
  $$(".podb").forEach(b => b.onclick = () => { S.pod = b.dataset.v; render(); });
  $("#parts").innerHTML = T[L].parts.map(x => `<li>${x}</li>`).join("");
  $("#specs").innerHTML = C.specs.map(s => `<li>${s[L]}<br><b>${s.v}</b></li>`).join("");
  $("#ct").textContent = `${C.contact.email} · ${C.contact.phone}`;
  $("#stk").textContent = `${t("reserve")} — ${money(C.deposit)}`;
  $("#lang").textContent = L === "vi" ? "VI | en" : "vi | EN";
  $("#mat-p").textContent = t("mat_" + S.style);
  $$("[data-style-set]").forEach(b => b.classList.toggle("on", b.dataset.styleSet === S.style));
  images(); if (dlg.open) step(S.step);
}

/* Gán một hoặc nhiều ảnh (map: {key: src}) vào một khung .stack và bật ảnh khớp activeKey.
   Dùng chung cho: ảnh phòng theo style, ảnh macro theo style, và ảnh Plant Pod đang chọn. */
function stack(el, map, activeKey) {
  if (!el) return;
  if (!el.dataset.built) {
    for (const k in map) {
      const i = new Image(); i.src = map[k]; i.alt = ""; i.dataset.k = k;
      if (!el.hasAttribute("data-eager")) i.loading = "lazy";
      el.append(i);
    }
    el.dataset.built = "1";
  }
  $$("img", el).forEach(i => i.classList.toggle("on", i.dataset.k === activeKey));
}

/* Ảnh: sửa đường dẫn trong data/config.js (images / pods). */
function images() {
  $$("[data-src]").forEach(e => { if (!e.getAttribute("src")) e.src = C.images[e.dataset.src]; });
  $$("[data-stack]").forEach(el => stack(el, C.images[el.dataset.stack], S.style));
  stack($("#pod-preview"), Object.fromEntries(C.pods.map(p => [p.id, p.img])), S.pod);
}

$$("[data-style-set]").forEach(b => b.onclick = () => { S.style = b.dataset.styleSet; render(); });
$("#lang").onclick = () => { L = L === "vi" ? "en" : "vi"; localStorage.setItem("lang", L); render(); };

/* Header + nút cố định trên mobile */
const hd = $("#hd"), stk = $("#stk"); let tick = false;
function headerScroll() {
  hd.classList.toggle("solid", scrollY > 40);
  const buy = $("#buy").getBoundingClientRect();
  stk.classList.toggle("show", scrollY > innerHeight * 1.6 && !(buy.top < innerHeight && buy.bottom > 0) && !dlg.open);
}

/* LOOK CLOSER — 5 giai đoạn theo tiến trình cuộn p (0..1) trong khu vực #look:
   0.00–0.22  toàn cảnh, camera bắt đầu tiến gần (ảnh room phóng to dần)
   0.22–0.38  chuyển mờ dần từ ảnh room sang ảnh macro (vật liệu)
   0.38–0.68  giữ ở macro, có lia nhẹ + một vệt sáng quét qua bề mặt
   0.68–0.85  chuyển mờ dần trở lại ảnh room, camera lùi ra
   0.85–1.00  toàn cảnh, đứng yên */
const lk = $("#look"), lpRoom = $("#lp-room"), lpMacro = $("#lp-macro"), sheen = $("#lp-sheen"), cap = $("#cap");
let ci = -1;
function lookFrame(p) {
  const look = C.images.look[S.style];
  const roomIn = smooth(0, 0.22, p), roomOut = smooth(0.68, 0.95, p);
  const roomOpacity = clamp01(1 - smooth(0.22, 0.36, p) + smooth(0.68, 0.85, p));
  const macroOpacity = clamp01(1 - roomOpacity);
  const roomScale = 1 + (RM ? 0 : (look.peak - 1) * roomIn - (look.peak - 1) * roomOut);
  $$("img", lpRoom).forEach(i => { i.style.opacity = roomOpacity; i.style.transformOrigin = look.o; i.style.transform = `scale(${roomScale})`; });

  const m = smooth(0.30, 0.70, p); // tiến trình riêng bên trong đoạn macro, dùng để lia + quét sáng
  const pan = RM ? 0 : (m - 0.5) * 14;
  const macroScale = RM ? 1 : 1.05 + 0.03 * Math.sin(Math.PI * m);
  $$("img", lpMacro).forEach(i => { i.style.opacity = macroOpacity; i.style.transform = `scale(${macroScale}) translateX(${pan}%)`; });

  const sheenX = -30 + 170 * m;
  const sheenOpacity = RM ? 0 : macroOpacity * clamp01(1 - Math.abs(m - 0.5) * 1.7);
  sheen.style.opacity = sheenOpacity; sheen.style.transform = `translateX(${sheenX}%) rotate(2deg)`;

  let label = "";
  if (macroOpacity > 0.15) label = t(m < 0.36 ? "look1" : m < 0.66 ? "look2" : "look3");
  if (label !== cap.dataset.c) { cap.dataset.c = label; cap.textContent = label; }
}
function lookScroll() {
  const r = lk.getBoundingClientRect();
  if (r.bottom < -200 || r.top > innerHeight + 200) return;
  const p = clamp01(-r.top / (r.height - innerHeight));
  lookFrame(p);
}

addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; headerScroll(); lookScroll(); }); } }, { passive: true });

/* Luồng đặt chỗ */
const orderTotals = () => { const q = +fm.qty.value || 1; return { q, total: C.price * q, dep: C.deposit * q }; };
$$("[data-open]").forEach(b => b.onclick = () => { step(1); dlg.showModal(); });
$("#cl").onclick = () => dlg.close();

function choices(id, items, key) {
  $(id).innerHTML = items.map(([v, n, im]) => `<button type="button" class="choice${S[key] === v ? " on" : ""}" data-v="${v}">${im ? `<img src="${im}" alt="">` : ""}${n}</button>`).join("");
  $$(".choice", $(id)).forEach(b => b.onclick = () => { S[key] = b.dataset.v; render(); });
}
function step(n) {
  S.step = n; err.textContent = "";
  $$("[data-step]").forEach(e => e.classList.toggle("on", +e.dataset.step === n));
  $("#stepof").textContent = n === 5 ? "" : `${t("step_of")} ${n} / 4`;
  $("#st").textContent = n === 5 ? t("done_h") : t("s" + n);
  $$("#dots i").forEach((d, i) => d.classList.toggle("on", i < (n === 5 ? 4 : n)));
  bkb.style.visibility = n === 1 || n === 5 ? "hidden" : "visible";
  nx.textContent = n === 4 ? t("submit") : n === 5 ? t("close") : t("next");
  if (n === 1) choices("#c-style", [["white", t("white")], ["wood", t("wood")]], "style");
  if (n === 2) choices("#c-pod", C.pods.map(p => [p.id, p[L], p.img]), "pod");
  if (n === 4) pay();
}
const row = (k, v) => `<dt>${k}</dt><dd>${v}</dd>`;
function pay() {
  const { q, total, dep } = orderTotals();
  S.code = S.code || "BIO-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  S.content = `${S.code} ${fm.phone.value.replace(/\D/g, "")}`;
  $("#sum").innerHTML = row("BIOAIR ONE", `${t(S.style)} · ${podName(S.pod)} × ${q}`) + row(t("price"), money(total)) + row(t("dep"), money(dep)) + row(t("rem"), money(total - dep));
  $("#bk").innerHTML = row(t("bank"), C.bank.name) + row(t("acct"), C.bank.number) + row(t("holder"), C.bank.holder) + row(t("amount"), money(dep)) + row(t("content"), S.content);
  const qr = $("#qr"); qr.hidden = true; qr.onerror = () => qr.hidden = true; qr.onload = () => qr.hidden = false; qr.src = C.bank.qr;
}
function copy(text, btn) {
  const done = () => { const o = btn.textContent; btn.textContent = t("copied"); setTimeout(() => btn.textContent = o, 1500); };
  (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(done, () => { const a = document.createElement("textarea"); a.value = text; document.body.append(a); a.select(); document.execCommand("copy"); a.remove(); done(); });
}
$("#cp1").onclick = e => copy(C.bank.number, e.target);
$("#cp2").onclick = e => copy(S.content, e.target);
bkb.onclick = () => step(S.step - 1);

function fail(msg, el) { err.textContent = t(msg); if (el) { el.setAttribute("aria-invalid", "true"); el.focus(); } return false; }
function validate3() {
  $$("input,textarea", fm).forEach(i => i.removeAttribute("aria-invalid"));
  for (const k of ["name", "phone"]) if (!fm[k].value.trim()) return fail("e_req", fm[k]);
  if (!/^(\+?84|0)\d{9}$/.test(fm.phone.value.replace(/[\s.-]/g, ""))) return fail("e_phone", fm.phone);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fm.email.value.trim())) return fail("e_mail", fm.email);
  for (const k of ["addr", "city"]) if (!fm[k].value.trim()) return fail("e_req", fm[k]);
  const q = +fm.qty.value; if (!Number.isInteger(q) || q < 1 || q > 10) return fail("e_qty", fm.qty);
  return true;
}
function validate4() {
  const f = fm.proof.files[0];
  if (!f || !/^image\/(jpeg|png)$/.test(f.type) || f.size > 5 * 1024 * 1024) return fail("e_file");
  return true;
}

/* =========================================================================================
   GIỚI HẠN DEMO — ĐỌC TRƯỚC KHI ĐƯA LÊN PRODUCTION THẬT
   - Đơn đặt chỗ hiện CHỈ được lưu vào localStorage của trình duyệt người dùng, KHÔNG được gửi
     lên bất kỳ máy chủ hay cơ sở dữ liệu nào. Tắt trình duyệt / xóa cache sẽ mất dữ liệu.
   - Ảnh biên lai (payment proof) KHÔNG được tải lên đâu cả. Chỉ metadata (tên file, loại,
     dung lượng) được lưu lại để mô phỏng luồng, bản thân tệp ảnh không được lưu trữ.
   - KHÔNG có cổng thanh toán thật, không xác minh giao dịch ngân hàng tự động, không gửi
     email xác nhận. Trạng thái "PAYMENT_REVIEW" chỉ là dữ liệu demo.
   - Trước khi nhận cọc thật: thay hàm submitOrder() bên dưới bằng một lệnh gọi API tới
     backend thật (ví dụ Supabase: insert vào bảng "orders" + upload ảnh vào Storage
     riêng tư, có RLS), thêm xác minh phía server, và thêm trang admin có đăng nhập
     để duyệt/từ chối thanh toán thay vì để dữ liệu chỉ nằm trong localStorage.
   ========================================================================================= */
async function submitOrder(o) {
  const list = JSON.parse(localStorage.getItem("bioair_orders") || "[]"); list.push(o);
  localStorage.setItem("bioair_orders", JSON.stringify(list)); return o;
}

fm.onsubmit = async e => {
  e.preventDefault();
  if (S.step === 5) return dlg.close();
  if (S.step === 3 && !validate3()) return;
  if (S.step < 4) return step(S.step + 1);
  if (!validate4()) return;
  const { q, total, dep } = orderTotals(), f = fm.proof.files[0]; nx.disabled = true;
  const o = { code: S.code, created: new Date().toISOString(), status: "PAYMENT_REVIEW", style: S.style, pod: S.pod, qty: q, total, deposit: dep,
    name: fm.name.value.trim(), phone: fm.phone.value.trim(), email: fm.email.value.trim(), addr: fm.addr.value.trim(), city: fm.city.value.trim(), note: fm.note.value.trim(),
    proof: { name: f.name, type: f.type, size: f.size } /* demo: chỉ lưu metadata, không lưu tệp thật */ };
  await submitOrder(o); nx.disabled = false;
  $("#done").innerHTML = `<h4>${t("done_h")}</h4><p>${t("code")}</p><p class="code">${o.code}</p><dl class="sum">${row("BIOAIR ONE", t(S.style))}${row("Plant Pod", podName(S.pod))}${row(t("dep"), money(dep))}${row(t("deliv"), C.delivery[L])}</dl><p><b>${t("status")}</b></p><p class="small">${t("done_p")}</p>`;
  S.code = ""; step(5);
};

render(); headerScroll(); lookScroll();
})();
