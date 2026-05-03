import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Hammer,
  ClipboardCheck,
  Users,
  BarChart3,
  ShieldCheck,
  Upload,
  Home,
  ArrowRight,
  Star,
  MessageCircle,
  Building2,
  Languages,
  Camera,
  TrendingUp,
} from "lucide-react";

const copy = {
  en: {
    navHow: "How it works",
    navEstimate: "Get Estimate",
    navDashboard: "Dashboard",
    navContractors: "Contractors",
    start: "Start Project",
    badge: "Ontario, Canada • Renovation-as-a-Service",
    heroTitle: "Renovation clarity before you spend money.",
    heroText:
      "Built for investors and homeowners who need real renovation costs, trusted contractors, and full control before starting work.",
    ctaEstimate: "Get Renovation Estimate",
    ctaHow: "See How It Works",
    investorLine: "Used by investors to increase ROI and reduce risk",
    homeownerLine: "Used by homeowners to avoid budget overruns",
    snapshot: "Project Snapshot",
    active: "Active",
    estimatedRenovation: "Estimated renovation",
    platformRevenue: "Platform revenue",
    targetProfit: "Target profit",
    snapshotNote: "Diagnostics completed. Estimate and contractor matching in progress.",
    whoTitle: "Built for investors and homeowners",
    whoText:
      "One platform, two core audiences: investors who need predictable numbers, and homeowners who need a safe renovation process.",
    investors: "Investors",
    investorsText: "Flip, rental and distressed property renovation planning.",
    homeowners: "Homeowners",
    homeownersText: "Repair, upgrade and manage home renovation with clarity.",
    howTitle: "How it works",
    howText: "A simple workflow designed to reduce risk, create transparency and control renovation delivery.",
    estimateTitle: "Get an estimate",
    estimateText:
      "Start with a simple request. The MVP focuses on real project intake and manual expert review.",
    benefit1: "Clear project scope",
    benefit2: "Diagnostics-based estimate",
    benefit3: "Verified contractor matching",
    benefit4: "Milestone control",
    fullName: "Full name",
    contact: "Email or phone",
    address: "Property address / area",
    describe: "Describe the renovation or problem",
    upload: "Upload photos or videos",
    submit: "Submit Request",
    investorToggle: "I am an investor",
    dashboardTitle: "Project dashboard",
    dashboardText: "The client sees budget, milestones, documents and progress in one place.",
    sample: "View sample project",
    status: "Status",
    budget: "Budget",
    timeline: "Timeline",
    contractors: "Contractors",
    estimateReview: "Estimate Review",
    matched: "3 matched",
    verifiedTitle: "Verified contractors",
    verifiedText: "The MVP uses a controlled contractor network instead of an open marketplace.",
    leadTitle: "Lead processing logic",
    lead1: "All users submit project requests",
    lead2: "Investor vs homeowner classification",
    lead3: "High-value projects processed first",
    readyTitle: "Ready to validate the first projects?",
    readyText:
      "The MVP focuses on the first 3–5 real renovation cases before building a complex marketplace.",
    startEstimate: "Start with first estimate",
    manual: "Manual-first approach",
    manualText: "No-code workflow, real inspections, real estimates.",
    trust: "Trust before scale",
    trustText: "Controlled contractors, milestone tracking and quality checks.",
    visualTitle: "Visual layer",
    visualText: "Real renovation visuals can be added later; this MVP uses clean startup graphics and construction-style UI."
  },
  ru: {
    navHow: "Как работает",
    navEstimate: "Получить оценку",
    navDashboard: "Кабинет проекта",
    navContractors: "Подрядчики",
    start: "Начать проект",
    badge: "Онтарио, Канада • Renovation-as-a-Service",
    heroTitle: "Понимание ремонта до того, как вы тратите деньги.",
    heroText:
      "Для инвесторов и владельцев: реальная стоимость ремонта, проверенные подрядчики и полный контроль до начала работ.",
    ctaEstimate: "Получить оценку ремонта",
    ctaHow: "Посмотреть процесс",
    investorLine: "Используется инвесторами для увеличения прибыли и снижения рисков",
    homeownerLine: "Используется владельцами для избежания перерасхода",
    snapshot: "Карточка проекта",
    active: "Активен",
    estimatedRenovation: "Оценка ремонта",
    platformRevenue: "Доход платформы",
    targetProfit: "Целевая прибыль",
    snapshotNote: "Диагностика завершена. Смета и подбор подрядчиков в процессе.",
    whoTitle: "Для инвесторов и владельцев жилья",
    whoText:
      "Одна платформа для двух ключевых аудиторий: инвесторов, которым нужны понятные цифры, и владельцев, которым нужен безопасный ремонт.",
    investors: "Инвесторы",
    investorsText: "Flip, rental и проблемные объекты с прогнозируемым бюджетом.",
    homeowners: "Владельцы жилья",
    homeownersText: "Ремонт, обновление и управление проектом с прозрачностью.",
    howTitle: "Как это работает",
    howText: "Простой процесс, который снижает риски, даёт прозрачность и контроль реновации.",
    estimateTitle: "Получить оценку",
    estimateText:
      "Начните с простой заявки. MVP делает фокус на реальных проектах и ручной экспертной проверке.",
    benefit1: "Понятный объём работ",
    benefit2: "Смета на основе диагностики",
    benefit3: "Подбор проверенных подрядчиков",
    benefit4: "Контроль этапов",
    fullName: "Имя и фамилия",
    contact: "Email или телефон",
    address: "Адрес / район объекта",
    describe: "Опишите ремонт или проблему",
    upload: "Загрузить фото или видео",
    submit: "Отправить заявку",
    investorToggle: "Я инвестор",
    dashboardTitle: "Кабинет проекта",
    dashboardText: "Клиент видит бюджет, этапы, документы и прогресс в одном месте.",
    sample: "Посмотреть пример проекта",
    status: "Статус",
    budget: "Бюджет",
    timeline: "Сроки",
    contractors: "Подрядчики",
    estimateReview: "Проверка сметы",
    matched: "3 подобраны",
    verifiedTitle: "Проверенные подрядчики",
    verifiedText: "На старте используется контролируемая сеть подрядчиков, а не открытый маркетплейс.",
    leadTitle: "Логика обработки заявок",
    lead1: "Все пользователи отправляют заявки",
    lead2: "Классификация: инвестор или владелец",
    lead3: "Приоритет получают проекты с высокой ценностью",
    readyTitle: "Готовы проверить первые проекты?",
    readyText:
      "MVP фокусируется на первых 3–5 реальных кейсах до создания сложного маркетплейса.",
    startEstimate: "Начать с первой оценки",
    manual: "Сначала ручной процесс",
    manualText: "No-code workflow, реальные осмотры и реальные сметы.",
    trust: "Доверие перед масштабом",
    trustText: "Контролируемые подрядчики, этапы и проверка качества.",
    visualTitle: "Визуальный стиль",
    visualText: "Реальные фото можно добавить позже; MVP использует чистую startup-графику и строительный стиль."
  },
};

function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button className={`btn ${variant === "outline" ? "btn-outline" : "btn-primary"} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export default function RenovationPlatformMVP() {
  const [lang, setLang] = useState("en");
  const [projectType, setProjectType] = useState("Investment / Flip");
  const [isInvestor, setIsInvestor] = useState(false);
  const t = copy[lang];

  const steps = [
    { icon: Home, title: lang === "en" ? "Submit Property" : "Заявка по объекту", text: lang === "en" ? "Upload property details, photos, and renovation goals." : "Загрузите данные объекта, фото и цели ремонта." },
    { icon: ClipboardCheck, title: lang === "en" ? "Diagnostics" : "Диагностика", text: lang === "en" ? "We inspect the property and define the real scope of work." : "Мы осматриваем объект и определяем реальный объём работ." },
    { icon: BarChart3, title: lang === "en" ? "Estimate" : "Смета", text: lang === "en" ? "You receive a clear budget, timeline, and project roadmap." : "Вы получаете понятный бюджет, сроки и дорожную карту." },
    { icon: Hammer, title: lang === "en" ? "Execution" : "Выполнение", text: lang === "en" ? "Verified contractors complete the work under structured control." : "Проверенные подрядчики выполняют работы под контролем." },
    { icon: ShieldCheck, title: lang === "en" ? "Quality Control" : "Контроль качества", text: lang === "en" ? "Final inspection, documentation, and project completion." : "Финальная проверка, документы и закрытие проекта." },
  ];

  const contractors = [
    { name: lang === "en" ? "General Contractor" : "Генеральный подрядчик", rating: "4.9", tag: lang === "en" ? "Full renovation" : "Полная реновация" },
    { name: lang === "en" ? "Licensed Electrician" : "Лицензированный электрик", rating: "4.8", tag: lang === "en" ? "Electrical work" : "Электрика" },
    { name: lang === "en" ? "Plumbing Specialist" : "Специалист по сантехнике", rating: "4.7", tag: lang === "en" ? "Plumbing / fixtures" : "Сантехника" },
  ];

  const projectTypes = lang === "en" ? ["Investment / Flip", "Rental", "Home Repair"] : ["Инвестиция / Flip", "Аренда", "Домашний ремонт"];

  return (
    <div className="site">
      <header className="header">
        <div className="container nav">
          <div className="logo">
            <div className="logo-icon"><Hammer size={20} /></div>
            Renovation Platform
          </div>
          <nav className="nav-links">
            <a href="#how">{t.navHow}</a>
            <a href="#estimate">{t.navEstimate}</a>
            <a href="#dashboard">{t.navDashboard}</a>
            <a href="#contractors">{t.navContractors}</a>
          </nav>
          <div className="nav-actions">
            <button onClick={() => setLang(lang === "en" ? "ru" : "en")} className="language-btn">
              <Languages size={16} /> {lang === "en" ? "RU" : "EN"}
            </button>
            <Button>{t.start}</Button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-pattern" />
        <div className="container hero-grid">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="badge">{t.badge}</div>
            <h1>{t.heroTitle}</h1>
            <p className="hero-text">{t.heroText}</p>
            <div className="strategic-lines">
              <div><TrendingUp size={20} /> {t.investorLine}</div>
              <div><ShieldCheck size={20} /> {t.homeownerLine}</div>
            </div>
            <div className="hero-buttons">
              <Button>{t.ctaEstimate} <ArrowRight size={18} /></Button>
              <Button variant="outline">{t.ctaHow}</Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <Card className="snapshot-card">
              <div className="snapshot-head">
                <h3>{t.snapshot}</h3>
                <span>{t.active}</span>
              </div>
              <div className="metric big">
                <small>{t.estimatedRenovation}</small>
                <strong>$60,000</strong>
              </div>
              <div className="metrics-grid">
                <div className="metric"><small>{t.platformRevenue}</small><strong>$10.3K</strong></div>
                <div className="metric"><small>{t.targetProfit}</small><strong>~$8K</strong></div>
              </div>
              <div className="progress"><div /></div>
              <p>{t.snapshotNote}</p>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{t.whoTitle}</h2>
            <p>{t.whoText}</p>
          </div>
          <div className="three-grid">
            <Card><Building2 className="accent" size={34} /><h3>{t.investors}</h3><p>{t.investorsText}</p></Card>
            <Card><Home className="accent" size={34} /><h3>{t.homeowners}</h3><p>{t.homeownersText}</p></Card>
            <Card className="dark-card"><Camera size={34} /><h3>{t.visualTitle}</h3><p>{t.visualText}</p></Card>
          </div>
        </div>
      </section>

      <section id="how" className="section">
        <div className="container">
          <div className="section-head">
            <h2>{t.howTitle}</h2>
            <p>{t.howText}</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title}>
                  <div className="step-icon"><Icon size={22} /></div>
                  <div className="step-number">Step {index + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="estimate" className="section white">
        <div className="container two-grid">
          <div>
            <h2>{t.estimateTitle}</h2>
            <p>{t.estimateText}</p>
            <div className="benefits">
              {[t.benefit1, t.benefit2, t.benefit3, t.benefit4].map((item) => (
                <div key={item}><CheckCircle size={20} /> <span>{item}</span></div>
              ))}
            </div>
          </div>

          <Card className="form-card">
            <input placeholder={t.fullName} />
            <input placeholder={t.contact} />
            <input placeholder={t.address} />
            <div className="project-types">
              {projectTypes.map((type) => (
                <button key={type} onClick={() => setProjectType(type)} className={projectType === type ? "selected" : ""}>
                  {type}
                </button>
              ))}
            </div>
            <label className="investor-check">
              <input type="checkbox" checked={isInvestor} onChange={() => setIsInvestor(!isInvestor)} />
              {t.investorToggle}
            </label>
            <textarea placeholder={t.describe} />
            <div className="upload"><Upload /> {t.upload}</div>
            <Button className="full">{t.submit}</Button>
          </Card>
        </div>
      </section>

      <section className="section white">
        <div className="container">
          <div className="section-head">
            <h2>{t.leadTitle}</h2>
            <p>{lang === "en" ? "The site captures both audiences, while the business prioritizes higher-value opportunities." : "Сайт принимает обе аудитории, а бизнес приоритизирует более ценные заявки."}</p>
          </div>
          <div className="three-grid">
            <Card><h3>1. Input</h3><p>{t.lead1}</p></Card>
            <Card><h3>2. Segmentation</h3><p>{t.lead2}</p></Card>
            <Card><h3>3. Priority</h3><p>{t.lead3}</p></Card>
          </div>
        </div>
      </section>

      <section id="dashboard" className="section">
        <div className="container">
          <div className="section-head row">
            <div>
              <h2>{t.dashboardTitle}</h2>
              <p>{t.dashboardText}</p>
            </div>
            <Button variant="outline">{t.sample}</Button>
          </div>
          <Card className="dashboard-card">
            <div className="dashboard-metrics">
              <div><small>{t.status}</small><strong>{t.estimateReview}</strong></div>
              <div><small>{t.budget}</small><strong>$60,000</strong></div>
              <div><small>{t.timeline}</small><strong>6–8 weeks</strong></div>
              <div><small>{t.contractors}</small><strong>{t.matched}</strong></div>
            </div>
            <div className="milestones">
              {steps.map((stage, index) => (
                <div key={stage.title}>
                  <span className={index < 3 ? "done" : ""} />
                  <strong>{stage.title}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section id="contractors" className="section white">
        <div className="container">
          <div className="section-head">
            <h2>{t.verifiedTitle}</h2>
            <p>{t.verifiedText}</p>
          </div>
          <div className="three-grid">
            {contractors.map((contractor) => (
              <Card key={contractor.name}>
                <div className="step-icon"><Users size={24} /></div>
                <h3>{contractor.name}</h3>
                <p>{contractor.tag}</p>
                <div className="rating"><Star size={18} /> <strong>{contractor.rating}</strong> verified rating</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Card className="cta-card">
            <div>
              <h2>{t.readyTitle}</h2>
              <p>{t.readyText}</p>
              <Button>{t.startEstimate}</Button>
            </div>
            <div className="cta-points">
              <div><MessageCircle /><strong>{t.manual}</strong><span>{t.manualText}</span></div>
              <div><ShieldCheck /><strong>{t.trust}</strong><span>{t.trustText}</span></div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}