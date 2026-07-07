/* ============================================================
   Experiment 2 — Flow controller
   2×2 between-subjects: response_speed × perceived_task_difficulty
   All conditions: rejection outcome
   ============================================================ */
(function () {
  "use strict";

  var DATA = window.EXP2_DATA;
  var app = document.getElementById("app");
  var topProgress = document.getElementById("top-progress");

  /* ---------- State ---------- */
  var state = {
    stage: "consent", // consent | scenario | chat | survey | thanks | terminated
    moduleIndex: 0,
    participant_id: uuid(),
    started_at: new Date().toISOString(),
    condition: null,
    answers: {},
    submitting: false,
    submitted: false,
    submit_error: null
  };

  /* ---------- Progress mapping ---------- */
  function setProgress(p) {
    topProgress.style.width = Math.max(0, Math.min(100, p)) + "%";
  }
  function moduleProgress() {
    var totalModules = DATA.MODULES.length;
    var base = 20;
    var span = 75;
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
  function shortId() {
    // Generate a short alphanumeric ID
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "";
    for (var i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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
          '<p class="text-ink-soft leading-relaxed mb-3">本问卷将呈现一个电商平台 AI 客服处理售后问题的情境。请您认真阅读情境材料，并尽量代入自己正在与 AI 客服沟通的真实感受，然后回答后续问题。</p>' +
          '<p class="text-ink-soft leading-relaxed mb-3">参与本研究<strong class="text-ink">完全自愿</strong>，您的回答将被<strong class="text-ink">匿名处理</strong>，仅用于学术研究目的。</p>' +
          '<p class="text-ink-soft leading-relaxed mb-6">研究过程约需 <strong class="text-ink">5-8 分钟</strong>，您可以随时退出。</p>' +
          '<div class="space-y-3">' +
          consentOption("agree", "\u2705", "我已阅读以上说明，自愿参与本研究（继续）") +
          consentOption("decline", "\u274C", "我不愿意参与（结束）") +
          "</div>" +
          errorBox("consent-err")
      );
    mount(html);

    var consentInputs = document.querySelectorAll('input[name="consent"]');
    consentInputs.forEach(function (inp) {
      inp.addEventListener("change", function () {
        hideError("consent-err");
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
     STAGE 2 — Scenario (dynamic based on condition)
     ============================================================ */
  function renderScenario() {
    state.stage = "scenario";
    setProgress(12);
    if (!state.condition) state.condition = pickCondition();

    var cond = state.condition;

    var html = card(
      stepBadge("情境背景") +
        '<h2 class="text-2xl font-bold mb-4">请阅读以下情境</h2>' +
        '<div class="space-y-4 text-ink leading-relaxed text-[15px] mb-6">' +
        '<p>请设想以下情境：</p>' +
        '<p class="bg-primary-light/60 border border-primary/10 rounded-2xl px-5 py-4">' +
        esc(cond.scenario) +
        "</p>" +
        '<p class="text-ink-soft">随后，您进入平台的 AI 客服对话界面并提交了自己的诉求。</p>' +
        "</div>" +
        '<div class="flex">' +
        primaryBtn("scenario-next", "开始对话", "chat") +
        "</div>"
    );
    mount(html);
    document.getElementById("scenario-next").addEventListener("click", renderChat);
  }

  /* ============================================================
     STAGE 3 — Chat (simulated AI conversation)
     ============================================================ */
  function renderChat() {
    state.stage = "chat";
    setProgress(20);
    var cond = state.condition;

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

    composeArea.innerHTML = pendingUserBubble(cond.userMessage);
    var sendBtn = document.getElementById("send-user-msg");

    sendBtn.addEventListener("click", function () {
      sendBtn.disabled = true;
      composeArea.innerHTML = "";
      chatArea.appendChild(userBubble(cond.userMessage));
      scrollChat();

      setTimeout(function () {
        if (cond.showTypingMsg) {
          // Show "正在核查" message first
          var typingMsg = document.createElement("div");
          typingMsg.className = "flex items-start gap-2 msg-in";
          typingMsg.innerHTML =
            '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shrink-0">' +
            '<span class="material-symbols-rounded text-[18px]">smart_toy</span>' +
            "</div>" +
            '<div class="chat-bubble-ai px-4 py-3 flex items-center gap-3 text-sm text-ink-soft">' +
            '<span>\u6B63\u5728\u6838\u67E5\u60A8\u7684\u8BA2\u5355\u4FE1\u606F\u2026\u2026</span>' +
            '<span class="flex items-center gap-1">' +
            '<span class="pulse-dot w-1.5 h-1.5 bg-primary rounded-full"></span>' +
            '<span class="pulse-dot w-1.5 h-1.5 bg-primary rounded-full"></span>' +
            '<span class="pulse-dot w-1.5 h-1.5 bg-primary rounded-full"></span>' +
            "</span>" +
            "</div>";
          chatArea.appendChild(typingMsg);
          scrollChat();

          setTimeout(function () {
            typingMsg.remove();
            chatArea.appendChild(aiBubble(cond.reply));
            scrollChat();
            revealCta();
          }, cond.delay_ms);
        } else {
          // Immediate: brief typing then reply
          var typing = typingIndicator();
          chatArea.appendChild(typing);
          scrollChat();

          setTimeout(function () {
            typing.remove();
            chatArea.appendChild(aiBubble(cond.reply));
            scrollChat();
            revealCta();
          }, 250);
        }
      }, 350);
    });

    function revealCta() {
      setTimeout(function () {
        ctaWrap.classList.remove("opacity-0", "pointer-events-none");
        ctaWrap.classList.add("opacity-100");
        document.getElementById("chat-next").addEventListener("click", function () {
          state.moduleIndex = 0;
          renderSurvey();
        });
      }, 450);
    }

    function scrollChat() {
      chatArea.scrollTop = chatArea.scrollHeight;
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }

  function pendingUserBubble(text) {
    return (
      '<div class="flex flex-col items-end gap-1.5">' +
      '<button id="send-user-msg" type="button" ' +
      'class="group max-w-[85%] text-left chat-bubble-user px-4 py-2.5 text-[15px] leading-relaxed cursor-pointer ' +
      'hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all ' +
      'shadow-soft hover:shadow-card disabled:opacity-60 disabled:cursor-not-allowed">' +
      '<span class="block">' + esc(text) + '</span>' +
      '<span class="mt-1.5 inline-flex items-center gap-1 text-[12px] opacity-90">' +
      '<span class="material-symbols-rounded text-[14px] group-hover:translate-x-0.5 transition-transform">send</span>' +
      '<span>\u70B9\u51FB\u53D1\u9001</span>' +
      '</span>' +
      '</button>' +
      '<span class="text-[11px] text-ink-soft pr-1">\u8BF7\u70B9\u51FB\u4E0A\u65B9\u6C14\u6CE1\u53D1\u9001\u6D88\u606F\u7ED9 AI \u5BA2\u670D</span>' +
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
      '<span>AI \u6B63\u5728\u8F93\u5165</span>' +
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
        if (it.type === "likert7") return likertBlock(it, mod);
        if (it.type === "single") return singleBlock(it);
        if (it.type === "number_input") return numberInputBlock(it);
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
        (state.moduleIndex > 0 ? ghostBtn("survey-back", "\u4E0A\u4E00\u90E8\u5206", "arrow_back") : "<span></span>") +
        primaryBtn("survey-next", nextLabel, nextIcon) +
        "</div>"
    );
    mount(html);

    // Restore existing answers
    mod.items.forEach(function (it) {
      var v = state.answers[it.key];
      if (v == null) return;
      if (it.type === "likert7" || it.type === "single") {
        var inp = document.querySelector(
          'input[name="' + it.key + '"][value="' + cssEscape(v) + '"]'
        );
        if (inp) inp.checked = true;
      } else if (it.type === "number_input") {
        var numInp = document.getElementById("num-" + it.key);
        if (numInp) numInp.value = v;
      }
    });

    if (state.moduleIndex > 0) {
      document.getElementById("survey-back").addEventListener("click", function () {
        collectModuleAnswers(mod, true);
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

  function likertBlock(item, mod) {
    var labels = item.customLabels || mod.scaleLabels || DATA.LIKERT_LABELS;
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
    var leftLabel = labels[1] || "";
    var rightLabel = labels[7] || "";
    return (
      '<div class="border border-slate-100 rounded-2xl p-4 sm:p-5 bg-white/70">' +
      '<p class="text-[15px] leading-relaxed mb-4 font-medium">' +
      esc(item.text) +
      "</p>" +
      '<div class="flex items-center justify-between gap-1 sm:gap-2">' +
      dots +
      "</div>" +
      '<div class="flex justify-between text-[11px] text-ink-soft mt-2 px-0.5">' +
      "<span>" + esc(leftLabel) + "</span><span>" + esc(rightLabel) + "</span>" +
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
      esc(item.text) +
      "</p>" +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">' +
      opts +
      "</div>" +
      "</div>"
    );
  }

  function numberInputBlock(item) {
    return (
      '<div class="border border-slate-100 rounded-2xl p-4 sm:p-5 bg-white/70">' +
      '<p class="text-[15px] leading-relaxed mb-4 font-medium">' +
      esc(item.text) +
      "</p>" +
      '<div class="flex items-center gap-2">' +
      '<input id="num-' + item.key + '" type="number" class="num-input" ' +
      'min="' + (item.min || 1) + '" max="' + (item.max || 120) + '" placeholder="" />' +
      '<span class="text-ink-soft text-[15px]">' + esc(item.suffix || "") + '</span>' +
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
      } else if (it.type === "number_input") {
        var numInp = document.getElementById("num-" + it.key);
        var val = numInp ? numInp.value.trim() : "";
        if (val && !isNaN(parseInt(val, 10))) {
          state.answers[it.key] = parseInt(val, 10);
        } else {
          firstMissing = firstMissing || it.key;
        }
      }
    });
    if (firstMissing && !silent) {
      showError("survey-err", "\u8BF7\u56DE\u7B54\u6240\u6709\u9898\u76EE\uFF08\u7F3A\uFF1A" + firstMissing + "\uFF09\u3002");
      var el = document.querySelector('[name="' + firstMissing + '"], #num-' + firstMissing);
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

    // Manipulation check pass flags
    var mc_so_pass = a.MC_SO1 === "\u62D2\u7EDD\u9000\u6B3E / \u4E0D\u4E88\u53D7\u7406" ? 1 : 0;

    // Auto-generate Name: cell_shortId_timestamp
    var now = new Date();
    var ts =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      "T" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0");
    var sid = shortId();
    var recordName = cond.cell + "_" + sid + "_" + ts;

    return {
      Name: recordName,
      participant_id: state.participant_id,
      timestamp: new Date().toISOString(),
      speed_cond: cond.speed_cond,
      difficulty_cond: cond.difficulty_cond,
      cell: cond.cell,
      experiment: "2",

      // Manipulation checks
      MC_TD1: String(a.MC_TD1),
      MC_TD2: String(a.MC_TD2),
      MC_TD3: String(a.MC_TD3),
      MC_RS1: String(a.MC_RS1),
      MC_SO1: a.MC_SO1,
      mc_so_pass: String(mc_so_pass),

      // Main scales
      SA1: String(a.SA1),
      SA2: String(a.SA2),
      SA3: String(a.SA3),
      SA4: String(a.SA4),
      PE1: String(a.PE1),
      PE2: String(a.PE2),
      DA1: String(a.DA1),
      DA2: String(a.DA2),
      PTD1: String(a.PTD1),
      PTD2: String(a.PTD2),

      // Control variables
      EXP1: String(a.EXP1),
      EXP2: String(a.EXP2),
      TRUST1: String(a.TRUST1),
      TRUST2: String(a.TRUST2),
      TRUST3: String(a.TRUST3),
      GENDER: a.GENDER,
      AGE: a.AGE ? String(a.AGE) : "",
      EDU: a.EDU
    };
  }

  function submitAndFinish() {
    if (state.submitting) return;
    state.submitting = true;
    var payload = buildSubmission();

    setProgress(98);
    mount(
      card(
        '<div class="flex flex-col items-center text-center py-6">' +
          '<div class="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mb-4">' +
          '<span class="material-symbols-rounded text-primary text-[28px] animate-pulse">cloud_upload</span>' +
          "</div>" +
          '<h2 class="text-xl font-bold mb-2">\u6B63\u5728\u63D0\u4EA4\u60A8\u7684\u56DE\u7B54\u2026</h2>' +
          '<p class="text-ink-soft text-sm">\u8BF7\u7A0D\u5019\uFF0C\u4E0D\u8981\u5173\u95ED\u9875\u9762\u3002</p>' +
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
        try {
          var key = "exp2_offline_" + state.participant_id;
          localStorage.setItem(key, JSON.stringify(payload));
        } catch (e) {}
        renderThanks(state.submit_error);
      })
      .finally(function () {
        state.submitting = false;
      });
  }

  function getAirtableApiKey() {
    var apiKey = "";
    try {
      apiKey = localStorage.getItem("airtable_key") || "";
    } catch (err) {
      void err;
    }

    if (!apiKey) {
      var params = new URLSearchParams(window.location.search);
      apiKey = params.get("airtable_key") || "";
      if (apiKey) {
        try {
          localStorage.setItem("airtable_key", apiKey);
        } catch (err) {
          void err;
        }
      }
    }

    return apiKey || DATA.AIRTABLE.apiKey || "";
  }

  function submitToAirtable(fields) {
    var url =
      "https://api.airtable.com/v0/" +
      DATA.AIRTABLE.baseId +
      "/" +
      DATA.AIRTABLE.tableId;
    var apiKey = getAirtableApiKey();

    // Filter out undefined/null/empty values
    var clean = {};
    Object.keys(fields).forEach(function (k) {
      if (fields[k] !== undefined && fields[k] !== null && fields[k] !== "") {
        clean[k] = fields[k];
      }
    });

    if (!apiKey || apiKey === "YOUR_AIRTABLE_API_KEY") {
      console.warn(
        "[Experiment2] Airtable API key not configured \u2014 storing payload offline.",
        clean
      );
      return Promise.reject(new Error("Airtable API key not configured"));
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
      '<h1 class="text-2xl font-bold mb-2">\u95EE\u5377\u5B8C\u6210\uFF0C\u611F\u8C22\u60A8\u7684\u53C2\u4E0E\uFF01</h1>' +
      '<p class="text-ink-soft leading-relaxed max-w-md mb-4">\u60A8\u7684\u56DE\u7B54\u5DF2\u88AB\u533F\u540D\u8BB0\u5F55\uFF0C\u5C06\u4EC5\u7528\u4E8E\u5B66\u672F\u7814\u7A76\u76EE\u7684\u3002\u672C\u7814\u7A76\u5173\u6CE8\u7528\u6237\u4E0E AI \u5BA2\u670D\u7684\u4EA4\u4E92\u4F53\u9A8C\u3002\u5982\u679C\u60A8\u5BF9\u7814\u7A76\u6709\u4EFB\u4F55\u7591\u95EE\uFF0C\u6B22\u8FCE\u8054\u7CFB\u7814\u7A76\u56E2\u961F\u3002</p>' +
      '<p class="text-xs text-ink-soft/70 mb-1">\u53C2\u4E0E\u7F16\u53F7</p>' +
      '<p class="font-mono text-[13px] bg-bg-soft px-3 py-1.5 rounded-lg">' +
      esc(state.participant_id) +
      "</p>" +
      (errMsg
        ? '<div class="mt-5 text-left bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm max-w-md">' +
          "<strong>\u63D0\u793A\uFF1A</strong>\u63D0\u4EA4\u670D\u52A1\u5668\u65F6\u9047\u5230\u95EE\u9898\uFF08" +
          esc(errMsg) +
          "\uFF09\uFF0C\u60A8\u7684\u56DE\u7B54\u5DF2\u6682\u5B58\u4E8E\u672C\u8BBE\u5907\u3002\u8BF7\u544A\u77E5\u7814\u7A76\u4EBA\u5458\u4EE5\u534F\u52A9\u8865\u4F20\u3002" +
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
          '<h1 class="text-2xl font-bold mb-2">\u611F\u8C22\u60A8\u7684\u5173\u6CE8</h1>' +
          '<p class="text-ink-soft leading-relaxed max-w-md">\u60A8\u5DF2\u9009\u62E9\u4E0D\u53C2\u4E0E\u672C\u6B21\u7814\u7A76\uFF0C\u95EE\u5377\u5DF2\u7ED3\u675F\uFF0C\u4E0D\u4F1A\u8BB0\u5F55\u4EFB\u4F55\u6570\u636E\u3002\u795D\u60A8\u751F\u6D3B\u6109\u5FEB\uFF01</p>' +
          "</div>"
      )
    );
  }

  /* ---------- Boot ---------- */
  renderConsent();
})();
