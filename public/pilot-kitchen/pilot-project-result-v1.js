/* RID Kitchen C01 customer-facing result panel, independent of simulation. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const safe=v=>String(v??'');
const msg=(text,bad=false)=>{const e=$('ridCustomerProjectStatus');if(e){e.textContent=text;e.style.color=bad?'#a52b28':'#286341';}};
const el=(tag,txt)=>{const e=document.createElement(tag);if(txt!=null)e.textContent=txt;return e;};
function resultPanel(){
 const form=$('prelimFields');if(!form)return;
 const section=form.closest('section');if(!section)return;
 if($('ridCustomerProjectPanel'))return;
 const panel=el('div');panel.id='ridCustomerProjectPanel';panel.style.cssText='border:2px solid #82a894;border-radius:12px;padding:15px;margin:14px 0;background:#f4faf5;line-height:1.6';
 const h=el('h3','Предварительный проект кухни');panel.appendChild(h);
 const p=el('p','Заполните анкету и нажмите кнопку ниже. Ответы будут отправлены в ваш проект RID. Затем появится описание ваших пожеланий и состояние предварительной оценки.');panel.appendChild(p);
 const button=el('button','Сохранить анкету и показать предварительный проект');button.type='button';button.id='ridCustomerProjectSubmit';button.style.cssText='background:#174b30;color:white;padding:12px 16px;border-radius:8px;cursor:pointer';
 const btn2=el('button','Открыть уже сохранённый проект');btn2.type='button';btn2.id='ridCustomerProjectReload';btn2.className='secondary';btn2.style.marginLeft='8px';
 const confirm=el('button','Подтвердить выбранные цели ремонта');confirm.type='button';confirm.id='ridConfirmGoalsBeforeSave';confirm.className='secondary';confirm.style.cssText='display:none;margin:8px 0;background:#b45309;color:white';
 confirm.onclick=()=>confirmGoals().catch(e=>msg('Не удалось подтвердить цели: '+safe(e.message),true));
 const status=el('p','');status.id='ridCustomerProjectStatus';status.setAttribute('role','status');
 const result=el('div');result.id='ridCustomerProjectResult';
 panel.append(button,btn2,confirm,status,result);
 section.insertBefore(panel,form);
 button.onclick=()=>doSubmit().catch(e=>msg('Не удалось сохранить: '+safe(e.message),true));
 btn2.onclick=()=>showSaved().catch(e=>msg('Не удалось открыть проект: '+safe(e.message),true));
}
function detail(root,title,val){const line=el('p');const strong=el('strong',title+': ');line.append(strong,el('span',safe(val)));root.appendChild(line);}
function budgetView(result,root){
 const calc=result?.estimate?.calculation||result?.calculation||null;
 const box=el('div');box.style.cssText='padding:12px;margin:10px 0;border:1px solid #cad8cb;border-radius:8px;background:white';
 box.append(el('h4','Предварительная оценка ремонта'));
 if(!result){box.append(el('p','Расчёт пока недоступен. Анкета сохранена, но это ещё не смета.'));root.append(box);return;}
 const status=result?.estimate?.status||result?.status||'';
 const can=Boolean(result?.estimate?.canIssuePreliminaryEstimate??result?.canIssuePreliminaryEstimate);
 const range=calc?.range;
 const min=Number(range?.min??range?.low??range?.minimum);
 const max=Number(range?.max??range?.high??range?.maximum);
 if(range&&Number.isFinite(min)&&Number.isFinite(max)&&min>=0&&max>=min){
  detail(box,'Предварительный диапазон',new Intl.NumberFormat('en-CA',{style:'currency',currency:calc?.currency||'CAD'}).format(min)+' – '+new Intl.NumberFormat('en-CA',{style:'currency',currency:calc?.currency||'CAD'}).format(max));
 }else box.append(el('p','Проверенный денежный диапазон пока не сформирован. RID не подставляет придуманные цены.'));
 if(!can)box.append(el('p','Для расчёта требуются проверенные сведения и/или ценовая модель. Это не означает, что ваша анкета потеряна.'));
 const blockers=[...(result?.estimate?.blockers||result?.blockers||calc?.blockers||[])].slice(0,8);
 if(blockers.length)detail(box,'Что препятствует расчёту',blockers.join('; '));
 detail(box,'Состояние расчёта',status||'В обработке');
 root.append(box);
}

/* RID_KITCHEN_MARKET_BENCHMARK_2026_V1
  Public 2026 GTA pricing guides, adapted to project C01, for CONTROLLED PILOT ONLY.
  NO change to authoritative rate model, regulator/structural assessment, release gate
  or project database. This is independent reference evidence, not an approved estimate. */
function appendMarketReference(answers,root){
 const box=el('section');box.style.cssText='border:1px solid #a6bac0;background:#f6f8fa;border-radius:10px;padding:15px;margin:18px 0;line-height:1.65';
 const title=el('h3','Рыночный ориентир бюджета · Онтарио, 2026');box.appendChild(title);
 box.append(el('p','Это справочная оценка из опубликованных рыночных диапазонов. Она не является сметой RID, предложением подрядчика или подтверждением возможности изменения стен. Официальный RATE_MODEL_MARKET_ACCURACY_VERIFICATION_REQUIRED остаётся действующим.'));
 const d=answers||{};
 const area=Number(d.approx_area);
 if(!Number.isFinite(area)||area<100||area>150){
  box.append(el('p','Эта сравнительная модель рассчитана на кухню площадью 100–150 кв. футов. Площадь выбранного проекта неизвестна или отличается; автоматически переносить цену нельзя.'));
  root.appendChild(box);return;
 }
 const fmt=n=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(n);
 const floorIsExcluded=d.flooring===false||d.flooring==='false';
 const dishwasherRequested=/посудомо|dishwash/i.test(String(d.desired_changes||'')+' '+String(d.kitchen_renewal_goal||''));
 const rows=[
  ['Планировка, документы, разрешения (базовый объём)',2000,3000],
  ['Демонтаж, защита, вывоз',2000,3000],
  ['Шкафы, поставка и установка',14000,24000],
  ['Столешницы',3000,5000],
  ['Фартук',1500,3000],
  ['Сантехника и подключения (без переносов)',2500,4500],
  ['Электрика и освещение',3000,5500],
  ['Вытяжка и вентиляция',1000,2500],
  ['Отделка и восстановление поверхностей',1500,2500],
  ['Мойка, смеситель, фурнитура',1000,2000],
  ['Организация работ и расходы площадки',7000,12000]
 ];
 if(!floorIsExcluded)rows.splice(8,0,['Пол (при необходимости полной замены)',1500,3000]);
 if(dishwasherRequested)rows.push(['Новая посудомоечная машина: бюджет приобретения, монтаж учтён в сантехнике',800,1800]);
 const table=el('table');table.style.cssText='width:100%;border-collapse:collapse;margin:10px 0;font-size:13px';
 const thead=el('thead'),hrow=el('tr');
 for(const val of ['Вид работ','Нижняя граница','Верхняя граница']){const th=el('th',val);th.style.cssText='border-bottom:1px solid #bac8c5;padding:7px;text-align:left';hrow.appendChild(th);}
 thead.appendChild(hrow);table.appendChild(thead);
 const body=el('tbody');
 for(const [name,low,high] of rows){
  const tr=el('tr');for(const val of [name,fmt(low),fmt(high)]){const td=el('td',val);td.style.cssText='border-bottom:1px solid #d6e1df;padding:7px;vertical-align:top';tr.appendChild(td);}body.appendChild(tr);
 }
 table.appendChild(body);box.appendChild(table);
 const base=rows.reduce((a,row)=>({low:a.low+row[1],high:a.high+row[2]}),{low:0,high:0});
 const fmtPair=(p)=>fmt(p.low)+'–'+fmt(p.high);
 const wallWanted=d.wall_removal===true||d.wall_removal==='true';
 detail(box,'Итого без специального изменения стены, до HST и резерва',fmtPair(base));
 if(wallWanted){
  box.append(el('p','В анкете запрошено изменение стены. Её конструктивная функция неизвестна. Поэтому показаны альтернативы, а не одна утверждённая цена.'));
  const scenarios=[
   ['Вариант A: стена остаётся без структурных изменений',0,0],
   ['Вариант B: ненесущая внутренняя перегородка',1500,4000],
   ['Вариант C: несущая стена, требуется инженерная проверка',10000,25000]
  ];
  for(const [name,l,h] of scenarios){
    const sub={low:base.low+l,high:base.high+h};
    const overallLow=Math.round(sub.low*1.15*1.13/1000)*1000;
    const overallHigh=Math.round(sub.high*1.20*1.13/1000)*1000;
    const row=el('div');row.style.cssText='border-top:1px solid #d5dedc;padding:8px 0';
    row.append(el('strong',name));
    detail(row,'Работы и материалы, до налога',fmtPair(sub));
    detail(row,'С резервом 15–20% и ориентиром HST 13%',fmt(overallLow)+'–'+fmt(overallHigh));
    box.append(row);
  }
  box.append(el('p','Если «раздвинуть стену» означает увеличение контура здания, пристройку или перенос внешней стены, эти диапазоны неприменимы. Требуются отдельная архитектурная и строительная оценка.'));
 }else{
  const low=Math.round(base.low*1.15*1.13/1000)*1000,high=Math.round(base.high*1.20*1.13/1000)*1000;
  detail(box,'Иллюстративный общий резерв с HST (15–20% запас)',fmt(low)+'–'+fmt(high));
 }
 box.append(el('p','Допущения: кухня 100–150 кв. футов, шкафы средней категории, стандартные материалы; стоимость замены всего комплекта техники, сложного переноса коммуникаций и скрытых дефектов не оценена. Количество существующих розеток НЕ считается количеством новых электроточек.'));
 box.append(el('h4','Источники и дата'));
 const sources=[
  ['Route Homes · Стоимость кухни и работ, GTA, сентябрь 2026','https://routehomes.ca/cost-guides/kitchen-renovation-cost/'],
  ['MSD Contracting · GTA, июль 2026','https://www.msdcon.ca/blog/kitchen-renovation-cost-gta-2026'],
  ['Revival Construction · GTA Renovation Cost Guide 2026','https://revivalconstruction.ca/downloads/gta-renovation-cost-guide-2026.pdf'],
  ['Nuance Design Build · перегородки и несущие стены','https://www.nuancedesignbuild.ca/blog/kitchen-renovation-cost-in-toronto-2026-complete-guide'],
  ['Best Buy Canada · ориентиры цены посудомоечной машины','https://www.bestbuy.ca/en-ca/category/dishwashers/34432'],
  ['City of Oshawa · необходимость разрешений','https://www.oshawa.ca/living-here/building-and-renovating/building-permits/']
 ];
 const list=el('ul');for(const [name,url] of sources){const li=el('li'),a=el('a',name);a.href=url;a.target='_blank';a.rel='noopener noreferrer';li.appendChild(a);list.appendChild(li);}box.appendChild(list);
 const graphic=el('div');graphic.style.cssText='border-top:1px solid #c9d5d1;padding-top:10px';
 graphic.append(el('h4','Функциональная схема · не является планом в масштабе'));
 const captions=['Хранение продуктов','Подготовка','Приготовление','Мойка + ПММ','Приём пищи 2–3 человека'];
 const wrap=el('div');wrap.style.cssText='display:flex;flex-wrap:wrap;gap:6px;align-items:center';
 for(let i=0;i<captions.length;i++){
  const item=el('div',captions[i]);item.style.cssText='border-radius:7px;border:1px solid #9cb2ac;padding:8px 10px;background:#fff;font-size:12px;flex:1;min-width:115px;text-align:center';wrap.append(item);
  if(i<captions.length-1){const arrow=el('span','→');arrow.setAttribute('aria-hidden','true');wrap.append(arrow);}
 }
 graphic.append(wrap);
 graphic.append(el('p','Расположение зон, реальные габариты шкафов, точки коммуникаций, проходы и стена должны быть сверены по обмерам и материалам объекта. Дизайн-план и 3D-визуализация готовятся как отдельные концептуальные версии после проверки геометрии.'));
 box.append(graphic);
 root.append(box);
}

function buildProject(answers,sourceName,estData){
 const root=$('ridCustomerProjectResult');if(!root)return;root.replaceChildren();
 root.append(el('h4','Первичный проект — пожелания заказчика'));
 detail(root,'Источник',sourceName);
 detail(root,'Проект',typeof activeProjectId==='string'?activeProjectId:'не выбран');
 const d=answers||{};
 const names={project_motivation:'Причина ремонта',desired_result:'Желаемый результат',primary_use:'Как будет использоваться кухня',current_problem:'Недостатки существующей кухни',must_keep:'Что сохранить',desired_changes:'Желаемые изменения',priority_summary:'Приоритеты',approx_area:'Примерная площадь',intended_scope:'Предполагаемый объём работ',existing_layout_change:'Изменение планировки',kitchen_renewal_goal:'Пожелания к обновлению кухни',appliance_goal:'Бытовая техника',lighting_function_goal:'Освещение',storage_priority:'Хранение',sink_goal:'Мойка',plumbing_change:'Изменения водоснабжения',wall_removal:'Работы со стенами'};
 let n=0;
 for(const [key,value] of Object.entries(d)){if(value==null||value==='')continue;if(n>=36)break;detail(root,names[key]||key,value===true?'Да':value===false?'Нет':value);n++;}
 if(!n)root.append(el('p','В проекте нет сохранённых ответов анкеты. Нажмите «Показать вопросы о кухне», затем заполните и сохраните анкету.'));
 const note=el('p','Это первичное описание, сформированное по вашим ответам. Оно не является архитектурными чертежами, техническим заключением или утверждённой сметой.');note.style.color='#585f58';root.append(note);
 budgetView(estData,root);
 appendMarketReference(d,root);
}
async function readEstimate(){
 try{
  const j=await api('/projects/'+activeProjectId+'/preliminary-estimate',{method:'GET',headers:{'x-role-assignment-id':roleAssignmentId,'x-correlation-id':corr()}});
  return j.data||null;
 }catch(e){msg('Анкета доступна. Предварительная оценка пока не загружена: '+safe(e.message));return null;}
}
async function confirmGoals(){
 const button=$('ridConfirmGoalsBeforeSave');if(button)button.disabled=true;
 try{
  window.RIDKitchenDraft?.saveNow(true);
  if(!activeProjectId||!roleAssignmentId)throw Error('Сначала выберите ваш существующий проект кухни.');
  const j=await api('/projects/'+activeProjectId+'/pilot',{method:'GET',headers:{'x-role-assignment-id':roleAssignmentId}});
  let intent=j.data?.coreIntent;
  if(!intent)throw Error('Сначала создайте набор целей в разделе 3.');
  if(intent.status==='CONFIRMED'){msg('Цели уже подтверждены в RID. Теперь можно сохранять анкету.');button.style.display='none';return;}
  if(intent.status!=='DRAFT'||!intent.intentPackageId)throw Error('Необходимо выбрать и сохранить цели в разделе 3.');
  // Explicit customer action only. Preserve local C01 before reload.
  await intentCommand('CONFIRM_PROJECT_INTENT',{intentPackageId:intent.intentPackageId});
  msg('Цели подтверждены на сервере RID. Сохранённый локальный черновик анкеты можно отправить.');
  button.style.display='none';
 }finally{if(button)button.disabled=false;}
}
async function doSubmit(){
 const b=$('ridCustomerProjectSubmit');if(b)b.disabled=true;
 try{
  if(!activeProjectId||!roleAssignmentId)throw Error('Сначала выберите проект кухни в верхней части страницы.');
  if(!prelimSchema){msg('Загружаем анкету кухни...');await loadPrelim();}
  window.RIDKitchenDraft?.saveNow(false);
  msg('Проверяем выбранные цели ремонта...');
  const intent=(await api('/projects/'+activeProjectId+'/pilot',{method:'GET',headers:{'x-role-assignment-id':roleAssignmentId}})).data?.coreIntent;
  if(intent?.status!=='CONFIRMED'){
    $('ridConfirmGoalsBeforeSave').style.display='';
    msg(intent?.status==='DRAFT'?'Выбранные цели пока только в черновике. Нажмите «Подтвердить выбранные цели ремонта», затем повторите сохранение анкеты. Ваши ответы останутся в браузере.':'Сначала сохраните набор целей в разделе 3, затем подтвердите их. Анкету повторять не нужно.',true);
    return;
  }
  $('ridConfirmGoalsBeforeSave').style.display='none';
  msg('Проверяем заполненные ответы...');
  const preview=await prelim(false);
  const missing=preview?.data?.missing||preview?.data?.missingRequired||[];
  const blockers=preview?.data?.contentBlockers||[];
  if(blockers.length){msg('Анкета требует уточнения: '+blockers.slice(0,3).join('; '),true);return;}
  if(missing.length){msg('Есть незаполненные обязательные вопросы. Ответы сохранены в черновике. Уточните их и повторите.',true);return;}
  msg('Сохраняем ответы на сервере RID...');
  await prelim(true);
  const saved=prelimSchema?.prefilledAnswers||{};
  const estimate=await readEstimate();
  buildProject(saved,'Анкета сохранена в проекте RID',estimate);
  msg('Анкета сохранена на сервере RID. Описание первичного проекта отображается ниже.');
  $('ridCustomerProjectResult')?.scrollIntoView({behavior:'smooth',block:'nearest'});
 }catch(e){msg('Сохранение не подтверждено: '+safe(e.message)+'. Текущий черновик сохраняется в браузере.',true);}finally{if(b)b.disabled=false;}
}
async function showSaved(){
 if(!activeProjectId||!roleAssignmentId)throw Error('Сначала откройте свой проект кухни.');
 msg('Загружаем сохранённые сведения...');
 await loadPrelim();
 const saved=prelimSchema?.prefilledAnswers||{};
 const estimate=await readEstimate();
 buildProject(saved,'Сведения из проекта RID',estimate);
 msg(Object.keys(saved).length?'Сохранённые сведения проекта загружены.':'На сервере пока нет отправленной анкеты; неотправленные ответы остаются локальным черновиком.');
 $('ridCustomerProjectResult')?.scrollIntoView({behavior:'smooth',block:'nearest'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',resultPanel,{once:true});else resultPanel();
})();