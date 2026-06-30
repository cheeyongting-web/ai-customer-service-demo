/* ============================================================
   Experiment 1 — Flow controller
   2×2 between-subjects: response_speed × service_outcome
   ============================================================ */
(function () {
  "use strict";

  var DATA = window.EXP1_DATA;
  var app = document.getElementById("app");
  var topProgress = document.getElementById("top-progress");

  /* ---------- State ---------- */
  var state = {
    stage: "consent", // consent | scenario | chat | survey | thanks | terminated
    moduleIndex: 0,
    participant_id: uuid(),
    started_at: new Date().toISOString(),
    condition: null, // {cell, speed_cond, outcome_cond, delay_ms, reply}
    answers: {}, // key -> value (number for likert, string for single, array for multi)
    submitting: false,
    submitted: false,
    submit_error: null
  };

  /* ---------- Progress mapping ---------- */
  // Total: consent (5) -> scenario (12) -> chat (20) -> 7 modules to 95 -> thanks 100
  function setProgress(p) {
    topProgress.style.width = Math.max(0, Math.min(100, p)) + "%";
  }
  function moduleProgress() {
    var totalModules = DATA.MODULES.length;
    var base = 20;
    var span = 75; // 20 -> 95
    var per = span / totalModules;
    return base + per * (state.moduleIndex + 1);
  }

  /* ---------- Utils ---------- */
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pickCondition() {
    var keys = ["A", "B", "C", "D"];
    var k = keys[Math.floor(Math.random() * keys.length)];
    return DATA.CONDITIONS[k];
  }
  function mount(html) {
    app.innerHTML = '<div class="stage-in">' + html + "</div>";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function card(inner, padding) {
    return (
      '<div class="bg-white rounded-3xl shadow-card border border-white/60 ' +
      (padding || "p-6 sm:p-9") +
      '">' +
      inner +
      "</div>"
    );
  }
  function stepBadge(text) {
    return (
      '<div class="inline-flex items-center gap-1.5 text-primary bg-primary-light px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-3">' +
      '<span class="material-symbols-rounded text-[15px]">experiment</span>' +
      esc(text) +
      "</div>"
    );
  }
  function primaryBtn(id, label, icon, disabled) {
    return (
      '<button id="' +
      id +
      '" ' +
      (disabled ? "disabled" : "") +
      ' class="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-7 py-3.5 rounded-2xl shadow-soft hover:shadow-card transition-all active:scale-[.98]">' +
      "<span>" +
      esc(label) +
      "</span>" +
      '<span class="material-symbols-rounded text-[20px] group-hover:translate-x-0.5 transition-transform">' +
      (icon || "arrow_forward") +
      "</span></button>"
    );
  }
  function ghostBtn(id, label, icon) {
    return (
      '<button id="' +
      id +
      '" class="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-ink hover:border-primary hover:text-primary font-semibold px-6 py-3 rounded-2xl transition-all active:scale-[.98]">' +
      '<span class="material-symbols-rounded text-[18px]">' +
      (icon || "arrow_back") +
      "</span>" +
      "<span>" +
      esc(label) +
      "</span>" +
      "</button>"
    );
  }
  function errorBox(id) {
    return (
      '<div id="' +
      id +
      '" class="hidden mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"><span class="material-symbols-rounded text-[18px]">error</span><span class="msg"></span></div>'
    );
  }
  function showError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.querySelector(".msg").textContent = msg;
    el.classList.remove("hidden");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function hideError(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  }

  /* ============================================================
     STAGE 1 — Consent
     ============================================================ */
  function renderConsent() {
    state.stage = "consent";
    setProgress(5);
    var html =
      card(
        stepBadge("参与须知") +
          '<h1 class="text-2xl sm:text-[26px] font-bold tracking-tight mb-3">参与本研究</h1>' +
          '<p class="text-ink-soft leading-relaxed mb-3">感谢您参与本次研究！</p>' +
          '<p class="text-ink-soft leading-relaxed mb-3">参与本研究<strong class="text-ink">完全自愿</strong>，您的回答将被<strong class="text-ink">匿名处理</strong>，仅用于学术研究目的。</p>' +
          '<p class="text-ink-soft leading-relaxed mb-6">研究过程约需 <strong class="text-ink">5-8 分钟</strong>，您可以随时退出。</p>' +
          '<div class="space-y-3">' +
          consentOption("agree", "✅", "我已阅读以上说明，自愿参与本研究（继续）") +
          consentOption("decline", "❌", "我不愿意参与（结束）") +
          "</div>" +
          errorBox("consent-err")
      );
    mount(html);

    // Auto-advance on selection: no extra confirm click needed
    var consentInputs = document.querySelectorAll('input[name="consent"]');
    consentInputs.forEach(function (inp) {
      inp.addEventListener("change", function () {
        hideError("consent-err");
        // Small delay so user can see the selected state briefly
        setTimeout(function () {
          if (inp.value === "decline") {
            state.stage = "terminated";
            renderTerminated();
          } else {
            renderScenario();
          }
        }, 220);
      });
    });
  }

  function consentOption(value, emoji, label) {
    return (
      '<label class="choice-opt block cursor-pointer">' +
      '<input type="radio" name="consent" value="' +
      value +
      '" />' +
      '<div class="choice-box flex items-start gap-3 border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-white">' +
      '<span class="text-xl leading-none mt-0.5">' +
      emoji +
      "</span>" +
      '<span class="text-[15px]">' +
      esc(label) +
      "</span>" +
      "</div>" +
      "</label>"
    );
  }

  /* ============================================================
     STAGE 2 — Scenario
     ============================================================ */
  function renderScenario() {
    state.stage = "scenario";
    setProgress(12);
    var html = card(
      stepBadge("情境背景") +
        '<h2 class="text-2xl font-bold mb-4">请阅读以下情境</h2>' +
        '<div class="space-y-4 text-ink leading-relaxed text-[15px] mb-6">' +
        '<p>请您想象以下情境：</p>' +
        '<p class="bg-primary-light/60 border border-primary/10 rounded-2xl px-5 py-4">您最近购买了一件外套，收到后发现颜色与网页展示不符。您决定联系该电商平台的 AI 客服，<strong>申请退款</strong>。</p>' +
        '<p class="text-ink-soft">请认真阅读以下您与 AI 客服的对话。</p>' +
        "</div>" +
        '<div class="flex">' +
        primaryBtn("scenario-next", "开始对话", "chat") +
        "</div>"
    );
    mount(html);
    document.getElementById("scenario-next").addEventListener("click", renderChat);
  }

  /* ============================================================
     STAGE 3 — Chat (randomly assigned condition)
     ============================================================ */
  function renderChat() {
    state.stage = "chat";
    setProgress(20);
    if (!state.condition) state.condition = pickCondition();

    var html = card(
      stepBadge("AI 客服对话") +
        '<h2 class="text-2xl font-bold mb-1">与 AI 客服交流中</h2>' +
        '<p class="text-ink-soft text-sm mb-5">请先点击下方您想发送的消息，再查看 AI 客服的回复。结束后将出现"继续"按钮。</p>' +
        '<div id="chat-area" class="space-y-4 min-h-[260px] bg-bg-soft/70 rounded-2xl p-4 sm:p-5"></div>' +
        '<div id="chat-compose" class="mt-4"></div>' +
        '<div id="chat-cta" class="mt-6 flex justify-end opacity-0 pointer-events-none transition-opacity duration-300">' +
        primaryBtn("chat-next", "继续填写问卷", "arrow_forward") +
        "</div>"
    );
    mount(html);

    var chatArea = document.getElementById("chat-area");
    var composeArea = document.getElementById("chat-compose");
    var ctaWrap = document.getElementById("chat-cta");

    // Step 1: render the user message as a clickable "send" bubble in the compose area.
    composeArea.innerHTML = pendingUserBubble(DATA.USER_MESSAGE);
    var sendBtn = document.getElementById("send-user-msg");

    sendBtn.addEventListener("click", function () {
      // Prevent double click
      sendBtn.disabled = true;
      // Remove the compose-area pending bubble and add the actual user bubble to chat.
      composeArea.innerHTML = "";
      chatArea.appendChild(userBubble(DATA.USER_MESSAGE));
      scrollChat();

      // Step 2: typing indicator (immediate condition shows briefly; delay condition waits 3500ms)
      setTimeout(function () {
        var typing = typingIndicator();
        chatArea.appendChild(typing);
        scrollChat();

        var waitMs = state.condition.delay_ms === 0 ? 250 : state.condition.delay_ms;

        setTimeout(function () {
          typing.remove();
          chatArea.appendChild(aiBubble(state.condition.reply));
          scrollChat();

          // Reveal continue
          setTimeout(function () {
            ctaWrap.classList.remove("opacity-0", "pointer-events-none");
            ctaWrap.classList.add("opacity-100");
            document.getElementById("chat-next").addEventListener("click", function () {
              state.moduleIndex = 0;
              renderSurvey();
            });
          }, 450);
        }, waitMs);
      }, 350);
    });

    function scrollChat() {
      chatArea.scrollTop = chatArea.scrollHeight;
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }

  function pendingUserBubble(text) {
    // A clickable bubble shown right-aligned, looking like a message draft the user can send.
    return (
      '<div class="flex flex-col items-end gap-1.5">' +
      '<button id="send-user-msg" type="button" ' +
      'class="group max-w-[85%] text-left chat-bubble-user px-4 py-2.5 text-[15px] leading-relaxed cursor-pointer ' +
      'hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all ' +
      'shadow-soft hover:shadow-card disabled:opacity-60 disabled:cursor-not-allowed">' +
      '<span class="block">' + esc(text) + '</span>' +
      '<span class="mt-1.5 inline-flex items-center gap-1 text-[12px] opacity-90">' +
      '<span class="material-symbols-rounded text-[14px] group-hover:translate-x-0.5 transition-transform">send</span>' +
      '<span>点击发送</span>' +
      '</span>' +
      '</button>' +
      '<span class="text-[11px] text-ink-soft pr-1">请点击上方气泡发送消息给 AI 客服</span>' +
      '</div>'
    );
  }

  function userBubble(text) {
    var wrap = document.createElement("div");
    wrap.className = "flex justify-end msg-in";
    wrap.innerHTML =
      '<div class="chat-bubble-user max-w-[78%] px-4 py-2.5 text-[15px] leading-relaxed">' +
      esc(text) +
      "</div>";
    return wrap;
  }
  function aiBubble(text) {
    var wrap = document.createElement("div");
    wrap.className = "flex items-start gap-2 msg-in";
    wrap.innerHTML =
      '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shrink-0">' +
      '<span class="material-symbols-rounded text-[18px]">smart_toy</span>' +
      "</div>" +
      '<div class="chat-bubble-ai max-w-[78%] px-4 py-2.5 text-[15px] leading-relaxed">' +
      esc(text) +
      "</div>";
    return wrap;
  }
  function typingIndicator() {
    var wrap = document.createElement("div");
    wrap.className = "flex items-start gap-2 msg-in";
    wrap.innerHTML =
      '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shrink-0">' +
      '<span class="material-symbols-rounded text-[18px]">smart_toy</span>' +
      "</div>" +
      '<div class="chat-bubble-ai px-4 py-3 flex items-center gap-3 text-sm text-ink-soft">' +
      '<span>AI 正在输入</span>' +
      '<span class="flex items-center gap-1">' +
      '<span class="pulse-dot w-1.5 h-1.5 bg-primary rounded-full"></span>' +
      '<span class="pulse-dot w-1.5 h-1.5 bg-primary rounded-full"></span>' +
      '<span class="pulse-dot w-1.5 h-1.5 bg-primary rounded-full"></span>' +
      "</span>" +
      "</div>";
    return wrap;
  }

  /* ============================================================
     STAGE 4 — Survey (module-by-module)
     ============================================================ */
  function renderSurvey() {
    state.stage = "survey";
    var mod = DATA.MODULES[state.moduleIndex];
    setProgress(moduleProgress());

    var itemsHtml = mod.items
      .map(function (it) {
        if (it.type === "likert7") return likertBlock(it);
        if (it.type === "single") return singleBlock(it);
        if (it.type === "multi") return multiBlock(it);
        return "";
      })
      .join("");

    var isLast = state.moduleIndex === DATA.MODULES.length - 1;
    var nextLabel = isLast ? "提交问卷" : "下一部分";
    var nextIcon = isLast ? "send" : "arrow_forward";

    var html = card(
      (mod.hint
        ? '<p class="text-ink-soft text-[14px] leading-relaxed mb-5">' +
          esc(mod.hint) +
          "</p>"
        : "") +
        '<div class="space-y-6">' +
        itemsHtml +
        "</div>" +
        errorBox("survey-err") +
        '<div class="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">' +
        (state.moduleIndex > 0 ? ghostBtn("survey-back", "上一部分", "arrow_back") : "<span></span>") +
        primaryBtn("survey-next", nextLabel, nextIcon) +
        "</div>"
    );
    mount(html);

    // Restore existing answers if any (in case user navigated back)
    mod.items.forEach(function (it) {
      var v = state.answers[it.key];
      if (v == null) return;
      if (it.type === "likert7" || it.type === "single") {
        var inp = document.querySelector(
          'input[name="' + it.key + '"][value="' + cssEscape(v) + '"]'
        );
        if (inp) inp.checked = true;
      } else if (it.type === "multi" && Array.isArray(v)) {
        v.forEach(function (val) {
          var inp = document.querySelector(
            'input[name="' + it.key + '"][value="' + cssEscape(val) + '"]'
          );
          if (inp) inp.checked = true;
        });
      }
    });

    // Multi-select cap enforcement
    mod.items.forEach(function (it) {
      if (it.type !== "multi") return;
      var inputs = document.querySelectorAll('input[name="' + it.key + '"]');
      inputs.forEach(function (inp) {
        inp.addEventListener("change", function () {
          enforceMultiCap(it.key, it.maxSelect || 99);
        });
      });
    });

    if (state.moduleIndex > 0) {
      document.getElementById("survey-back").addEventListener("click", function () {
        collectModuleAnswers(mod, /*silent*/ true);
        state.moduleIndex -= 1;
        renderSurvey();
      });
    }
    document.getElementById("survey-next").addEventListener("click", function () {
      var ok = collectModuleAnswers(mod, false);
      if (!ok) return;
      if (isLast) {
        submitAndFinish();
      } else {
        state.moduleIndex += 1;
        renderSurvey();
      }
    });
  }

  function cssEscape(s) {
    return String(s).replace(/(["\\])/g, "\\$1");
  }

  function enforceMultiCap(name, max) {
    var inputs = document.querySelectorAll('input[name="' + name + '"]');
    var checked = Array.prototype.filter.call(inputs, function (i) {
      return i.checked;
    }).length;
    inputs.forEach(function (i) {
      var lbl = i.closest(".choice-opt");
      if (!i.checked && checked >= max) {
        i.disabled = true;
        if (lbl) lbl.classList.add("disabled");
      } else {
        i.disabled = false;
        if (lbl) lbl.classList.remove("disabled");
      }
    });
  }

  function likertBlock(item) {
    var dots = "";
    for (var v = 1; v <= 7; v++) {
      dots +=
        '<label class="likert-opt cursor-pointer flex flex-col items-center gap-1">' +
        '<input type="radio" name="' +
        item.key +
        '" value="' +
        v +
        '" />' +
        '<span class="likert-dot">' +
        v +
        "</span>" +
        "</label>";
    }
    return (
      '<div class="border border-slate-100 rounded-2xl p-4 sm:p-5 bg-white/70">' +
      '<p class="text-[15px] leading-relaxed mb-4 font-medium">' +
      '<span class="text-primary mr-1.5">' +
      esc(item.key) +
      ".</span>" +
      esc(item.text) +
      "</p>" +
      '<div class="flex items-center justify-between gap-1 sm:gap-2">' +
      dots +
      "</div>" +
      '<div class="flex justify-between text-[11px] text-ink-soft mt-2 px-0.5">' +
      '<span>非常不同意</span><span class="hidden sm:inline">中立</span><span>非常同意</span>' +
      "</div>" +
      "</div>"
    );
  }

  function singleBlock(item) {
    var opts = item.options
      .map(function (opt) {
        return (
          '<label class="choice-opt block cursor-pointer">' +
          '<input type="radio" name="' +
          item.key +
          '" value="' +
          esc(opt) +
          '" />' +
          '<div class="choice-box border-2 border-slate-200 rounded-xl px-4 py-3 text-[15px] bg-white">' +
          esc(opt) +
          "</div>" +
          "</label>"
        );
      })
      .join("");
    return (
      '<div class="border border-slate-100 rounded-2xl p-4 sm:p-5 bg-white/70">' +
      '<p class="text-[15px] leading-relaxed mb-4 font-medium">' +
      '<span class="text-primary mr-1.5">' +
      esc(item.key) +
      ".</span>" +
      esc(item.text) +
      "</p>" +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">' +
      opts +
      "</div>" +
      "</div>"
    );
  }

  function multiBlock(item) {
    var opts = item.options
      .map(function (opt) {
        return (
          '<label class="choice-opt block cursor-pointer">' +
          '<input type="checkbox" name="' +
          item.key +
          '" value="' +
          esc(opt) +
          '" />' +
          '<div class="choice-box border-2 border-slate-200 rounded-xl px-4 py-3 text-[15px] bg-white">' +
          esc(opt) +
          "</div>" +
          "</label>"
        );
      })
      .join("");
    return (
      '<div class="border border-slate-100 rounded-2xl p-4 sm:p-5 bg-white/70">' +
      '<p class="text-[15px] leading-relaxed mb-1 font-medium">' +
      '<span class="text-primary mr-1.5">' +
      esc(item.key) +
      ".</span>" +
      esc(item.text) +
      "</p>" +
      '<p class="text-xs text-ink-soft mb-3">最多选 ' +
      (item.maxSelect || 99) +
      " 项</p>" +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">' +
      opts +
      "</div>" +
      "</div>"
    );
  }

  function collectModuleAnswers(mod, silent) {
    var firstMissing = null;
    mod.items.forEach(function (it) {
      if (it.type === "likert7") {
        var sel = document.querySelector('input[name="' + it.key + '"]:checked');
        if (sel) state.answers[it.key] = parseInt(sel.value, 10);
        else firstMissing = firstMissing || it.key;
      } else if (it.type === "single") {
        var s = document.querySelector('input[name="' + it.key + '"]:checked');
        if (s) state.answers[it.key] = s.value;
        else firstMissing = firstMissing || it.key;
      } else if (it.type === "multi") {
        var checked = Array.prototype.map.call(
          document.querySelectorAll('input[name="' + it.key + '"]:checked'),
          function (i) {
            return i.value;
          }
        );
        if (checked.length === 0) {
          firstMissing = firstMissing || it.key;
        } else {
          state.answers[it.key] = checked;
        }
      }
    });
    if (firstMissing && !silent) {
      showError("survey-err", "请回答所有题目（缺：" + firstMissing + "）。");
      var el = document.querySelector('input[name="' + firstMissing + '"]');
      if (el && el.closest) {
        var wrap = el.closest(".border");
        if (wrap) wrap.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    hideError("survey-err");
    return true;
  }

  /* ============================================================
     STAGE 5 — Submit + thanks
     ============================================================ */
  function buildSubmission() {
    var a = state.answers;
    var cond = state.condition;

    // Manipulation check pass flag
    var correctOutcome =
      cond.outcome_cond === "reject"
        ? "拒绝/暂不受理我的申请"
        : "同意受理我的申请";
    var mc_result_pass = a.MC_result === correctOutcome ? 1 : 0;

    return {
      participant_id: state.participant_id,
      timestamp: new Date().toISOString(),
      speed_cond: cond.speed_cond,
      outcome_cond: cond.outcome_cond,
      cell: cond.cell,

      SA1: a.SA1, SA2: a.SA2, SA3: a.SA3, SA4: a.SA4,
      PE3: a.PE3,
      DA2: a.DA2,
      PJ3: a.PJ3,
      MC1: a.MC1,
      MC_result: a.MC_result,
      mc_result_pass: mc_result_pass,

      EDU: a.EDU,
      EXP1: a.EXP1, EXP2: a.EXP2,
      TRUST1: a.TRUST1, TRUST2: a.TRUST2, TRUST3: a.TRUST3,
      DEM1: a.DEM1, DEM2: a.DEM2, DEM3: a.DEM3
    };
  }

  function submitAndFinish() {
    if (state.submitting) return;
    state.submitting = true;
    var payload = buildSubmission();

    // Render submitting screen
    setProgress(98);
    mount(
      card(
        '<div class="flex flex-col items-center text-center py-6">' +
          '<div class="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mb-4">' +
          '<span class="material-symbols-rounded text-primary text-[28px] animate-pulse">cloud_upload</span>' +
          "</div>" +
          '<h2 class="text-xl font-bold mb-2">正在提交您的回答…</h2>' +
          '<p class="text-ink-soft text-sm">请稍候，不要关闭页面。</p>' +
          "</div>"
      )
    );

    submitToAirtable(payload)
      .then(function () {
        state.submitted = true;
        renderThanks(null);
      })
      .catch(function (err) {
        console.error("[Airtable submit failed]", err);
        state.submit_error = err && err.message ? err.message : String(err);
        // Still store locally so data is not lost
        try {
          var key = "exp1_offline_" + state.participant_id;
          localStorage.setItem(key, JSON.stringify(payload));
        } catch (e) {}
        renderThanks(state.submit_error);
      })
      .finally(function () {
        state.submitting = false;
      });
  }

  function submitToAirtable(fields) {
    var url =
      "https://api.airtable.com/v0/" +
      DATA.AIRTABLE.baseId +
      "/" +
      DATA.AIRTABLE.tableId;
    var apiKey = DATA.AIRTABLE.apiKey;

    // Filter out undefined values
    var clean = {};
    Object.keys(fields).forEach(function (k) {
      if (fields[k] !== undefined && fields[k] !== null && fields[k] !== "") {
        clean[k] = fields[k];
      }
    });

    if (!apiKey || apiKey === "YOUR_AIRTABLE_API_KEY") {
      console.warn(
        "[Experiment1] Airtable API key not configured — payload printed only.",
        clean
      );
      // Treat as success to allow flow validation when key is missing
      return Promise.resolve({ ok: true, simulated: true });
    }

    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: clean, typecast: true })
    }).then(function (resp) {
      if (!resp.ok) {
        return resp.text().then(function (t) {
          throw new Error("Airtable " + resp.status + ": " + t);
        });
      }
      return resp.json();
    });
  }

  function renderThanks(errMsg) {
    state.stage = "thanks";
    setProgress(100);
    var body =
      '<div class="flex flex-col items-center text-center">' +
      '<div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-4">' +
      '<span class="material-symbols-rounded text-[34px]">check_circle</span>' +
      "</div>" +
      '<h1 class="text-2xl font-bold mb-2">问卷完成，感谢您的参与！</h1>' +
      '<p class="text-ink-soft leading-relaxed max-w-md mb-4">您的回答已被匿名记录，将仅用于学术研究目的。本研究关注用户与 AI 客服的交互体验。如果您对研究有任何疑问，欢迎联系研究团队。</p>' +
      '<p class="text-xs text-ink-soft/70 mb-1">参与编号</p>' +
      '<p class="font-mono text-[13px] bg-bg-soft px-3 py-1.5 rounded-lg">' +
      esc(state.participant_id) +
      "</p>" +
      (errMsg
        ? '<div class="mt-5 text-left bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm max-w-md">' +
          "<strong>提示：</strong>提交服务器时遇到问题（" +
          esc(errMsg) +
          "），您的回答已暂存于本设备。请告知研究人员以协助补传。" +
          "</div>"
        : "") +
      "</div>";
    mount(card(body));
  }

  function renderTerminated() {
    setProgress(100);
    mount(
      card(
        '<div class="flex flex-col items-center text-center">' +
          '<div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">' +
          '<span class="material-symbols-rounded text-ink-soft text-[28px]">waving_hand</span>' +
          "</div>" +
          '<h1 class="text-2xl font-bold mb-2">感谢您的关注</h1>' +
          '<p class="text-ink-soft leading-relaxed max-w-md">您已选择不参与本次研究，问卷已结束，不会记录任何数据。祝您生活愉快！</p>' +
          "</div>"
      )
    );
  }

  /* ---------- Boot ---------- */
  renderConsent();
})();
