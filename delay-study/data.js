/* ============================================================
   Configuration
   ============================================================
   DATA_ENDPOINT: paste your Google Apps Script Web App URL here
   (it must end with /exec). Until it is set, the page still runs
   and stores responses locally in the browser as a backup.
   ------------------------------------------------------------ */
const CONFIG = {
  DATA_ENDPOINT: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_EXEC_URL_HERE",
};
function endpointReady() {
  return (
    typeof CONFIG.DATA_ENDPOINT === "string" &&
    CONFIG.DATA_ENDPOINT.indexOf("http") === 0 &&
    CONFIG.DATA_ENDPOINT.indexOf("PASTE_YOUR") === -1
  );
}

/* ============================================================
   Bilingual UI strings
   ============================================================ */
const I18N = {
  zh: {
    langName: "中文",
    switchTo: "English",
    // ---- Welcome / consent ----
    studyTitle: "AI 客服体验研究",
    studySub: "一项关于在线客服互动体验的学术调查",
    welcomeLead: "感谢您参与本次研究！",
    welcomeBody:
      "本研究是一项学术预实验，旨在了解人们在与在线 AI 客服互动时的真实感受。整个过程大约需要 4–6 分钟。",
    consentTitle: "知情同意",
    consentItems: [
      "本研究为匿名调查，不会收集您的姓名、电话等任何可识别身份的信息。",
      "您的回答仅用于学术研究与数据分析，所有数据将被严格保密。",
      "参与完全自愿，您可以随时退出，不会产生任何不利影响。",
      "研究中包含一段模拟的 AI 客服对话，请像在真实场景中一样自然地体验。",
    ],
    consentCheck: "我已阅读并理解上述说明，自愿参与本次研究。",
    startBtn: "开始研究",
    estTime: "预计用时 4–6 分钟",
    // ---- Demographics ----
    demoTitle: "第一部分 · 基本信息",
    demoSub: "请先填写一些基本信息（仅用于研究分组分析）",
    // ---- Scenario ----
    scenarioTitle: "第二部分 · 情境说明",
    scenarioSub: "请仔细阅读以下情境，稍后您将进入一段真实的客服对话",
    scenarioBody:
      "请想象以下情境：\n\n你最近在一家网店购买了一件商品。收到货后，你发现包装在运输途中有些磨损（商品本身可正常使用）。你为此额外承担了一笔 **小额运费**，心里觉得有些不值，于是你决定联系这家店铺的 **AI 售后客服**，希望能申请一笔 **小额运费补贴**。\n\n接下来，你将与这家店铺的 AI 客服进行真实互动。请像在日常网购中一样，自然地完成这次对话。",
    scenarioTip: "提示：请认真体验整个对话过程，您的真实感受非常重要。",
    enterChatBtn: "进入客服对话",
    // ---- Chat ----
    chatHeaderTitle: "AI 售后客服中心",
    chatHeaderSub: "智能售后服务",
    chatOnline: "在线",
    justNow: "刚刚",
    chatGreeting: "您好，我是本店的 AI 售后客服，很高兴为您服务，请问有什么可以帮您？",
    chatBtnApply: "我想申请运费补贴",
    chatAskReason: "好的，已经为您接入运费补贴申请。请问您申请补贴的主要原因是？",
    reason1: "包装在运输中有磨损",
    reason2: "运费比预期高，希望补贴",
    reason3: "对本次购物体验不太满意",
    chatChecking: "好的，我已收到您的申请，正在为您核查订单与补贴政策…",
    loadingText: "正在查阅运费补贴政策与订单记录…",
    loadingSteps: [
      "正在接入售后服务系统…",
      "正在调取订单与物流信息…",
      "正在核对运费补贴政策…",
      "正在生成处理结果…",
    ],
    chatDecline:
      "非常感谢您的反馈，也理解您的心情。经核查，您本次订单不符合运费补贴的申请条件，因此暂时无法为您提供运费补贴，还请您谅解。如您还有其他问题，我很乐意继续为您服务。",
    chatEndHint: "对话已结束，请点击下方按钮继续填写问卷。",
    endChatBtn: "结束对话并填写问卷",
    // ---- Survey ----
    surveyTitle: "第三部分 · 体验评价",
    surveySub:
      "请根据您刚才与 AI 客服互动的真实感受，对以下每一句话表明您的同意程度。",
    scaleHint: "1 = 非常不同意，7 = 非常同意",
    estWaitLabel: "回想刚才的对话，您觉得 AI 客服在回复您时，大约让您等待了多少秒？",
    estWaitPlaceholder: "请填写一个数字（秒）",
    submitBtn: "提交问卷",
    submitting: "正在提交…",
    // ---- Likert anchors ----
    likert: ["非常不同意", "不同意", "有点不同意", "中立", "有点同意", "同意", "非常同意"],
    // ---- Validation / errors ----
    needConsent: "请先勾选同意参与，再开始研究。",
    needAllDemo: "请完成所有基本信息后再继续。",
    needAllScales: "还有题目尚未作答，请完成全部题目后再提交。",
    submitError: "提交失败，请检查网络后重试。如多次失败，请截图本页并联系研究者。",
    // ---- Thank you ----
    thanksTitle: "提交成功，感谢您的参与！",
    thanksBody:
      "您的回答已成功记录。本研究到此结束，衷心感谢您抽出宝贵时间参与本次学术调查。",
    thanksGroup: "您本次体验的实验编号",
    closeHint: "您现在可以关闭此页面。",
  },
  en: {
    langName: "English",
    switchTo: "中文",
    studyTitle: "AI Customer Service Experience Study",
    studySub: "An academic survey on online customer-service interactions",
    welcomeLead: "Thank you for taking part in this study!",
    welcomeBody:
      "This is an academic pilot study exploring how people feel when interacting with an online AI customer-service agent. It takes about 4–6 minutes.",
    consentTitle: "Informed Consent",
    consentItems: [
      "This is an anonymous survey. We do NOT collect your name, phone number, or any identifying information.",
      "Your responses are used only for academic research and analysis, and will be kept strictly confidential.",
      "Participation is entirely voluntary. You may withdraw at any time without any negative consequences.",
      "The study includes a simulated AI customer-service conversation. Please experience it naturally, as in a real situation.",
    ],
    consentCheck: "I have read and understood the above, and voluntarily agree to participate.",
    startBtn: "Start the Study",
    estTime: "Estimated time: 4–6 minutes",
    demoTitle: "Part 1 · Background Information",
    demoSub: "Please provide some basic information first (used only for research grouping).",
    scenarioTitle: "Part 2 · Scenario",
    scenarioSub: "Please read the scenario carefully. You will then enter a real conversation.",
    scenarioBody:
      "Please imagine the following situation:\n\nYou recently bought an item from an online store. When it arrived, you noticed the packaging was a bit worn during shipping (the item itself works fine). You had paid a **small shipping fee** that now feels not quite worth it. So you decide to contact the store's **AI after-sales agent** to request a **small shipping-fee subsidy**.\n\nNext, you will have a real interaction with the store's AI agent. Please complete the conversation naturally, just as you would in everyday online shopping.",
    scenarioTip: "Tip: Please engage with the whole conversation — your genuine feelings matter.",
    enterChatBtn: "Enter the Conversation",
    chatHeaderTitle: "AI After-Sales Center",
    chatHeaderSub: "Smart after-sales service",
    chatOnline: "Online",
    justNow: "just now",
    chatGreeting: "Hello, I'm the store's AI after-sales agent. How may I help you today?",
    chatBtnApply: "I'd like to request a shipping-fee subsidy",
    chatAskReason: "Sure, I've started your shipping-fee subsidy request. What is the main reason for your request?",
    reason1: "The packaging was worn during shipping",
    reason2: "The shipping fee was higher than expected",
    reason3: "I'm not quite satisfied with this purchase",
    chatChecking: "Got it. I've received your request and I'm checking your order and the subsidy policy…",
    loadingText: "Reviewing the shipping-fee subsidy policy and your order…",
    loadingSteps: [
      "Connecting to the after-sales system…",
      "Retrieving order and logistics details…",
      "Checking the shipping-fee subsidy policy…",
      "Preparing the result…",
    ],
    chatDecline:
      "Thank you very much for your feedback, and I understand how you feel. After checking, your order does not meet the conditions for a shipping-fee subsidy, so we are unable to offer one this time. We appreciate your understanding. I'm happy to help with anything else.",
    chatEndHint: "The conversation has ended. Please click below to continue to the survey.",
    endChatBtn: "End Chat & Continue to Survey",
    surveyTitle: "Part 3 · Your Evaluation",
    surveySub:
      "Based on how you genuinely felt during the interaction, please indicate how much you agree with each statement.",
    scaleHint: "1 = Strongly disagree, 7 = Strongly agree",
    estWaitLabel: "Thinking back to the conversation, about how many seconds did the AI make you wait for its reply?",
    estWaitPlaceholder: "Enter a number (seconds)",
    submitBtn: "Submit",
    submitting: "Submitting…",
    likert: ["Strongly disagree", "Disagree", "Somewhat disagree", "Neutral", "Somewhat agree", "Agree", "Strongly agree"],
    needConsent: "Please check the consent box before starting.",
    needAllDemo: "Please complete all background questions before continuing.",
    needAllScales: "Some questions are unanswered. Please complete all items before submitting.",
    submitError: "Submission failed. Please check your connection and try again. If it keeps failing, please screenshot this page and contact the researcher.",
    thanksTitle: "Submitted successfully. Thank you!",
    thanksBody:
      "Your responses have been recorded. This is the end of the study. Thank you sincerely for your time and participation.",
    thanksGroup: "Your session ID",
    closeHint: "You may now close this page.",
  },
};

/* ============================================================
   Demographic questions
   ============================================================ */
const DEMOGRAPHICS = [
  {
    id: "age",
    zh: "您的年龄段",
    en: "Age group",
    options: [
      { v: "under18", zh: "18 岁以下", en: "Under 18" },
      { v: "18-24", zh: "18–24 岁", en: "18–24" },
      { v: "25-34", zh: "25–34 岁", en: "25–34" },
      { v: "35-44", zh: "35–44 岁", en: "35–44" },
      { v: "45-54", zh: "45–54 岁", en: "45–54" },
      { v: "55plus", zh: "55 岁及以上", en: "55 or above" },
    ],
  },
  {
    id: "gender",
    zh: "您的性别",
    en: "Gender",
    options: [
      { v: "male", zh: "男", en: "Male" },
      { v: "female", zh: "女", en: "Female" },
      { v: "other", zh: "其他", en: "Other" },
      { v: "na", zh: "不愿透露", en: "Prefer not to say" },
    ],
  },
  {
    id: "education",
    zh: "您的最高学历",
    en: "Highest level of education",
    options: [
      { v: "highschool", zh: "高中及以下", en: "High school or below" },
      { v: "college", zh: "大专", en: "Associate / college" },
      { v: "bachelor", zh: "本科", en: "Bachelor's" },
      { v: "master", zh: "硕士", en: "Master's" },
      { v: "phd", zh: "博士及以上", en: "Doctorate or above" },
    ],
  },
  {
    id: "ai_usage",
    zh: "您平时使用 AI / 在线智能客服的频率",
    en: "How often do you use AI / online customer-service chatbots",
    options: [
      { v: "never", zh: "从不", en: "Never" },
      { v: "rarely", zh: "很少", en: "Rarely" },
      { v: "sometimes", zh: "有时", en: "Sometimes" },
      { v: "often", zh: "经常", en: "Often" },
      { v: "very_often", zh: "非常频繁", en: "Very often" },
    ],
  },
  {
    id: "shopping",
    zh: "您平时网购的频率",
    en: "How often do you shop online",
    options: [
      { v: "rarely", zh: "很少", en: "Rarely" },
      { v: "monthly", zh: "每月几次", en: "A few times a month" },
      { v: "weekly", zh: "每周几次", en: "A few times a week" },
      { v: "daily", zh: "几乎每天", en: "Almost daily" },
    ],
  },
];

/* ============================================================
   Likert scale items (7-point). reverse = reverse-scored.
   construct codes:
   PE = perceived effort/deliberation
   MA = malfunction attribution (reverse)
   RA = response appropriateness
   WA = waiting anxiety
   SA = satisfaction
   MC = manipulation check (speed perception)
   IMC = instructional attention check
   ============================================================ */
const SCALE_ITEMS = [
  { id: "PE1", construct: "PE", reverse: false, zh: "我认为这位 AI 客服在认真处理我的请求。", en: "I think the AI agent processed my request carefully." },
  { id: "PE2", construct: "PE", reverse: false, zh: "这位 AI 客服似乎在仔细思考如何回复我。", en: "The AI agent seemed to think carefully about how to respond to me." },
  { id: "PE3", construct: "PE", reverse: false, zh: "我感觉这位 AI 客服为解决我的问题付出了努力。", en: "I felt the AI agent put effort into solving my problem." },

  { id: "MA1", construct: "MA", reverse: true, zh: "我怀疑这位 AI 客服是不是卡住了或出现了故障。", en: "I suspected the AI agent was stuck or malfunctioning." },
  { id: "MA2", construct: "MA", reverse: true, zh: "回复时的延迟让我觉得系统可能出了问题。", en: "The delay in the reply made me feel the system might be having a problem." },

  { id: "RA1", construct: "RA", reverse: false, zh: "这位 AI 客服的回复速度是恰当的。", en: "The AI agent's response speed was appropriate." },
  { id: "RA2", construct: "RA", reverse: false, zh: "对于这类问题，这样的等待时间是合理的。", en: "For this kind of question, the waiting time was reasonable." },

  { id: "WA1", construct: "WA", reverse: false, zh: "在等待回复的过程中，我感到有些焦虑。", en: "While waiting for the reply, I felt somewhat anxious." },
  { id: "WA2", construct: "WA", reverse: false, zh: "等待回复的过程让我感到有些不耐烦。", en: "Waiting for the reply made me somewhat impatient." },

  { id: "SA1", construct: "SA", reverse: false, zh: "总体而言，我对这次 AI 客服的服务体验感到满意。", en: "Overall, I am satisfied with this AI customer-service experience." },
  { id: "SA2", construct: "SA", reverse: false, zh: "我愿意再次使用这样的 AI 客服。", en: "I would be willing to use such an AI agent again." },

  { id: "MC1", construct: "MC", reverse: false, zh: "我觉得这位 AI 客服的回复速度很慢。", en: "I felt the AI agent's reply was very slow." },

  // Instructional Manipulation Check — correct answer is 1 (Strongly disagree)
  { id: "IMC1", construct: "IMC", reverse: false, isAttention: true, answer: 1, zh: "这是一道注意力检测题，请直接选择最左侧的「非常不同意」。", en: "This is an attention-check question. Please select the leftmost option, \u201cStrongly disagree\u201d." },
];
