/* ============================================================
   Experiment 3 — Questionnaire data
   Single-factor between-subjects (attribution manipulation × 3 levels)
   Fixed 3.5s delay + fixed rejection outcome across all cells;
   only the loading text differs (effort / neutral / malfunction).
   ============================================================ */
window.EXP3_DATA = (function () {
  "use strict";

  /* ---------- Airtable target ----------
     Base ID / Table ID / API key are all runtime-injectable:
       - URL parameter:  ?airtable_key=xxx&airtable_base=xxx&airtable_table=xxx
       - localStorage:   airtable_key / exp3_airtable_base / exp3_airtable_table
     The values below are placeholders; the researcher can either
     (a) fill them in here later, or (b) inject them via URL. */
  var AIRTABLE = {
    baseId: "",        // e.g. "appXXXXXXXXXXXXXX"  ← 待填
    tableId: "",       // e.g. "tblXXXXXXXXXXXXXX"  ← 待填
    apiKey: ""         // 请通过 URL 参数 airtable_key 传入，勿硬编码 PAT
  };

  /* ---------- Fixed experimental constants ---------- */
  var FIXED_DELAY_MS = 3500;
  var FIXED_SCENARIO =
    "您最近购买了一台某品牌笔记本电脑（价值约 8,000 元）。使用两周后，您发现屏幕出现了明显的色差问题。" +
    "由于已经超过了 7 天无理由退货期，您联系平台 AI 客服，提交了订单记录和故障照片，申请全额退款。";
  var FIXED_USER_MESSAGE =
    "你好，我两周前购买的笔记本电脑出现了明显的屏幕色差问题，严重影响使用。" +
    "我已上传订单和故障照片，希望申请全额退款。";
  var FIXED_REPLY =
    "经系统核查，您的申请不符合当前规则，暂时无法为您办理。如有疑问，可联系人工客服。";

  /* ---------- Three attribution conditions (loading text only differs) ---------- */
  var CONDITIONS = {
    A: {
      cell: "A",
      attribution_cond: "effort",
      cond_label: "努力归因组",
      loading_text: "正在认真核查您的订单与历史记录，请稍候……",
      delay_ms: FIXED_DELAY_MS,
      scenario: FIXED_SCENARIO,
      userMessage: FIXED_USER_MESSAGE,
      reply: FIXED_REPLY
    },
    B: {
      cell: "B",
      attribution_cond: "neutral",
      cond_label: "中性组",
      loading_text: "请稍候……",
      delay_ms: FIXED_DELAY_MS,
      scenario: FIXED_SCENARIO,
      userMessage: FIXED_USER_MESSAGE,
      reply: FIXED_REPLY
    },
    C: {
      cell: "C",
      attribution_cond: "malfunction",
      cond_label: "故障归因组",
      loading_text: "系统繁忙，请稍候……",
      delay_ms: FIXED_DELAY_MS,
      scenario: FIXED_SCENARIO,
      userMessage: FIXED_USER_MESSAGE,
      reply: FIXED_REPLY
    }
  };

  /* ---------- Likert scale anchors ---------- */
  var LIKERT_LABELS = {
    1: "非常不同意",
    2: "不同意",
    3: "比较不同意",
    4: "中立",
    5: "比较同意",
    6: "同意",
    7: "非常同意"
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

  /* ---------- Survey modules (order matches paper) ---------- */
  var MODULES = [
    /* ---- 归因操纵检验（Attribution Manipulation Check） ---- */
    {
      id: "AttrCheck",
      title: "归因操纵检验",
      hint: "请根据刚才的情境，判断以下说法与您的感受是否一致（1=非常不同意，7=非常同意）。",
      scaleLabels: LIKERT_LABELS,
      items: [
        { key: "AttrEffort1", type: "likert7",
          text: "我认为刚才的延迟是因为 AI 客服正在\u201C思考\u201D如何处理我的诉求。" },
        { key: "AttrEffort2", type: "likert7",
          text: "我感觉这段等待时间是 AI 客服在进行核查。" },
        { key: "AttrFault1", type: "likert7",
          text: "我怀疑刚才的延迟是因为系统卡顿或出现了技术故障。" },
        { key: "AttrFault2", type: "likert7",
          text: "我觉得这段等待时间纯粹是因为系统运行效率低。" }
      ]
    },

    /* ---- 补救满意度 SA（核心因变量） ---- */
    {
      id: "SA",
      title: "补救满意度",
      hint: "请根据 AI 客服的处理过程及结果，对以下说法进行评价。",
      scaleLabels: LIKERT_LABELS,
      items: [
        { key: "SA1", type: "likert7", text: "总体而言，我对这次 AI 客服的处理感到满意。" },
        { key: "SA2", type: "likert7", text: "即使结果没有满足我的诉求，我仍然能够接受这次处理结果。" },
        { key: "SA3", type: "likert7", text: "我认为这位 AI 客服处理我问题的方式是可以认可的。" }
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
        { key: "PE2", type: "likert7", text: "这位 AI 客服似乎在仔细思考如何回复我。" }
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

    /* ---- 辅助测量：速度感知 + 等待情绪 ---- */
    {
      id: "AUX",
      title: "辅助测量",
      hint: "请根据刚才的等待与回复体验回答以下问题。",
      scaleLabels: LIKERT_LABELS,
      items: [
        {
          key: "SpeedPerc",
          type: "likert7",
          text: "刚才 AI 客服回复您的速度是：",
          customLabels: SPEED_LABELS
        },
        {
          key: "Impatience",
          type: "likert7",
          text: "等待回复的过程让我感到有些不耐烦。"
        }
      ]
    },

    /* ---- 注意力检测 IMC ---- */
    {
      id: "IMC",
      title: "注意力检测",
      hint: "为保证数据质量，请仔细阅读以下题目。",
      scaleLabels: LIKERT_LABELS,
      items: [
        {
          key: "IMC1",
          type: "single",
          text: "这是一道注意力检测题，请直接选择下方第二个选项\u201C不同意\u201D。",
          options: ["非常不同意", "不同意", "比较不同意", "中立", "比较同意", "同意", "非常同意"]
        }
      ]
    },

    /* ---- 人口统计学变量 ---- */
    {
      id: "DEMO",
      title: "人口统计",
      hint: "以下问题用于研究分析，仅以匿名形式使用。请如实作答。",
      scaleLabels: LIKERT_LABELS,
      items: [
        {
          key: "Gender",
          type: "single",
          text: "您的性别是：",
          options: ["男", "女", "不便透露"]
        },
        {
          key: "Age",
          type: "number_input",
          text: "您的年龄是：",
          suffix: "岁",
          min: 1,
          max: 120
        },
        {
          key: "Edu",
          type: "single",
          text: "您目前的最高受教育程度是：",
          options: ["高中及以下", "大专", "本科", "硕士", "博士及以上"]
        },
        {
          key: "AIFreq",
          type: "single",
          text: "您使用 AI 客服的频率是：",
          options: ["从不", "偶尔", "经常", "极度频繁"]
        }
      ]
    }
  ];

  return {
    AIRTABLE: AIRTABLE,
    CONDITIONS: CONDITIONS,
    MODULES: MODULES,
    LIKERT_LABELS: LIKERT_LABELS,
    SPEED_LABELS: SPEED_LABELS,
    FIXED_DELAY_MS: FIXED_DELAY_MS
  };
})();
