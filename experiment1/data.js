/* ============================================================
   Experiment 1 — Questionnaire data
   2×2 between-subjects (response_speed × service_outcome)
   ============================================================ */
window.EXP1_DATA = (function () {
  "use strict";

  /* ---------- Airtable target (key supplied later) ---------- */
  var AIRTABLE = {
    baseId: "appr3zBCXRKD26aWv",
    tableId: "tblcpobwfOm6NZL5o",
    apiKey: ""
  };

  /* ---------- Four experimental cells ---------- */
  // cell: A=immediate+reject, B=delay+reject, C=immediate+approve, D=delay+approve
  var CONDITIONS = {
    A: {
      cell: "A",
      speed_cond: "immediate",
      outcome_cond: "reject",
      delay_ms: 0,
      reply:
        "您好！感谢您联系我们。根据您的描述，由于色差属于正常显示误差范围，暂不符合退款条件，您的申请暂不受理。如有其他问题，欢迎继续咨询。"
    },
    B: {
      cell: "B",
      speed_cond: "delay",
      outcome_cond: "reject",
      delay_ms: 3500,
      reply:
        "您好！感谢您联系我们。根据您的描述，由于色差属于正常显示误差范围，暂不符合退款条件，您的申请暂不受理。如有其他问题，欢迎继续咨询。"
    },
    C: {
      cell: "C",
      speed_cond: "immediate",
      outcome_cond: "approve",
      delay_ms: 0,
      reply:
        "您好！感谢您联系我们。根据您的描述，色差问题属于商品质量问题，符合退款条件，您的退款申请已受理。后续退款将在3-5个工作日内原路返回，请注意查收。"
    },
    D: {
      cell: "D",
      speed_cond: "delay",
      outcome_cond: "approve",
      delay_ms: 3500,
      reply:
        "您好！感谢您联系我们。根据您的描述，色差问题属于商品质量问题，符合退款条件，您的退款申请已受理。后续退款将在3-5个工作日内原路返回，请注意查收。"
    }
  };

  var USER_MESSAGE =
    "你好，我想申请退款，我买的外套颜色和网页上展示的不一样。";

  /* ---------- Likert scale anchors ---------- */
  var LIKERT_LABELS = {
    1: "非常不同意",
    2: "不同意",
    3: "有点不同意",
    4: "中立",
    5: "有点同意",
    6: "同意",
    7: "非常同意"
  };

  /* ---------- Survey modules ----------
     Module list drives the progress bar; each non-trivial module
     contains a list of items.
     item.type:
       - "likert7"           — 7-point Likert
       - "single"            — single-choice
       - "multi"             — multi-choice (max selectable specified)
  ---------------------------------------- */
  var MODULES = [
    /* ---- 模块四：满意度 SA ---- */
    {
      id: "SA",
      title: "",
      hint: "请根据您刚才与 AI 客服的交互体验，回答以下问题。",
      scaleLabels: LIKERT_LABELS,
      items: [
        { key: "SA1", type: "likert7", text: "我对这次 AI 客服的服务感到满意。" },
        { key: "SA2", type: "likert7", text: "这次 AI 客服给我留下了良好的印象。" },
        { key: "SA3", type: "likert7", text: "总体来看，这次 AI 客服的表现让我满意。" },
        { key: "SA4", type: "likert7", text: "我愿意再次使用这个平台的 AI 客服。" }
      ]
    },

    /* ---- 合并中介 + 操纵检验 ---- */
    {
      id: "MEDI",
      title: "",
      hint: "关于这次 AI 客服的回复，请评价以下陈述。",
      scaleLabels: LIKERT_LABELS,
      items: [
        { key: "PE3", type: "likert7", text: "AI 客服让我感觉其确实花了一定时间处理我的诉求。" },
        { key: "DA2", type: "likert7", text: "我觉得 AI 客服只是在应付我。" },
        { key: "PJ3", type: "likert7", text: "AI 客服让我感觉我的诉求被认真考虑了。" },
        { key: "MC1", type: "likert7", text: "这次 AI 客服几乎是立刻回复了我的问题。" },
        {
          key: "MC_result",
          type: "single",
          text:
            "请问在刚才的对话中，AI 客服最终对您的退款申请做出了什么决定？",
          options: [
            "同意受理我的申请",
            "拒绝/暂不受理我的申请",
            "需要进一步核实",
            "我不确定"
          ]
        }
      ]
    },

    /* ---- 模块七：协变量 ---- */
    {
      id: "COV",
      title: "",
      hint: "以下问题用于研究分析，不会用于其他用途。",
      scaleLabels: LIKERT_LABELS,
      items: [
        {
          key: "EDU",
          type: "single",
          text: "您的最高学历是？",
          options: ["高中及以下", "大专", "本科", "硕士", "博士及以上"]
        },
        { key: "EXP1", type: "likert7", text: "我经常使用 AI 客服解决问题。" },
        { key: "EXP2", type: "likert7", text: "我对使用 AI 客服处理问题比较熟悉。" },
        { key: "TRUST1", type: "likert7", text: "我总体上信任 AI 系统给出的建议。" },
        { key: "TRUST2", type: "likert7", text: "我认为 AI 系统能够可靠地处理问题。" },
        { key: "TRUST3", type: "likert7", text: "遇到问题时，我愿意依赖 AI 系统的判断。" },
        {
          key: "DEM1",
          type: "single",
          text: "您的性别是？",
          options: ["男", "女", "其他", "不愿透露"]
        },
        {
          key: "DEM2",
          type: "single",
          text: "您的年龄是？",
          options: [
            "18 岁以下",
            "18-24 岁",
            "25-34 岁",
            "35-44 岁",
            "45-54 岁",
            "55 岁及以上"
          ]
        },
        {
          key: "DEM3",
          type: "single",
          text: "您每月网购的频率大约是多少？",
          options: [
            "几乎不网购",
            "1-2 次",
            "3-5 次",
            "6-10 次",
            "10 次以上"
          ]
        }
      ]
    },

  ];

  return {
    AIRTABLE: AIRTABLE,
    CONDITIONS: CONDITIONS,
    USER_MESSAGE: USER_MESSAGE,
    MODULES: MODULES,
    LIKERT_LABELS: LIKERT_LABELS
  };
})();
