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
 const status=el('p','');status.id='ridCustomerProjectStatus';status.setAttribute('role','status');
 const result=el('div');result.id='ridCustomerProjectResult';
 panel.append(button,btn2,status,result);
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
}
async function readEstimate(){
 try{
  const j=await api('/projects/'+activeProjectId+'/preliminary-estimate',{method:'GET',headers:{'x-role-assignment-id':roleAssignmentId,'x-correlation-id':corr()}});
  return j.data||null;
 }catch(e){msg('Анкета доступна. Предварительная оценка пока не загружена: '+safe(e.message));return null;}
}
async function doSubmit(){
 const b=$('ridCustomerProjectSubmit');if(b)b.disabled=true;
 try{
  if(!activeProjectId||!roleAssignmentId)throw Error('Сначала выберите проект кухни в верхней части страницы.');
  if(!prelimSchema){msg('Загружаем анкету кухни...');await loadPrelim();}
  window.RIDKitchenDraft?.saveNow(false);
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