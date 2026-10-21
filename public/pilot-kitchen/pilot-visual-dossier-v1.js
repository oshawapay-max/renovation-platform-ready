/* RID Kitchen Customer Visual Dossier v1
   Works only inside authenticated Kitchen pilot project.
   Keeps unverified C01/metadata leads separate from explicit owner observations.
   Doesn't activate AI inference, promote technical authority, or change budget.
   User-confirmed report is registered via existing PRIVATE evidence API. */
(function(){
"use strict";
const VERSION="RID_KITCHEN_OWNER_VISUAL_DOSSIER_v1";
const PREFIX="rid:kitchen:visual-dossier:v1:";
const $=id=>document.getElementById(id);
const CATS={
 ROOM_OVERVIEW:"Общий обзор кухни",WALL:"Стены",PLUMBING_SINK:"Мойка / сантехника",
 ELECTRICAL_ROOM:"Электрика / розетки",ELECTRICAL_PANEL:"Электрощит",
 RANGE_VENTILATION:"Вытяжка / вентиляция",FLOOR:"Пол",CEILING:"Потолок",
 CABINETRY:"Шкафы / мебель",APPLIANCE:"Кухонная техника",MEASUREMENT:"Измерения",
 UNKNOWN_CONDITION:"Неизвестное условие",OTHER:"Другой материал"
};
let state={projectId:null,userId:null,evidence:[],answers:{},notes:{},checks:{},savedRecord:null,pending:null};
let saving=false;
const mk=(tag,text,css)=>{
 const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);
 if(css)e.style.cssText=css;return e;
};
const isProject=()=>state.projectId&&activeProjectId===state.projectId&&roleAssignmentId;
const status=(str,bad=false)=>{
 const e=$("ridDossierStatus");if(e){e.textContent=str;e.style.color=bad?"#a32d2a":"#2b6842";}
};
const key=()=>state.userId&&state.projectId?PREFIX+state.userId+":"+state.projectId:null;
function readLocal(){
 const k=key();if(!k)return;
 try{const d=JSON.parse(localStorage.getItem(k)||"null");if(d?.version!==VERSION)return;
  state.notes=d.notes&&typeof d.notes==="object"?d.notes:{};
  state.checks=d.checks&&typeof d.checks==="object"?d.checks:{};
  state.savedRecord=d.savedRecord||null;
  state.pending=d.pending||null;
 }catch{}
}
function writeLocal(show=false){
 const k=key();if(!k)return false;
 try{
  localStorage.setItem(k,JSON.stringify({version:VERSION,savedAt:new Date().toISOString(),notes:state.notes,checks:state.checks,savedRecord:state.savedRecord,pending:state.pending}));
  if(show)status("Черновик карты обследования сохранён на этом компьютере. Он не заменяет регистрацию отчёта в RID.");
  return true;
 }catch{
  status("Не удаётся сохранить локальный черновик. Не закрывайте вкладку до регистрации отчёта в RID.",true);
  return false;
 }
}
function makeUI(){
 if($("ridDossier"))return;
 const anchor=$("ridVisualEvidence")||$("ridProjectEvidence")||$("evidenceStatus");
 if(!anchor)return;
 const root=mk("section");root.id="ridDossier";root.style.cssText="margin:18px 0;background:#f0f6f3;border:2px solid #78a187;padding:17px;border-radius:12px;line-height:1.6";
 root.append(mk("h3","Карта обследования: факты, фотографии и варианты кухни"));
 root.append(mk("p","Материалы RID уже сохранены. На этом этапе мы сопоставляем анкету с зарегистрированными файлами. Программа НЕ утверждает, что искусственный интеллект рассмотрел фотографии или видео. Если вы сами заметили важные детали — их можно связать с конкретным материалом и сохранить в своём проекте."));
 const tools=mk("div",undefined,"display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px");
 const load=mk("button","Открыть материалы для анализа");load.type="button";load.id="ridDossierLoad";
 load.onclick=()=>open().catch(e=>status("Не удалось открыть материалы: "+String(e.message||e),true));
 const send=mk("button","Подтвердить и сохранить карту в RID");send.id="ridDossierSend";send.type="button";send.disabled=true;
 send.onclick=()=>saveReport().catch(e=>status("Отчёт не подтверждён: "+String(e.message||e),true));
 const backup=mk("button","Скачать копию карты");backup.id="ridDossierBackup";backup.type="button";backup.className="secondary";backup.disabled=true;
 backup.onclick=download;
 tools.append(load,send,backup);root.append(tools);
 const hint=mk("p","Сначала выберите существующий проект кухни №4. После загрузки сохранённых материалов появятся список неопределённостей и альтернативы планировки.");
 hint.id="ridDossierStatus";hint.setAttribute("role","status");root.append(hint);
 const body=mk("div");body.id="ridDossierBody";root.append(body);
 root.append(mk("p","Отчёт с пометкой «Со слов заказчика» не является проверкой специалиста. Не вскрывайте стены, розетки, электропанели и газопровод для фотографирования.","font-size:12px;color:#695c39;margin:12px 0 0"));
 anchor.insertAdjacentElement("afterend",root);
}
const validProject=s=>/^rid-[a-z0-9]{32}$/i.test(String(s||""));
function confirmItem(data){
 return data&&typeof data==="object"&&typeof data.objectName==="string";
}
async function currentUser(){
 if(typeof auth!=="undefined"&&auth?.user?.id)return auth.user.id;
 const r=await fetch(SUPABASE_ORIGIN+"/auth/v1/user",{headers:{apikey:cfg.publishableKey,authorization:"Bearer "+token()},cache:"no-store"});
 if(!r.ok)throw Error("Требуется повторный вход в RID.");
 const d=await r.json();if(!/^[a-f0-9-]{36}$/i.test(d.id||""))throw Error("RID не подтвердил учётную запись.");
 return d.id;
}
async function fetchRecords(project){
 const h={"x-role-assignment-id":roleAssignmentId};
 const [m,a]=await Promise.all([
  api("/projects/"+project+"/pilot",{method:"GET",headers:h}),
  api("/projects/"+project+"/preliminary-input",{method:"GET",headers:h})
 ]);
 if(activeProjectId!==project)throw Error("Проект переключился во время загрузки.");
 return {list:(m?.data?.evidence||[]).filter(confirmItem),answers:a?.data?.prefilledAnswers||{}};
}
function typeName(ev){
 if(ev.caption?.startsWith("RID_VIDEO_PARTS_V1|"))return "Видео";
 const name=String(ev.objectName||"").toLowerCase(),mime=String(ev.mimeType||"").toLowerCase();
 if(mime.startsWith("image/")||/\.(jpg|jpeg|png|webp|heic|heif)$/.test(name))return "Фото";
 if(mime.startsWith("video/")||/\.(mp4|mov|webm)$/.test(name))return "Видео";
 return "Документ";
}
function media(){
 return state.evidence.filter(e=>typeName(e)!=="Документ");
}
function analysis(){
 const a=state.answers,med=media(),cat=new Set(med.map(e=>e.category));
 const rows=[];
 const gap=(code,title,reason,req)=>rows.push({code,title,reason,req,verified:false});
 if(a.wall_removal===true||a.wall_removal==="true")
  gap("WALL","Изменение стены","В анкете запрошено изменение стены. Её конструктивная функция неизвестна.","Уточнить, внутренняя ли стена, размеры предполагаемого проёма и возможные сети; обследование специалистом.");
 if(a.ventilation_change===true||a.ventilation_change==="true")
  gap("VENT","Вытяжка и воздуховод","Рассматривается изменение вытяжки. Доступный путь воздуховода не подтверждён.","Показать существующую вытяжку, видимый воздуховод и место предполагаемой установки.");
 if(a.plumbing_change===true||a.plumbing_change==="true"||a.sink_location_change===true||a.sink_location_change==="true")
  gap("PLUMBING","Мойка и водоснабжение","Возможен перенос/изменение мойки и подключений.","Уточнить положение мойки, доступные подключения, желаемый перенос, наличие посудомоечной машины.");
 if(a.appliance_changes===true||a.appliance_changes==="true")
  gap("APPLIANCE","Бытовая техника","Пожелания по технике требуют привязки к существующей геометрии и инженерным точкам.","Сверить габариты, питание и место ПММ/холодильника/плиты.");
 if(Number(a.approx_area)>0)
  gap("MEAS","Размеры помещения","Указана площадь приблизительно "+a.approx_area+" кв. футов, но это не размерный план.","Нужны длины стен, положение проёмов, высота и ширина проходов.");
 const expected=[["PLUMBING_SINK","мойка"],["ELECTRICAL_ROOM","электрические розетки"],["RANGE_VENTILATION","вытяжка"],["CABINETRY","кухонные шкафы"],["MEASUREMENT","измерения"],["APPLIANCE","бытовая техника"]];
 const untagged=expected.filter(([key])=>!cat.has(key)).map(x=>x[1]);
 return {rows,untagged};
}
function saveObservation(name,patch){
 const obj=state.notes[name]||{text:"",clarity:"NOT_REVIEWED",timeCode:""};
 state.notes[name]={...obj,...patch};
 writeLocal(false);
}
function inputField(text,value,handler,placeholder="",multiline=false){
 const outer=mk("div",undefined,"margin:7px 0");
 const label=mk("label",text, "font-size:13px;font-weight:600;display:block");
 const input=mk(multiline?"textarea":"input");
 if(!multiline)input.type="text";else input.rows=2;
 input.value=value||"";input.placeholder=placeholder;input.style.cssText="width:100%;border-radius:6px;margin:3px 0;box-sizing:border-box;padding:8px";
 input.addEventListener("input",()=>handler(input.value));
 outer.append(label,input);return outer;
}
function annotateRow(ev){
 const name=ev.objectName,record=state.notes[name]||{};
 const row=mk("div",undefined,"background:white;border:1px solid #d2e1d9;border-radius:9px;margin:9px 0;padding:10px");
 const display=(ev.caption?.startsWith("RID_VIDEO_PARTS_V1|")?"Видео, сохранено частями":(ev.caption||"")).slice(0,110);
 row.append(mk("strong",typeName(ev)+" · "+(CATS[ev.category]||ev.category||"Без категории")));
 row.append(mk("div",display||String(name).split("/").pop(),"font-size:12px;color:#577168;overflow-wrap:anywhere"));
 const sel=mk("select");
 sel.style.cssText="display:block;width:100%;max-width:380px;margin:8px 0;padding:8px";
 const opts=[
 ["NOT_REVIEWED","Не просмотрено / пока не проверяю"],
 ["OBSERVED","Я видел(а) описанное на фото/видео"],
 ["UNCLEAR","Видно неясно — требуется уточнение"]
 ];
 for(const [value,title] of opts){const opt=mk("option",title);opt.value=value;sel.append(opt)}
 sel.value=record.clarity||"NOT_REVIEWED";
 sel.onchange=()=>saveObservation(name,{clarity:sel.value});
 row.append(sel);
 row.append(inputField("Что именно вы видите? (необязательно)",record.text,v=>saveObservation(name,{text:v}),"Например: мойка у правой стены; слева два окна",true));
 if(typeName(ev)==="Видео"){
  row.append(inputField("Момент видеозаписи, если известно (мм:сс)",record.timeCode,v=>saveObservation(name,{timeCode:v}),"Например, 00:38"));
 }
 return row;
}
function concept(title,parts,note){
 const box=mk("div",undefined,"background:#fff;border:1px solid #d4ded8;border-radius:10px;padding:12px;flex:1;min-width:245px");
 box.append(mk("h4",title));
 const scheme=mk("div",undefined,"padding:12px;border:2px dashed #9db4ac;border-radius:7px;display:grid;grid-template-columns:1fr 1fr;gap:7px;background:#f9fbf9");
 for(const p of parts){
  const card=mk("div",p,"background:#e8f2eb;border:1px solid #bcd2c3;border-radius:5px;padding:10px;font-size:12px;text-align:center;min-height:32px");
  scheme.append(card);
 }
 box.append(scheme,mk("p",note,"font-size:12px;color:#5b665e;line-height:1.45"));
 return box;
}
function visualizePlans(parent,a){
 const wrap=mk("div",undefined,"border:1px solid #b3c5bb;padding:13px;border-radius:10px;background:#f9fbfa;margin:12px 0");
 wrap.append(mk("h4","Два предварительных сценария организации кухни"));
 wrap.append(mk("p","Ниже показаны ТОЛЬКО функциональные схемы: без масштаба, направления стен, фактической расстановки и технического утверждения. Существующие фото ещё не были семантически проанализированы AI."));
 const grid=mk("div",undefined,"display:flex;gap:12px;flex-wrap:wrap");
 grid.append(
  concept("A · Сохранить существующую стену",["Хранение","Подготовка","Приготовление","Мойка + ПММ"],"Меньше конструктивных рисков. Проверить проходы, габариты шкафов и подключения."),
  concept("Б · Возможное изменение стены",["Хранение","Гибкое пространство","Приготовление","Мойка + ПММ"],"Только если специалист подтвердит возможность изменения. Несущая функция, скрытые сети и разрешения неизвестны.")
 );
 wrap.append(grid);
 const area=Number(a.approx_area);
 if(Number.isFinite(area)&&area>=100&&area<=150){
  wrap.append(mk("p","Ориентиры ранее опубликованного справочного бюджета для кухни 100–150 кв. футов (до HST и резерва): сохранение стены — около C$39–69 тыс.; изменение ненесущей перегородки — C$41–73 тыс.; несущая стена при подтверждённых инженерных работах — C$49–94 тыс. Эти диапазоны не пересчитаны по фотографиям и не являются сметой RID.","font-size:12px;color:#5a665b"));
 }else wrap.append(mk("p","Справочную стоимость не переносим на этот проект без подходящей площади. Сначала требуются размеры.","font-size:12px"));
 const original=mk("a","Посмотреть отдельный справочный бюджет кухни");original.href="#ridCustomerProjectPanel";
 original.style.cssText="display:inline-block;margin-top:5px;font-weight:600";wrap.append(original);
 parent.append(wrap);
}
function render(){
 const area=$("ridDossierBody");area.replaceChildren();
 const med=media(),a=state.answers,{rows,untagged}=analysis();
 const head=mk("div",undefined,"background:white;border:1px solid #d2ddd5;border-radius:9px;padding:12px;margin:10px 0");
 head.append(mk("h4","Состав материалов проекта"));
 head.append(mk("p","Фото: "+med.filter(x=>typeName(x)==="Фото").length+". Видео: "+med.filter(x=>typeName(x)==="Видео").length+". Повторно загружать их не нужно."));
 head.append(mk("p","Проверка фактического содержания фотографий и кадров пока требует вашего просмотра либо утверждённого RID AI-процессора. Ниже только данные анкеты и известные категории файлов."));
 if(state.savedRecord)head.append(mk("p","Ранее сохранённый отчёт RID: "+String(state.savedRecord.name||"")+". Можно создать новую версию без удаления прошлой.","font-size:12px;color:#346449"));
 area.append(head);
 const gaps=mk("div",undefined,"padding:12px;margin:10px 0;border-left:3px solid #c6a15f;background:#fffaf0");
 gaps.append(mk("h4","Что нужно подтвердить перед уточнением планировки"));
 for(const g of rows)gaps.append(mk("p",g.title+": "+g.reason+" Следующий шаг: "+g.req,"font-size:13px"));
 if(untagged.length)gaps.append(mk("p","Категории без отдельной метки: "+untagged.join(", ")+". Предметы могут присутствовать на общих фото — это ещё не подтверждено.","font-size:13px"));
 area.append(gaps);
 visualizePlans(area,a);
 const inputs=mk("div",undefined,"background:#f9fbf9;border:1px solid #c6dccf;border-radius:10px;padding:13px");
 inputs.append(mk("h4","Наблюдения заказчика по сохранённым материалам"));
 inputs.append(mk("p","Можно заполнить только важные позиции — это не новая анкета. Никакие наблюдения автоматически не считаются проверкой специалиста."));
 const jump=mk("a","Просмотреть сохранённые фото и кадры видео выше");jump.href="#ridVisualEvidence";inputs.append(jump);
 for(const ev of med)inputs.append(annotateRow(ev));
 area.append(inputs);
 const row=mk("div",undefined,"padding:10px;border:1px solid #d2e0d6;border-radius:8px;background:white;margin:10px 0");
 const t=mk("label");t.style.cssText="display:flex;gap:8px;align-items:flex-start;font-size:13px";
 const cb=mk("input");cb.type="checkbox";cb.id="ridDossierAck";cb.style.cssText="width:auto;margin-top:4px";cb.onchange=()=>{$("ridDossierSend").disabled=!cb.checked;};
 t.append(cb,mk("span","Я понимаю, что моя карта содержит предварительные сведения заказчика и вопросы для проверки. Я не подтверждаю безопасность конструкций, электрики или газового оборудования."));
 row.append(t);area.append(row);
 $("ridDossierSend").disabled=true;$("ridDossierBackup").disabled=false;
 status("Готово: анкета, "+med.length+" медиаматериалов и карта технических неопределённостей связаны в одном просмотре. Для сохранения отчёта поставьте отметку внизу.");
}
async function open(){
 if(!validProject(activeProjectId)||!roleAssignmentId)throw Error("Сначала выберите существующий проект кухни №4 в разделе 1.");
 const btn=$("ridDossierLoad");btn.disabled=true;
 const project=activeProjectId;
 status("Читаем сохранённые материалы, не меняя проект...");
 try{
  const [uid,rows]=await Promise.all([currentUser(),fetchRecords(project)]);
  if(activeProjectId!==project)throw Error("Проект изменён");
  state={projectId:project,userId:uid,evidence:rows.list,answers:rows.answers,notes:{},checks:{},savedRecord:null,pending:null};
  readLocal();
  render();
 }finally{btn.disabled=false;}
}
function dossier(){
 const {rows,untagged}=analysis();
 const confirmed=[];
 for(const ev of media()){
  const x=state.notes[ev.objectName];
  if(!x||(!String(x.text||"").trim()&&x.clarity==="NOT_REVIEWED"))continue;
  const observation={
   mediaObjectName:ev.objectName,category:ev.category,format:typeName(ev),
   status:x.clarity||"NOT_REVIEWED",text:String(x.text||"").trim().slice(0,2000),
   videoTimecode:typeName(ev)==="Видео"?String(x.timeCode||"").slice(0,30):null,
   provenance:"CUSTOMER_REPORTED",professionalVerified:false
  };
  confirmed.push(observation);
 }
 const a=state.answers;
 return {contract:"RID-CUSTOMER-VISUAL-REVIEW-v1",projectId:state.projectId,createdAt:new Date().toISOString(),
  customerReview:"EXPLICIT_CUSTOMER_CONFIRMATION",authority:"CUSTOMER_REPORTED_ONLY",
  verifiedStructuralState:false,aiMediaInterpretationPerformed:false,
  source:{c01:"SAVED_CUSTOMER_DEFINITION",mediaCount:media().length,mediaObjectNames:media().map(x=>x.objectName)},
  observations:confirmed,
  unknowns:rows.map(x=>({code:x.code,topic:x.title,description:x.reason,verificationNeeded:x.req})),
  categoriesNotSeparatelyTagged:untagged,
  assumptions:{areaSqFt:Number.isFinite(Number(a.approx_area))?Number(a.approx_area):null,wallModificationReported:a.wall_removal,ventilationChangeReported:a.ventilation_change},
  provisionalScenarios:[
   {code:"KEEP_WALL",status:"ILLUSTRATIVE_NOT_MEASURED",professionalApproval:false},
   {code:"ALTER_WALL_CONDITIONAL",status:"REQUIRES_STRUCTURAL_AND_REGULATORY_REVIEW",professionalApproval:false}
  ],
  costStatus:"PUBLIC_2026_GTA_BENCHMARK_ONLY_NOT_VALIDATED_RID_ESTIMATE",
  aiProcessor:"NOT_ACTIVATED_PRIVACY_AND_TECHNICAL_GATES_PENDING"
 };
}
function backupFile(r,filename){
 const blob=new Blob([JSON.stringify(r,null,2)],{type:"application/json"});
 const u=URL.createObjectURL(blob),a=mk("a");a.href=u;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),20000);
}
function download(){
 if(!isProject())return status("Сначала выберите проект.",true);
 const report=dossier();backupFile(report,"RID_KITCHEN_VISUAL_REVIEW_"+state.projectId.slice(0,12)+".json");
 status("Карта сохранена на вашем компьютере. Это не означает сохранение на сервере RID.");
}
async function serverUser(){
 const uid=await currentUser();if(uid!==state.userId)throw Error("Сессия пользователя изменилась. Обновите проект, данные не удалены.");
 return uid;
}
async function register(name){
 const j=await api("/projects/"+state.projectId+"/pilot",{method:"GET",headers:{"x-role-assignment-id":roleAssignmentId}});
 if(j.data?.evidence?.some(x=>x.objectName===name))return;
 await pilotCommand("REGISTER_EVIDENCE",{objectName:name,category:"OTHER",provenance:"CUSTOMER_REPORTED",caption:"Карта наблюдений заказчика · без AI и профессионального подтверждения"});
 const verified=await api("/projects/"+state.projectId+"/pilot",{method:"GET",headers:{"x-role-assignment-id":roleAssignmentId}});
 if(!verified.data?.evidence?.some(x=>x.objectName===name))throw Error("Регистрация отчёта не подтверждена. Попробуйте ещё раз, не создавая другой проект.");
}
async function saveReport(){
 if(saving)return;
 if(!isProject()||!state.userId)throw Error("Выбран другой проект. Сначала откройте карту снова.");
 if(!$("ridDossierAck")?.checked)throw Error("Для сохранения требуется подтверждение ограничений отчёта.");
 saving=true;const b=$("ridDossierSend");b.disabled=true;
 try{
  const uid=await serverUser(),project=state.projectId;
  if(state.pending?.objectName){
   status("Продолжаем регистрацию ранее загруженного отчёта...");
   await register(state.pending.objectName);
   state.savedRecord={name:state.pending.objectName,registeredAt:new Date().toISOString()};
   state.pending=null;writeLocal();
   status("Карта сохранена в проекте RID. Повторно вводить наблюдения не нужно.");
   return;
  }
  const report=dossier();
  const bytes=JSON.stringify(report,null,2);
  if(bytes.length>150000)throw Error("Карта слишком объёмная. Уменьшите описание.");
  const filename=uid+"/"+project+"/"+new Date().toISOString().replace(/[:.]/g,"-")+"-"+crypto.randomUUID()+"-RID-KITCHEN-VISUAL-REVIEW.json";
  const blob=new Blob([bytes],{type:"application/json"});
  const encoded=filename.split("/").map(encodeURIComponent).join("/");
  status("Отправляем карту обследования в частное хранилище RID...");
  const res=await fetch(SUPABASE_ORIGIN+"/storage/v1/object/rid-evidence/"+encoded,{
   method:"POST",headers:{apikey:cfg.publishableKey,authorization:"Bearer "+token(),"content-type":"application/json","x-upsert":"false"},
   body:blob,cache:"no-store"
  });
  if(!res.ok){
   const err=await res.json().catch(()=>({}));
   throw Error("Хранилище ответило HTTP "+res.status+": "+String(err.message||err.error||"неизвестная ошибка").slice(0,180));
  }
  state.pending={objectName:filename,createdAt:new Date().toISOString()};
  writeLocal();status("Файл отправлен. Проверяем регистрацию в выбранном проекте...");
  await register(filename);
  state.savedRecord={name:filename,registeredAt:new Date().toISOString()};
  state.pending=null;
  writeLocal();
  status("Готово. Карта наблюдений заказчика сохранена в выбранном проекте RID. AI-анализ не выполнялся.");
 }catch(e){writeLocal();status("Не удалось подтвердить серверное сохранение: "+String(e.message||e)+". Черновик и возможность повторной регистрации сохранены.",true);}
 finally{saving=false;if(b)b.disabled=false;}
}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&state.projectId)writeLocal(false)});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",makeUI,{once:true});else makeUI();
})();