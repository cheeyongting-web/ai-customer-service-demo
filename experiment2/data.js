/* ============================================================
   Experiment 2 — Questionnaire data
   2×2 between-subjects (response_speed × perceived_task_difficulty)
   All conditions: rejection outcome only
   ============================================================ */
window.EXP2_DATA = (function () {
  "use strict";

  /* ---------- Airtable target ---------- */
  var AIRTABLE = {
    baseId: "appvjPaL3Kcyjz1gY",
    tableId: "tblcpobwfOm6NZL5o",
    apiKey: ""
  };

  /* ---------- Four experimental cells ---------- */
  // A = low difficulty + immediate
  // B = low difficulty + delay
  // C = high difficulty + immediate
  // D = high difficulty + delay
  var CONDITIONS = {
    A: {
      cell: "A",
      speed_cond: "immediate",
      difficulty_cond: "low",
      delay_ms: 0,
      scenario:
        "您最近购买了一台某品牌笔记本电脑。收到货后，您发现商品组合中的鼠标存在轻微瑕疵，但并不影响正常使用。考虑到配件本身价值不高，您联系平台客服，希望获得与鼠标价格相应的退款作为补偿。",
      userMessage:
        "你好，我购买的笔记本电脑附带的鼠标有轻微瑕疵，想申请鼠标部分的退款补偿。",
      preReplyNote: "提交诉求后，系统几乎立刻给出回复：",
      showTypingMsg: false,
      reply:
        "经系统核查，您的申请不符合当前退款规则，暂时无法为您办理。如有疑问，可联系人工客服进一步沟通。"
    },
    B: {
      cell: "B",
      speed_cond: "delay",
      difficulty_cond: "low",
      delay_ms: 3500,
      scenario:
        "您最近购买了一台某品牌笔记本电脑。收到货后，您发现商品组合中的鼠标存在轻微瑕疵，但并不影响正常使用。考虑到配件本身价值不高，您联系平台客服，希望获得与鼠标价格相应的退款作为补偿。",
      userMessage:
        "你好，我购买的笔记本电脑附带的鼠标有轻微瑕疵，想申请鼠标部分的退款补偿。",
      preReplyNote: "提交诉求后，系统先显示\u201c正在核查您的订单信息……\u201d，约 3.5 秒后给出回复：",
      showTypingMsg: true,
      reply:
        "经系统核查，您的申请不符合当前退款规则，暂时无法为您办理。如有疑问，可联系人工客服进一步沟通。"
    },
    C: {
      cell: "C",
      speed_cond: "immediate",
      difficulty_cond: "high",
      delay_ms: 0,
      scenario:
        "您最近购买了一台某品牌笔记本电脑，价格约 8000 元。使用两周后，您发现电脑出现了屏幕严重色差和键盘失灵的问题。由于已经超过 7 天无理由退货期，平台要求您提供订单记录、故障照片、检测说明等多项材料。您认为问题已经严重影响正常使用，因此联系平台客服，申请全额退款。",
      userMessage:
        "你好，我两周前购买的笔记本电脑出现了屏幕严重色差和键盘失灵的问题，严重影响使用，我想申请全额退款。",
      preReplyNote: "提交诉求后，系统几乎立刻给出回复：",
      showTypingMsg: false,
      reply:
        "经系统核查，您的申请不符合当前退款规则，暂时无法为您办理。如有疑问，可联系人工客服进一步沟通。"
    },
    D: {
      cell: "D",
      speed_cond: "delay",
      difficulty_cond: "high",
      delay_ms: 3500,
      scenario:
        "您最近购买了一台某品牌笔记本电脑，价格约 8000 元。使用两周后，您发现电脑出现了屏幕严重色差和键盘失灵的问题。由于已经超过 7 天无理由退货期，平台要求您提供订单记录、故障照片、检测说明等多项材料。您认为问题已经严重影响正常使用，因此联系平台客服，申请全额退款。",
      userMessage:
        "你好，我两周前购买的笔记本电脑出现了屏幕严重色差和键盘失灵的问题，严重影响使用，我想申请全额退款。",
      preReplyNote: "提交诉求后，系统先显示\u201c正在核查您的订单信息……\u201d，约 3.5 秒后给出回复：",
      showTypingMsg: true,
      reply:
        "经系统核查，您的申请不符合当前退款规则，暂时无法为您办理。如有疑问，可联系人工客服进一步沟通。"
    }
  };

  /* ---------- Likert scale anchors ---------- */
  var LIKERT_LABELS = {
    1: "完全不同意",
    2: "不同意",
    3: "比较不同意",
    4: "一般",
    5: "比较同意",
    6: "同意",
    7: "完全同意"
  };

  var SPEED_LABELS = {
    1: "非常慢",
    2: "比较慢",
    3: "有点慢",
    4: "一般",
    5: "有点快",
    6: "比较快",
    7: "非常快"
  };

  /* ---------- Survey modules ---------- */
  var MODULES = [
    /* ---- 操纵检验：失败严重性/任务难度感知 ---- */
    {
      id: "MC_TD",
      title: "操纵检验",
      hint: "请根据刚才的情境，判断以下说法与您的感受是否一致。",
      scaleLabels: LIKERT_LABELS,
      items: [
        { key: "MC_TD1", type: "likert7", text: "这次服务失败给我造成了严重的损失。" },
        { key: "MC_TD2", type: "likert7", text: "这个问题对我来说非常重要。" },
        { key: "MC_TD3", type: "likert7", text: "如果这个问题得不到解决，我会受到较大的影响。" }
      ]
    },

    /* ---- 操纵检验：响应速度 + 服务结果 ---- */
    {
      id: "MC_RS",
      title: "操纵检验",
      hint: "请根据刚才的体验回答以下问题。",
      scaleLabels: SPEED_LABELS,
      items: [
        {
          key: "MC_RS1",
          type: "likert7",
          text: "AI 客服回复我的速度是：",
          customLabels: SPEED_LABELS
        },
        {
          key: "MC_SO1",
          type: "single",
          text: "AI 客服最终给了我什么结果？",
          options: [
            "同意退款 / 补偿",
            "拒绝退款 / 不予受理",
            "记不清了"
          ]
        }
      ]
    },

    /* ---- 补救满意度 SA ---- */
    {
      id: "SA",
      title: "补救满意度",
      hint: "请根据刚才的 AI 客服处理过程，判断以下说法与您的感受是否一致。",
      scaleLabels: LIKERT_LABELS,
      items: [
        { key: "SA1", type: "likert7", text: "总体而言，我对这次 AI 客服的处理感到满意。" },
        { key: "SA2", type: "likert7", text: "即使结果没有满足我的诉求，我仍然能够接受这次处理结果。" },
        { key: "SA3", type: "likert7", text: "我认为这位 AI 客服处理我问题的方式是可以认可的。" },
        { key: "SA4", type: "likert7", text: "综合来看，这次客服体验让我满意。" }
      ]
    },

    /* ---- 感知服务努力 PE ---- */
    {
      id: "PE",
      title: "感知服务努力",
      hint: "请根据刚才的 AI 客服处理过程，判断以下说法与您的感受是否一致。",
      scaleLabels: LIKERT_LABELS,
      items: [
        { key: "PE1", type: "likert7", text: "我认为这位 AI 客服在认真评估与处理我的请求。" },
        { key: "PE2", type: "likert7", text: "我感觉这位 AI 客服为解决我的问题付出了努力。" }
      ]
    },

    /* ---- 被敷衍感 DA ---- */
    {
      id: "DA",
      title: "被敷衍感",
      hint: "请根据刚才的 AI 客服处理过程，判断以下说法与您的感受是否一致。",
      scaleLabels: LIKERT_LABELS,
      items: [
        { key: "DA1", type: "likert7", text: "我觉得这位 AI 客服只是在应付我。" },
        { key: "DA2", type: "likert7", text: "我感到自己的诉求根本没有被重视。" }
      ]
    },

    /* ---- 感知任务难度 PTD ---- */
    {
      id: "PTD",
      title: "感知任务难度",
      hint: "请根据刚才的情境，判断以下说法与您的感受是否一致。",
      scaleLabels: LIKERT_LABELS,
      items: [
        { key: "PTD1", type: "likert7", text: "AI 客服要妥善处理我这个问题，需要进行较为复杂的评估。" },
        { key: "PTD2", type: "likert7", text: "处理我这样的情况需要进行较多的判断和核查。" }
      ]
    },

    /* ---- 控制变量 ---- */
    {
      id: "COV",
      title: "控制变量",
      hint: "以下问题用于研究分析，不会用于其他用途。请根据您的实际情况作答。",
      scaleLabels: LIKERT_LABELS,
      items: [
        { key: "EXP1", type: "likert7", text: "在过去一年里，我使用 AI 客服的频率较高。" },
        { key: "EXP2", type: "likert7", text: "相比多数人，我对 AI 客服的使用经验更丰富。" },
        { key: "TRUST1", type: "likert7", text: "总体来说，我相信 AI 系统通常能够做出合理判断。" },
        { key: "TRUST2", type: "likert7", text: "在大多数情况下，我认为 AI 系统是值得信赖的。" },
        { key: "TRUST3", type: "likert7", text: "当 AI 系统给出处理意见时，我通常愿意相信它的判断。" },
        {
          key: "GENDER",
          type: "single",
          text: "您的性别是：",
          options: ["男", "女", "其他 / 不便透露"]
        },
        {
          key: "AGE",
          type: "number_input",
          text: "您的年龄是：",
          suffix: "岁",
          min: 1,
          max: 120
        },
        {
          key: "EDU",
          type: "single",
          text: "您目前的最高受教育程度是：",
          options: ["高中及以下", "大专", "本科", "硕士", "博士及以上", "其他"]
        }
      ]
    }
  ];

  return {
    AIRTABLE: AIRTABLE,
    CONDITIONS: CONDITIONS,
    MODULES: MODULES,
    LIKERT_LABELS: LIKERT_LABELS,
    SPEED_LABELS: SPEED_LABELS
  };
})();
