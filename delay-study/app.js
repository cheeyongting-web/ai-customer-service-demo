/* ============================================================
   AI Customer Service Delay Study — flow controller
   ============================================================ */
(function () {
  "use strict";

  var app = document.getElementById("app");
  var topProgress = document.getElementById("top-progress");
  var langToggle = document.getElementById("lang-toggle");
  var langToggleLabel = document.getElementById("lang-toggle-label");
  var footerText = document.getElementById("footer-text");

  var state = {
    lang: "zh",
    stage: "welcome",
    participant_id: null,
    delay_group: null,
    delay_ms: null,
    assignSource: "server",
    demographics: {},
    scales: {},
    estWait: "",
    order: null, // shuffled item order
    meta: {
      started_at: Date.now(),
      chat_start_at: null,
      reply_request_at: null,
      decline_shown_at: null,
      survey_start_at: null,
      actual_delay_ms: null,
      user_agent: navigator.userAgent,
    },
  };

  var PROGRESS = { welcome: 8, demo: 28, scenario: 45, chat: 62, survey: 85, thanks: 100 };

  function t() { return I18N[state.lang]; }

  function setProgress(p) { topProgress.style.width = p + "%"; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- Language toggle ---------------- */
  langToggle.addEventListener("click", function () {
    state.lang = state.lang === "zh" ? "en" : "zh";
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
    langToggleLabel.textContent = t().switchTo;
    footerText.textContent = state.lang === "zh" ? "学术研究用途 · 匿名调查" : "For academic research · Anonymous survey";
    rerender();
  });

  function rerender() {
    // Re-render current stage, preserving collected state where possible.
    if (state.stage === "welcome") renderWelcome();
    else if (state.stage === "demo") renderDemographics();
    else if (state.stage === "scenario") renderScenario();
    else if (state.stage === "chat") renderChat(true);
    else if (state.stage === "survey") renderSurvey();
    else if (state.stage === "thanks") renderThanks();
  }

  function mount(html) {
    app.innerHTML = '<div class="stage-in">' + html + "</div>";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function card(inner, extra) {
    return '<div class="bg-white rounded-3xl shadow-card border border-white/60 ' + (extra || "p-6 sm:p-9") + '">' + inner + "</div>";
  }

  function stepBadge(text) {
    return '<div class="inline-flex items-center gap-1.5 text-primary bg-primary-light px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-3">' +
      '<span class="material-symbols-rounded text-[15px]">experiment</span>' + esc(text) + "</div>";
  }

  function primaryBtn(id, label, icon) {
    return '<button id="' + id + '" class="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-7 py-3.5 rounded-2xl shadow-soft hover:shadow-card transition-all active:scale-[.98]">' +
      "<span>" + esc(label) + "</span>" +
      '<span class="material-symbols-rounded text-[20px] group-hover:translate-x-0.5 transition-transform">' + (icon || "arrow_forward") + "</span></button>";
  }

  function errorBox(id) {
    return '<div id="' + id + '" class="hidden mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"><span class="material-symbols-rounded text-[18px]">error</span><span class="msg"></span></div>';
  }

  function showError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.querySelector(".msg").textContent = msg;
    el.classList.remove("hidden");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function hideError(id) { var el = document.getElementById(id); if (el) el.classList.add("hidden"); }

  /* ============================================================
     STAGE 1 — Welcome / consent
     ============================================================ */
  function renderWelcome() {
    state.stage = "welcome"; setProgress(PROGRESS.welcome);
    var s = t();
    var consent = s.consentItems.map(function (c) {
      return '<li class="flex gap-2.5"><span class="material-symbols-rounded text-accent text-[19px] mt-0.5">verified_user</span><span>' + esc(c) + "</span></li>";
    }).join("");

    var html =
      '<div class="text-center mb-7">' +
        '<div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-soft mb-4">' +
          '<span class="material-symbols-rounded text-white text-[34px]">support_agent</span></div>' +
        '<h1 class="text-2xl sm:text-3xl font-bold tracking-tight">' + esc(s.studyTitle) + "</h1>" +
        '<p class="text-ink-soft mt-2">' + esc(s.studySub) + "</p>" +
      "</div>" +
      card(
        '<p class="text-lg font-semibold mb-1.5">' + esc(s.welcomeLead) + "</p>" +
        '<p class="text-ink-soft leading-relaxed mb-6">' + esc(s.welcomeBody) + "</p>" +
        '<div class="rounded-2xl bg-bg-soft border border-slate-100 p-5 mb-6">' +
          '<p class="font-semibold flex items-center gap-2 mb-3"><span class="material-symbols-rounded text-primary text-[20px]">shield_person</span>' + esc(s.consentTitle) + "</p>" +
          '<ul class="space-y-2.5 text-sm text-ink-soft leading-relaxed">' + consent + "</ul>" +
        "</div>" +
        '<label class="flex items-start gap-3 cursor-pointer select-none mb-6 group">' +
          '<input type="checkbox" id="consent-cb" class="peer sr-only" ' + (state._consent ? "checked" : "") + ">" +
          '<span class="mt-0.5 w-6 h-6 rounded-lg border-2 border-slate-300 peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all shrink-0"><span class="material-symbols-rounded text-white text-[18px]">check</span></span>' +
          '<span class="text-sm text-ink leading-relaxed pt-0.5">' + esc(s.consentCheck) + "</span>" +
        "</label>" +
        '<div class="flex items-center justify-between flex-wrap gap-3">' +
          primaryBtn("start-btn", s.startBtn, "play_arrow") +
          '<span class="inline-flex items-center gap-1.5 text-xs text-ink-soft"><span class="material-symbols-rounded text-[16px]">schedule</span>' + esc(s.estTime) + "</span>" +
        "</div>" +
        errorBox("welcome-err")
      );

    mount(html);
    document.getElementById("consent-cb").addEventListener("change", function (e) { state._consent = e.target.checked; });
    document.getElementById("start-btn").addEventListener("click", function () {
      if (!state._consent) { showError("welcome-err", t().needConsent); return; }
      hideError("welcome-err");
      ensureAssigned();
      renderDemographics();
    });
  }

  /* ---------- group assignment ---------- */
  var DELAY_GROUPS = ["0", "1", "2", "3.5", "5", "8"];

  function localAssign() {
    var g = DELAY_GROUPS[Math.floor(Math.random() * DELAY_GROUPS.length)];
    state.participant_id = "LOCAL_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
    state.delay_group = g;
    state.delay_ms = Math.round(parseFloat(g) * 1000);
    state.assignSource = "local_random";
  }

  function ensureAssigned() {
    if (state.participant_id) return;
    if (!endpointReady()) { localAssign(); return; }
    // Apps Script: simple POST (text/plain) avoids CORS preflight; the web app
    // returns the balanced group. Fall back to local random on any failure.
    fetch(CONFIG.DATA_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "assign" }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.delay_group) throw new Error("no group");
        state.participant_id = d.participant_id;
        state.delay_group = d.delay_group;
        state.delay_ms = d.delay_ms != null ? d.delay_ms : Math.round(parseFloat(d.delay_group) * 1000);
        state.assignSource = "server_balanced";
      })
      .catch(function () { localAssign(); });
  }

  /* ============================================================
     STAGE 2 — Demographics
     ============================================================ */
  function renderDemographics() {
    state.stage = "demo"; setProgress(PROGRESS.demo);
    var s = t();
    var blocks = DEMOGRAPHICS.map(function (q, idx) {
      var opts = q.options.map(function (o) {
        var checked = state.demographics[q.id] === o.v;
        return '<label class="demo-opt relative cursor-pointer">' +
          '<input type="radio" name="demo_' + q.id + '" value="' + o.v + '" ' + (checked ? "checked" : "") + ">" +
          '<span class="demo-box block text-center text-sm border-2 border-slate-200 rounded-xl px-3 py-2.5 text-ink-soft">' + esc(o[state.lang]) + "</span>" +
        "</label>";
      }).join("");
      return '<div class="mb-7">' +
        '<p class="font-semibold mb-3"><span class="text-primary mr-1.5">' + (idx + 1) + ".</span>" + esc(q[state.lang]) + "</p>" +
        '<div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">' + opts + "</div>" +
      "</div>";
    }).join("");

    var html =
      stepBadge(s.demoTitle) +
      '<h2 class="text-xl sm:text-2xl font-bold mb-1">' + esc(s.demoTitle) + "</h2>" +
      '<p class="text-ink-soft mb-6">' + esc(s.demoSub) + "</p>" +
      card(blocks + errorBox("demo-err") +
        '<div class="mt-2 flex justify-end">' + primaryBtn("demo-next", s.enterChatBtn ? (state.lang === "zh" ? "下一步" : "Next") : "Next", "arrow_forward") + "</div>");

    mount(html);
    // bind radios
    DEMOGRAPHICS.forEach(function (q) {
      var radios = document.getElementsByName("demo_" + q.id);
      Array.prototype.forEach.call(radios, function (r) {
        r.addEventListener("change", function () { state.demographics[q.id] = r.value; });
      });
    });
    document.getElementById("demo-next").addEventListener("click", function () {
      var done = DEMOGRAPHICS.every(function (q) { return state.demographics[q.id]; });
      if (!done) { showError("demo-err", t().needAllDemo); return; }
      hideError("demo-err");
      renderScenario();
    });
  }

  /* ============================================================
     STAGE 3 — Scenario
     ============================================================ */
  function renderScenario() {
    state.stage = "scenario"; setProgress(PROGRESS.scenario);
    var s = t();
    // bold markdown -> strong
    var body = esc(s.scenarioBody).replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink font-semibold">$1</strong>').replace(/\n/g, "<br/>");
    var html =
      stepBadge(s.scenarioTitle) +
      '<h2 class="text-xl sm:text-2xl font-bold mb-1">' + esc(s.scenarioTitle) + "</h2>" +
      '<p class="text-ink-soft mb-6">' + esc(s.scenarioSub) + "</p>" +
      card(
        '<div class="flex items-start gap-4">' +
          '<div class="hidden sm:flex w-12 h-12 rounded-2xl bg-primary-light items-center justify-center shrink-0"><span class="material-symbols-rounded text-primary text-[26px]">local_shipping</span></div>' +
          '<div class="text-ink-soft leading-[1.9] text-[15px]">' + body + "</div>" +
        "</div>" +
        '<div class="mt-6 flex items-start gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800"><span class="material-symbols-rounded text-[19px]">tips_and_updates</span><span>' + esc(s.scenarioTip) + "</span></div>" +
        '<div class="mt-7 flex justify-end">' + primaryBtn("scenario-next", s.enterChatBtn, "forum") + "</div>"
      );
    mount(html);
    document.getElementById("scenario-next").addEventListener("click", function () { renderChat(false); });
  }

  /* ============================================================
     STAGE 4 — Chat (AI customer service)
     ============================================================ */
  var chatState = { started: false, processing: false, ended: false };

  function renderChat(isRerender) {
    state.stage = "chat"; setProgress(PROGRESS.chat);
    var s = t();
    var html =
      '<div class="w-full max-w-md mx-auto bg-white rounded-3xl shadow-card overflow-hidden flex flex-col" style="height:78vh;max-height:660px;">' +
        '<header class="bg-gradient-to-r from-primary to-primary-dark px-4 py-3.5 flex items-center gap-3 shrink-0">' +
          '<div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><span class="material-symbols-rounded text-white text-[22px]">support_agent</span></div>' +
          "<div><h1 class=\"text-white font-semibold text-[15px]\">" + esc(s.chatHeaderTitle) + "</h1>" +
          '<p class="text-white/70 text-xs">' + esc(s.chatHeaderSub) + "</p></div>" +
          '<div class="ml-auto flex items-center gap-1.5"><span class="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span><span class="text-white/85 text-xs">' + esc(s.chatOnline) + "</span></div>" +
        "</header>" +
        '<div class="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4 bg-bg-soft/60" id="chat-container"></div>' +
        '<div class="px-4 py-3 bg-white border-t border-slate-100" id="button-area"></div>' +
        '<div class="p-4 bg-white border-t border-slate-100 hidden" id="end-area">' +
          '<p class="text-center text-xs text-ink-soft mb-2.5" id="end-hint"></p>' +
          '<button id="end-btn" class="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-2xl font-semibold text-sm hover:shadow-card transition-all flex items-center justify-center gap-2"><span class="material-symbols-rounded text-[20px]">checklist</span><span></span></button>' +
        "</div>" +
      "</div>";
    mount(html);

    // If re-rendering due to language switch mid-chat, restart the chat cleanly.
    chatState = { started: false, processing: false, ended: false };
    // Safety: ensure a condition is assigned before the conversation begins.
    if (state.delay_ms == null) localAssign();
    state.meta.chat_start_at = Date.now();
    setTimeout(startChat, 450);
  }

  function chatEls() {
    return {
      container: document.getElementById("chat-container"),
      buttons: document.getElementById("button-area"),
      endArea: document.getElementById("end-area"),
      endBtn: document.getElementById("end-btn"),
      endHint: document.getElementById("end-hint"),
    };
  }
  function scrollChat() { var c = document.getElementById("chat-container"); if (c) c.scrollTop = c.scrollHeight; }

  function aiMsg(text) {
    var html =
      '<div class="flex items-start gap-2 msg-in">' +
        '<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0"><span class="material-symbols-rounded text-white text-[18px]">support_agent</span></div>' +
        '<div class="flex-1"><div class="bg-white shadow-sm border border-slate-100 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[90%]"><p class="text-ink text-sm leading-relaxed">' + esc(text) + "</p></div>" +
        '<span class="text-slate-400 text-[11px] mt-1 block">' + esc(t().justNow) + "</span></div></div>";
    chatEls().container.insertAdjacentHTML("beforeend", html); scrollChat();
  }
  function userMsg(text) {
    var html =
      '<div class="flex items-start gap-2 msg-in justify-end">' +
        '<div class="flex-1 flex flex-col items-end"><div class="bg-primary text-white rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[90%]"><p class="text-sm leading-relaxed">' + esc(text) + "</p></div>" +
        '<span class="text-slate-400 text-[11px] mt-1 block">' + esc(t().justNow) + "</span></div>" +
        '<div class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0"><span class="material-symbols-rounded text-slate-500 text-[18px]">person</span></div></div>';
    chatEls().container.insertAdjacentHTML("beforeend", html); scrollChat();
  }
  function chatBtn(text, onClick) {
    var b = document.createElement("button");
    b.className = "w-full bg-white border border-primary/30 text-primary text-sm px-4 py-3 rounded-2xl hover:bg-primary-light transition-colors flex items-center justify-center gap-2 shadow-sm mb-2 last:mb-0";
    b.innerHTML = '<span class="material-symbols-rounded text-[18px]">bolt</span><span>' + esc(text) + "</span>";
    b.addEventListener("click", onClick);
    return b;
  }
  function clearBtns() { chatEls().buttons.innerHTML = ""; }

  function addLoading(delayMs) {
    var s = t();
    var html =
      '<div class="flex items-start gap-2" id="loading-indicator">' +
        '<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0"><span class="material-symbols-rounded text-white text-[18px]">support_agent</span></div>' +
        '<div class="flex-1"><div class="bg-white shadow-sm border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[90%]">' +
          '<div class="w-full bg-slate-200 rounded-full h-1.5 mb-3 overflow-hidden"><div class="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full progress-bar relative" style="--delay-time:' + delayMs + 'ms;"><div class="absolute inset-0 shimmer-bg"></div></div></div>' +
          '<div class="flex items-center gap-2"><div class="flex gap-1"><span class="w-1.5 h-1.5 bg-primary rounded-full pulse-dot"></span><span class="w-1.5 h-1.5 bg-primary rounded-full pulse-dot"></span><span class="w-1.5 h-1.5 bg-primary rounded-full pulse-dot"></span></div>' +
          '<span class="text-ink-soft text-xs" id="loading-text">' + esc(s.loadingText) + "</span></div>" +
        "</div></div></div>";
    chatEls().container.insertAdjacentHTML("beforeend", html); scrollChat();
    // rotate step texts across the delay
    var steps = s.loadingSteps;
    var el = document.getElementById("loading-text");
    var i = 0;
    var interval = Math.max(600, Math.floor(delayMs / steps.length));
    var timer = setInterval(function () {
      i++;
      if (i < steps.length && el && document.getElementById("loading-indicator")) { el.textContent = steps[i]; }
      else clearInterval(timer);
    }, interval);
  }
  function removeLoading() { var l = document.getElementById("loading-indicator"); if (l) l.remove(); }

  function startChat() {
    if (chatState.started) return; chatState.started = true;
    aiMsg(t().chatGreeting);
    clearBtns();
    chatEls().buttons.appendChild(chatBtn(t().chatBtnApply, onApply));
  }

  function onApply() {
    if (chatState.processing) return; chatState.processing = true;
    userMsg(t().chatBtnApply); clearBtns();
    setTimeout(function () {
      aiMsg(t().chatAskReason);
      var s = t();
      [s.reason1, s.reason2, s.reason3].forEach(function (r) {
        chatEls().buttons.appendChild(chatBtn(r, function () { onReason(r); }));
      });
      chatState.processing = false;
    }, 350);
  }

  function onReason(reasonText) {
    if (chatState.processing) return; chatState.processing = true;
    userMsg(reasonText); clearBtns();
    state.scales._chat_reason = reasonText; // record selected reason
    state.meta.reply_request_at = Date.now();
    var delay = state.delay_ms != null ? state.delay_ms : 3000;

    setTimeout(function () {
      if (delay <= 0) {
        finishChat();
      } else {
        addLoading(delay);
        setTimeout(function () { removeLoading(); finishChat(); }, delay);
      }
    }, 300);
  }

  function finishChat() {
    aiMsg(t().chatDecline);
    state.meta.decline_shown_at = Date.now();
    state.meta.actual_delay_ms = state.meta.reply_request_at ? (state.meta.decline_shown_at - state.meta.reply_request_at) : null;
    chatState.ended = true; chatState.processing = false;
    var els = chatEls();
    els.buttons.classList.add("hidden");
    els.endArea.classList.remove("hidden");
    els.endHint.textContent = t().chatEndHint;
    els.endBtn.querySelector("span:last-child").textContent = t().endChatBtn;
    els.endBtn.onclick = function () { renderSurvey(); };
  }

  /* ============================================================
     STAGE 5 — Survey (7-point Likert)
     ============================================================ */
  function getOrder() {
    if (state.order) return state.order;
    // shuffle a copy of indices; keeps construct mixing, reduces order effects
    var idx = SCALE_ITEMS.map(function (_, i) { return i; });
    for (var i = idx.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
    }
    state.order = idx;
    return idx;
  }

  function renderSurvey() {
    state.stage = "survey"; setProgress(PROGRESS.survey);
    if (state.meta.survey_start_at == null) state.meta.survey_start_at = Date.now();
    var s = t();
    var order = getOrder();

    var itemsHtml = order.map(function (oi, n) {
      var item = SCALE_ITEMS[oi];
      var dots = "";
      for (var v = 1; v <= 7; v++) {
        var checked = state.scales[item.id] === v;
        dots += '<label class="likert-opt flex flex-col items-center cursor-pointer">' +
          '<input type="radio" name="sc_' + item.id + '" value="' + v + '" ' + (checked ? "checked" : "") + ">" +
          '<span class="likert-dot">' + v + "</span></label>";
      }
      return '<div class="py-5 px-1 sm:px-2 border-b border-slate-100 last:border-0" data-item="' + item.id + '">' +
        '<p class="text-[15px] font-medium mb-4 leading-relaxed"><span class="text-primary mr-1.5">' + (n + 1) + ".</span>" + esc(item[state.lang]) + "</p>" +
        '<div class="flex items-center justify-between gap-1 sm:gap-2 max-w-md mx-auto">' + dots + "</div>" +
        '<div class="flex justify-between max-w-md mx-auto mt-2 text-[11px] text-ink-soft"><span>' + esc(s.likert[0]) + "</span><span>" + esc(s.likert[6]) + "</span></div>" +
      "</div>";
    }).join("");

    // estimated wait — extra manipulation check (numeric)
    var estBlock =
      '<div class="py-5 px-1 sm:px-2">' +
        '<p class="text-[15px] font-medium mb-3 leading-relaxed"><span class="material-symbols-rounded text-primary text-[19px] align-middle mr-1">timer</span>' + esc(s.estWaitLabel) + "</p>" +
        '<input type="number" min="0" step="0.5" id="est-wait" value="' + esc(state.estWait) + '" placeholder="' + esc(s.estWaitPlaceholder) + '" class="w-full sm:w-64 border-2 border-slate-200 focus:border-primary rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" />' +
      "</div>";

    var html =
      stepBadge(s.surveyTitle) +
      '<h2 class="text-xl sm:text-2xl font-bold mb-1">' + esc(s.surveyTitle) + "</h2>" +
      '<p class="text-ink-soft mb-2">' + esc(s.surveySub) + "</p>" +
      '<div class="inline-flex items-center gap-1.5 text-xs text-primary bg-primary-light px-3 py-1.5 rounded-full mb-5"><span class="material-symbols-rounded text-[15px]">info</span>' + esc(s.scaleHint) + "</div>" +
      card('<div class="divide-y-0">' + itemsHtml + '<div class="border-t border-slate-100"></div>' + estBlock + "</div>") +
      errorBox("survey-err") +
      '<div class="mt-6 flex justify-end">' +
        '<button id="submit-btn" class="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-semibold px-8 py-3.5 rounded-2xl shadow-soft hover:shadow-card transition-all active:scale-[.98]"><span id="submit-label">' + esc(s.submitBtn) + '</span><span class="material-symbols-rounded text-[20px]">send</span></button>' +
      "</div>";

    mount(html);

    SCALE_ITEMS.forEach(function (item) {
      var radios = document.getElementsByName("sc_" + item.id);
      Array.prototype.forEach.call(radios, function (r) {
        r.addEventListener("change", function () { state.scales[item.id] = parseInt(r.value, 10); });
      });
    });
    var est = document.getElementById("est-wait");
    est.addEventListener("input", function () { state.estWait = est.value; });

    document.getElementById("submit-btn").addEventListener("click", onSubmit);
  }

  function onSubmit() {
    var missing = SCALE_ITEMS.filter(function (item) { return typeof state.scales[item.id] !== "number"; });
    if (missing.length > 0) {
      showError("survey-err", t().needAllScales);
      var first = document.querySelector('[data-item="' + missing[0].id + '"]');
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    hideError("survey-err");

    var btn = document.getElementById("submit-btn");
    var label = document.getElementById("submit-label");
    btn.disabled = true; btn.classList.add("opacity-70", "cursor-wait");
    label.textContent = t().submitting;

    // attach attention-check pass flag + estimated wait to scales payload
    var payloadScales = Object.assign({}, state.scales);
    payloadScales.est_wait_seconds = state.estWait;
    SCALE_ITEMS.forEach(function (item) {
      if (item.isAttention) {
        payloadScales[item.id + "_pass"] = state.scales[item.id] === item.answer ? 1 : 0;
      }
    });

    var body = {
      action: "submit",
      participant_id: state.participant_id,
      delay_group: state.delay_group,
      lang: state.lang,
      demographics: state.demographics,
      scales: payloadScales,
      meta: Object.assign({}, state.meta, {
        submitted_at_client: Date.now(),
        total_duration_ms: Date.now() - state.meta.started_at,
        assign_source: state.assignSource,
        item_order: state.order ? state.order.map(function (i) { return SCALE_ITEMS[i].id; }) : null,
      }),
    };

    // Always keep a local backup so no response is ever lost.
    backupLocally(body);

    if (!endpointReady()) {
      // No endpoint configured yet: complete the flow using local backup only.
      renderThanks();
      return;
    }

    fetch(CONFIG.DATA_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    })
      .then(function (r) { if (!r.ok) throw new Error("bad status"); return r.text(); })
      .then(function () { renderThanks(); })
      .catch(function () {
        btn.disabled = false; btn.classList.remove("opacity-70", "cursor-wait");
        label.textContent = t().submitBtn;
        showError("survey-err", t().submitError);
      });
  }

  function backupLocally(body) {
    try {
      var key = "delay_study_backup";
      var arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.push(body);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { /* storage may be unavailable; ignore */ }
  }

  /* ============================================================
     STAGE 6 — Thanks
     ============================================================ */
  function renderThanks() {
    state.stage = "thanks"; setProgress(PROGRESS.thanks);
    var s = t();
    var html =
      '<div class="text-center py-6">' +
        '<div class="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-card mb-6"><span class="material-symbols-rounded text-white text-[44px]">celebration</span></div>' +
        '<h1 class="text-2xl sm:text-3xl font-bold mb-3">' + esc(s.thanksTitle) + "</h1>" +
        '<p class="text-ink-soft leading-relaxed max-w-md mx-auto mb-7">' + esc(s.thanksBody) + "</p>" +
        card(
          '<div class="flex items-center justify-center gap-3 text-sm"><span class="text-ink-soft">' + esc(s.thanksGroup) + '</span><span class="font-mono font-semibold text-primary bg-primary-light px-3 py-1 rounded-lg">' + esc(state.participant_id || "-") + "</span></div>",
          "p-5"
        ) +
        '<p class="text-xs text-ink-soft mt-6">' + esc(s.closeHint) + "</p>" +
      "</div>";
    mount(html);
  }

  /* ---------------- boot ---------------- */
  document.documentElement.lang = "zh-CN";
  langToggleLabel.textContent = t().switchTo;
  renderWelcome();
})();
