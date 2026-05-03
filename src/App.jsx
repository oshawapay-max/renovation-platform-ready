
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Camera,
  CheckCircle,
  ClipboardCheck,
  DollarSign,
  Hammer,
  Home,
  Languages,
  LineChart,
  MessageCircle,
  ShieldCheck,
  Target,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import "./styles.css";

const copy = {
  en: {
    navOpportunity: "Opportunity",
    navModel: "Business model",
    navExample: "Example",
    navRoadmap: "Roadmap",
    lang: "RU",
    badge: "Ontario, Canada • Partner Demo",
    heroTitle: "Renovation diagnostics before money is wasted.",
    heroText:
      "A partner-ready MVP concept for turning unclear renovation projects into structured estimates, contractor matching, milestone control, and measurable revenue.",
    primary: "Discuss Partnership",
    secondary: "View Business Case",
    proof1: "Manual-first MVP",
    proof2: "Investor + homeowner market",
    proof3: "Contractor network opportunity",
    heroMetric1: "Sample project budget",
    heroMetric2: "Platform revenue potential",
    heroMetric3: "Target project profit",
    opportunityTitle: "The market problem is not lack of contractors. It is lack of control.",
    opportunityText:
      "Homeowners and small investors often start renovation decisions without reliable diagnostics, real cost ranges, verified teams, or project control. The result is budget overruns, delays, and lost profit.",
    problem1: "Unclear scope before work starts",
    problem2: "Contractor quality is hard to verify",
    problem3: "Budgets change after the client is already committed",
    solutionTitle: "The platform becomes the control layer between client, estimate, and execution.",
    solution1: "Diagnostics and intake",
    solution2: "Estimate and risk review",
    solution3: "Contractor matching",
    solution4: "Milestone tracking",
    modelTitle: "Simple business model for first validation",
    modelText:
      "The first version does not need a complex marketplace. It can operate manually with real inspections, controlled contractor relationships, and revenue from assessment, project management, and contractor coordination.",
    revenue1: "Diagnostic fee",
    revenue2: "Project management fee",
    revenue3: "Contractor coordination margin",
    partnerTitle: "Why this is a partner opportunity",
    partnerText:
      "The business can start lean: validate 3–5 real projects, build contractor relationships, document outcomes, then scale into software.",
    partnerPoint1: "Low initial technical complexity",
    partnerPoint2: "Real local market pain",
    partnerPoint3: "Clear path from service business to platform",
    executionBadge: "Execution layer",
    executionTitle: "Real contractors. Controlled execution.",
    executionText: "The platform connects renovation projects with verified contractors and keeps control over execution, timelines, and budget.",
    executionPoint1: "Verified contractor network",
    executionPoint2: "Project tracking and control",
    executionPoint3: "Risk reduction through structured workflow",
    resultBadge: "End result",
    resultTitle: "From construction site to market-ready property.",
    resultText: "Distressed or unclear renovation projects become high-quality, market-ready homes with predictable outcomes and clear financial logic.",
    resultPoint1: "Higher resale value",
    resultPoint2: "Faster project completion",
    resultPoint3: "Improved investor returns",
    exampleTitle: "Real Project Example",
    exampleText:
      "A client has a property that needs renovation but does not know the real cost, risks, or timeline. The platform converts uncertainty into a clear project plan.",
    before: "Before",
    after: "After",
    estRenovation: "Estimated renovation",
    timeline: "Timeline",
    revenue: "Platform revenue",
    stepsTitle: "How the first version works",
    step1: "Client submits project",
    step2: "Manual diagnostic review",
    step3: "Estimate and project plan",
    step4: "Contractor matching",
    step5: "Milestone control",
    roadmapTitle: "MVP roadmap",
    roadmapText:
      "The goal is not to build everything first. The goal is to prove demand, process, economics, and partner roles.",
    phase1: "Phase 1",
    phase1Text: "Partner demo, landing page, intake form, manual review.",
    phase2: "Phase 2",
    phase2Text: "First 3–5 real renovation cases, contractor testing, case studies.",
    phase3: "Phase 3",
    phase3Text: "Client dashboard, contractor profiles, estimate logic, automation.",
    ctaTitle: "Ready to validate the first renovation cases?",
    ctaText:
      "The next step is to use this demo as a conversation tool with a potential partner, then define roles, first clients, and a simple operating process.",
    ctaButton: "Start partner discussion",
    formName: "Name",
    formContact: "Email or phone",
    formMessage: "Message / project type",
    formSubmit: "Send request"
  },
  ru: {
    navOpportunity: "Возможность",
    navModel: "Модель",
    navExample: "Пример",
    navRoadmap: "План",
    lang: "EN",
    badge: "Онтарио, Канада • Версия для партнёра",
    heroTitle: "Диагностика ремонта до того, как деньги потрачены впустую.",
    heroText:
      "Партнёрская MVP-концепция: превращаем непонятный ремонт в понятную смету, подбор подрядчиков, контроль этапов и измеримую выручку.",
    primary: "Обсудить партнёрство",
    secondary: "Посмотреть бизнес-кейс",
    proof1: "MVP через ручной процесс",
    proof2: "Рынок инвесторов и владельцев жилья",
    proof3: "Возможность сети подрядчиков",
    heroMetric1: "Бюджет примера",
    heroMetric2: "Потенциальная выручка платформы",
    heroMetric3: "Целевая прибыль проекта",
    opportunityTitle: "Проблема рынка не в отсутствии подрядчиков. Проблема — в отсутствии контроля.",
    opportunityText:
      "Владельцы жилья и небольшие инвесторы часто начинают ремонт без диагностики, понятной стоимости, проверенной команды и контроля процесса. Итог — перерасход, задержки и потеря прибыли.",
    problem1: "Непонятный объём работ до старта",
    problem2: "Сложно проверить качество подрядчика",
    problem3: "Бюджет меняется, когда клиент уже вовлечён",
    solutionTitle: "Платформа становится слоем контроля между клиентом, сметой и выполнением.",
    solution1: "Диагностика и заявка",
    solution2: "Смета и проверка рисков",
    solution3: "Подбор подрядчиков",
    solution4: "Контроль этапов",
    modelTitle: "Простая бизнес-модель для первой проверки",
    modelText:
      "На первом этапе не нужен сложный маркетплейс. Можно работать вручную: реальные осмотры, контролируемые подрядчики и доход от оценки, управления проектом и координации работ.",
    revenue1: "Оплата диагностики",
    revenue2: "Комиссия за управление проектом",
    revenue3: "Маржа на координации подрядчиков",
    partnerTitle: "Почему это партнёрская возможность",
    partnerText:
      "Бизнес можно запустить lean-подходом: проверить 3–5 реальных проектов, выстроить подрядчиков, зафиксировать кейсы и затем масштабировать в software-платформу.",
    partnerPoint1: "Низкая техническая сложность на старте",
    partnerPoint2: "Реальная локальная боль рынка",
    partnerPoint3: "Путь от сервиса к платформе",
    executionBadge: "Слой выполнения",
    executionTitle: "Реальные подрядчики. Контролируемое выполнение.",
    executionText: "Платформа связывает renovation-проекты с проверенными подрядчиками и сохраняет контроль над сроками, бюджетом и этапами работ.",
    executionPoint1: "Проверенная сеть подрядчиков",
    executionPoint2: "Контроль проекта и этапов",
    executionPoint3: "Снижение рисков через структурированный процесс",
    resultBadge: "Финальный результат",
    resultTitle: "От стройки к объекту, готовому для рынка.",
    resultText: "Проблемные или непонятные renovation-проекты превращаются в качественные, готовые для рынка объекты с понятной экономикой.",
    resultPoint1: "Рост стоимости объекта",
    resultPoint2: "Более быстрый срок завершения",
    resultPoint3: "Улучшение доходности инвестора",
    exampleTitle: "Пример реального проекта",
    exampleText:
      "Клиент имеет объект для ремонта, но не понимает реальную стоимость, риски и сроки. Платформа превращает неопределённость в понятный план проекта.",
    before: "До",
    after: "После",
    estRenovation: "Оценка ремонта",
    timeline: "Срок",
    revenue: "Выручка платформы",
    stepsTitle: "Как работает первая версия",
    step1: "Клиент оставляет заявку",
    step2: "Ручная диагностика",
    step3: "Смета и план проекта",
    step4: "Подбор подрядчиков",
    step5: "Контроль этапов",
    roadmapTitle: "План MVP",
    roadmapText:
      "Цель — не построить всё сразу. Цель — доказать спрос, процесс, экономику и роли партнёров.",
    phase1: "Этап 1",
    phase1Text: "Демо для партнёра, landing page, форма заявки, ручной разбор.",
    phase2: "Этап 2",
    phase2Text: "Первые 3–5 реальных кейсов, тест подрядчиков, case studies.",
    phase3: "Этап 3",
    phase3Text: "Кабинет клиента, профили подрядчиков, логика сметы, автоматизация.",
    ctaTitle: "Готовы проверить первые renovation-кейсы?",
    ctaText:
      "Следующий шаг — использовать сайт как инструмент разговора с партнёром, затем определить роли, первых клиентов и простой операционный процесс.",
    ctaButton: "Начать партнёрский разговор",
    formName: "Имя",
    formContact: "Email или телефон",
    formMessage: "Сообщение / тип проекта",
    formSubmit: "Отправить заявку"
  }
};

function Button({ children, variant = "primary" }) {
  return <button className={`btn ${variant}`}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export default function App() {
  const [lang, setLang] = useState("en");
  const t = copy[lang];

  const problemItems = [t.problem1, t.problem2, t.problem3];
  const solutionItems = [
    [ClipboardCheck, t.solution1],
    [BarChart3, t.solution2],
    [Users, t.solution3],
    [ShieldCheck, t.solution4],
  ];
  const revenues = [
    [DollarSign, t.revenue1],
    [LineChart, t.revenue2],
    [Hammer, t.revenue3],
  ];
  const steps = [t.step1, t.step2, t.step3, t.step4, t.step5];

  return (
    <div className="site">
      <header className="header">
        <div className="container nav">
          <div className="logo">
            <span><Hammer size={18} /></span>
            Renovation Platform
          </div>
          <nav>
            <a href="#opportunity">{t.navOpportunity}</a>
            <a href="#model">{t.navModel}</a>
            <a href="#example">{t.navExample}</a>
            <a href="#roadmap">{t.navRoadmap}</a>
          </nav>
          <button className="lang" onClick={() => setLang(lang === "en" ? "ru" : "en")}>
            <Languages size={16} /> {t.lang}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="container heroGrid">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="badge">{t.badge}</div>
            <h1>{t.heroTitle}</h1>
            <p className="lead">{t.heroText}</p>
            <div className="proofs">
              <span><CheckCircle size={18}/>{t.proof1}</span>
              <span><CheckCircle size={18}/>{t.proof2}</span>
              <span><CheckCircle size={18}/>{t.proof3}</span>
            </div>
            <div className="actions">
              <Button>{t.primary} <ArrowRight size={18}/></Button>
              <Button variant="secondary">{t.secondary}</Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }}>
            <div className="visualBoard">
              <div className="photoCard photoBefore">
                <span>{t.before}</span>
              </div>
              <div className="photoCard photoAfter">
                <span>{t.after}</span>
              </div>
              <Card className="metricPanel">
                <div><small>{t.heroMetric1}</small><strong>$60,000</strong></div>
                <div><small>{t.heroMetric2}</small><strong>$10.3K</strong></div>
                <div><small>{t.heroMetric3}</small><strong>~$8K</strong></div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="opportunity" className="section">
        <div className="container twoCol">
          <div>
            <div className="eyebrow">Market problem</div>
            <h2>{t.opportunityTitle}</h2>
            <p>{t.opportunityText}</p>
          </div>
          <div className="problemList">
            {problemItems.map((item) => (
              <Card key={item} className="problemItem">
                <Target size={22}/>
                <span>{item}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="container">
          <div className="sectionHead">
            <div className="eyebrow">Solution</div>
            <h2>{t.solutionTitle}</h2>
          </div>
          <div className="fourGrid">
            {solutionItems.map(([Icon, text], index) => (
              <Card key={text}>
                <div className="icon"><Icon size={24}/></div>
                <strong>{`0${index + 1}`}</strong>
                <p>{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="model" className="section">
        <div className="container twoCol">
          <div>
            <div className="eyebrow">Business model</div>
            <h2>{t.modelTitle}</h2>
            <p>{t.modelText}</p>
          </div>
          <Card className="revenueCard">
            {revenues.map(([Icon, text]) => (
              <div key={text}>
                <Icon size={24}/>
                <span>{text}</span>
              </div>
            ))}
          </Card>
        </div>
      </section>

      <section className="section dark">
        <div className="container twoCol">
          <div>
            <div className="eyebrow light">Partner logic</div>
            <h2>{t.partnerTitle}</h2>
            <p>{t.partnerText}</p>
          </div>
          <div className="partnerPoints">
            {[t.partnerPoint1, t.partnerPoint2, t.partnerPoint3].map((item) => (
              <div key={item}><CheckCircle size={20}/><span>{item}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section id="example" className="section white">
        <div className="container twoCol">
          <div>
            <div className="eyebrow">{t.exampleTitle}</div>
            <h2>{t.exampleText}</h2>
            <div className="stats">
              <div><small>{t.estRenovation}</small><strong>$60,000</strong></div>
              <div><small>{t.timeline}</small><strong>6–8 weeks</strong></div>
              <div><small>{t.revenue}</small><strong>$10.3K</strong></div>
            </div>
          </div>
          <Card className="beforeAfter">
            <div className="ba before"><span>{t.before}</span></div>
            <div className="ba after"><span>{t.after}</span></div>
          </Card>
        </div>
      </section>

      <section className="section">
        <div className="container twoCol">
          <div>
            <div className="eyebrow">{t.executionBadge}</div>
            <h2>{t.executionTitle}</h2>
            <p>{t.executionText}</p>
            <ul className="bulletList">
              <li>{t.executionPoint1}</li>
              <li>{t.executionPoint2}</li>
              <li>{t.executionPoint3}</li>
            </ul>
          </div>
          <div className="imageCard">
            <img src="/images/contractor.jpg" alt="Contractor working inside a home" />
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="container twoCol">
          <div className="imageCard">
            <img src="/images/after-2.jpg" alt="Finished renovated interior" />
          </div>
          <div>
            <div className="eyebrow">{t.resultBadge}</div>
            <h2>{t.resultTitle}</h2>
            <p>{t.resultText}</p>
            <ul className="bulletList">
              <li>{t.resultPoint1}</li>
              <li>{t.resultPoint2}</li>
              <li>{t.resultPoint3}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <div className="eyebrow">Workflow</div>
            <h2>{t.stepsTitle}</h2>
          </div>
          <div className="steps">
            {steps.map((step, index) => (
              <Card key={step} className="step">
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="roadmap" className="section white">
        <div className="container">
          <div className="sectionHead">
            <div className="eyebrow">Roadmap</div>
            <h2>{t.roadmapTitle}</h2>
            <p>{t.roadmapText}</p>
          </div>
          <div className="threeGrid">
            <Card><strong>{t.phase1}</strong><p>{t.phase1Text}</p></Card>
            <Card><strong>{t.phase2}</strong><p>{t.phase2Text}</p></Card>
            <Card><strong>{t.phase3}</strong><p>{t.phase3Text}</p></Card>
          </div>
        </div>
      </section>

      <section className="section ctaSection">
        <div className="container ctaGrid">
          <div>
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaText}</p>
            <Button>{t.ctaButton}</Button>
          </div>
          <Card className="formCard">
            <input placeholder={t.formName}/>
            <input placeholder={t.formContact}/>
            <textarea placeholder={t.formMessage}/>
            <div className="upload"><Upload size={18}/> Upload project photos later</div>
            <Button>{t.formSubmit}</Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
