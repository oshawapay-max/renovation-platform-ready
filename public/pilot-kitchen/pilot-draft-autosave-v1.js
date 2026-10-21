/* RID Kitchen Pilot local draft v1.
 * Scope: authenticated customer + one project, same browser.
 * Does not persist auth tokens, passwords, email credentials or File objects.
 * Only the RID server submission is authoritative; local drafts cannot approve work.
 */
(function(){
"use strict";
const VERSION=1;
const PREFIX="rid:kitchen:draft:v1:";
const SETUP_PREFIX="rid:kitchen:setup:v1:";
const LAST_PREFIX="rid:kitchen:last-project:v1:";
const SETUP_IDS=["portfolioName","propertyName","propertyType","city","province","country","street","programName"];
const LOCAL_IDS=["intentChangeReason","evidenceCaption","pilotAiMessage","customerDecisionNote","shadowPrelimNote"];
let userId=null,previousIntent=null,pilotIsLoaded=false,saveTimer=null,restoring=false,storageAvailable=null;
let selectedOnce=false,lastStatus="";let lastSavedAt=0,restoredProject=null;
const el=id=>document.getElementById(id);
const getProj=()=>typeof activeProjectId==="string"&&activeProjectId?activeProjectId:null;
const isUuid=x=>typeof x==="string"&&/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(x);
// RID project identifiers are normally rid-<32 hex>, not UUIDs.
const isProjectId=x=>typeof x==="string"&&(/^(?:rid-[0-9a-f]{32})$/i.test(x)||isUuid(x));
function storageOkay(){
 if(storageAvailable!==null)return storageAvailable;
 try{const k="rid:kitchen:draft:probe";localStorage.setItem(k,"1");localStorage.removeItem(k);storageAvailable=true;}
 catch{storageAvailable=false;}
 return storageAvailable;
}
function prefixFor(p){return userId&&p&&isUuid(userId)&&isProjectId(p)?PREFIX+userId+":"+p:null;}
function setupKey(){return userId&&isUuid(userId)?SETUP_PREFIX+userId:null;}
function lastKey(){return userId&&isUuid(userId)?LAST_PREFIX+userId:null;}
function read(key){
 if(!key||!storageOkay())return null;
 try{const raw=localStorage.getItem(key);if(!raw)return null;const item=JSON.parse(raw);return item&&typeof item==="object"&&item.version===VERSION?item:null;}catch{return null;}
}
function readSnapshot(){const p=getProj();const d=read(prefixFor(p));return d&&d.userId===userId&&d.projectId===p?d:null;}
function write(key,record){
 if(!key||!storageOkay())return false;
 try{localStorage.setItem(key,JSON.stringify(record));return true;}catch{storageAvailable=false;status("Недостаточно места или автосохранение браузера заблокировано. Сохраните анкету в RID, прежде чем покидать страницу.",true);return false;}
}
function stamp(ts){
 try{return new Date(ts).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"});}catch{return "";}
}
function initPanel(){
 if(el("ridDraftPanel"))return;
 const form=el("prelimFields"),card=form?.closest("section");
 if(!card)return;
 const panel=document.createElement("div");panel.id="ridDraftPanel";
 panel.style.cssText="background:#edf5f0;border:1px solid #b3d3bd;padding:12px 14px;border-radius:9px;margin:8px 0 14px;line-height:1.5;font-size:14px";
 const top=document.createElement("div");top.id="ridDraftState";top.setAttribute("role","status");top.textContent="Автосохранение черновика будет включено после входа в RID и выбора проекта.";
 const detail=document.createElement("div");detail.id="ridDraftDetails";detail.style.cssText="font-size:12px;color:#3e5a46;margin-top:4px";
 detail.textContent="Ответы сохраняются в этом браузере и привязаны к вашему аккаунту и проекту. Фотографии и видео сохраняются отдельно на сервере RID.";
 const actions=document.createElement("div");actions.style.cssText="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap";
 const manual=document.createElement("button");manual.type="button";manual.id="ridDraftSave";manual.className="secondary";manual.textContent="Сохранить черновик сейчас";
 manual.addEventListener("click",()=>saveNow(true));
 const restore=document.createElement("button");restore.type="button";restore.id="ridDraftRestore";restore.className="secondary";restore.textContent="Восстановить мои последние ответы";restore.style.display="none";
 restore.addEventListener("click",()=>{const d=readSnapshot();if(d){applyPrelim(d.answers||{},d.followups||[],true);status("Последние черновые ответы восстановлены из браузера. Перед отправкой в RID проверьте их.");saveNow(true);restore.style.display="none";}});
 actions.append(manual,restore);
 panel.append(top,detail,actions);
 form.parentElement.insertBefore(panel,form);
}
function status(text,isError=false){
 initPanel();if(!text||text===lastStatus)return;lastStatus=text;
 const x=el("ridDraftState");if(x){x.textContent=text;x.style.color=isError?"#a02e25":"#285b3b";}
}
function snapshotAnswers(){
 const fields={};
 for(const field of document.querySelectorAll("#prelimFields [data-fid]")){
  const id=field.dataset.fid;
  if(id&&/^[a-zA-Z0-9_.:-]{1,100}$/.test(id))fields[id]=String(field.value??"");
 }
 return fields;
}
function selectedFollowups(){
 const n=document.querySelectorAll("#prelimMediaFollowups [data-followup-response-id]");
 if(!n.length)return null;return Array.from(n).filter(el=>el.checked).map(el=>el.getAttribute("data-followup-response-id")).filter(Boolean);
}
function currentGoals(){
 const primary=el("primaryIntent")?.value||null;
 const additional=Array.from(el("secondaryIntents")?.selectedOptions||[]).map(x=>x.value).filter(x=>x&&x!==primary);
 return {primary,additional:[...new Set(additional)]};
}
function serverGoals(){
 if(!previousIntent)return null;
 return {primary:previousIntent.primaryIntent||null,additional:[...new Set(previousIntent.secondaryIntents||[])].sort()};
}
function goalsMatch(a,b){
 if(!a||!b||!a.primary||!b.primary)return false;
 return a.primary===b.primary&&[...new Set(a.additional||[])].sort().join("|")===([...new Set(b.additional||[])].sort().join("|"));
}
function readSetup(){
 const d=read(setupKey());return d&&d.userId===userId?d:null;
}
function saveSetup(){
 if(!userId||!storageOkay())return;
 const old=readSetup()||{},fields={...(old.fields||{})};
 for(const id of SETUP_IDS){const input=el(id);if(input&&input.type!=="password"&&input.type!=="file")fields[id]=String(input.value||"");}
 const fp=el("propertyPortfolio"),pp=el("projectProperty");
 if(fp&&fp.value)fields.propertyPortfolio=fp.value;
 if(pp&&pp.value)fields.projectProperty=pp.value;
 write(setupKey(),{version:VERSION,userId,savedAt:Date.now(),fields});
}
function restoreSetup(){
 const d=readSetup();if(!d||!d.fields)return;
 restoring=true;
 try{for(const [id,value] of Object.entries(d.fields)){
  const e=el(id);if(!e||e.type==="password"||e.type==="file"||typeof value!=="string")continue;
  if(e.tagName==="SELECT"&&!Array.from(e.options).some(o=>o.value===value))continue;
  e.value=value;
 }}finally{restoring=false;}
}
function saveNow(show=false){
 if(restoring)return false;
 if(!userId||!storageOkay()){
  if(show)status("Автосохранение в этом браузере недоступно. Проверьте вход в RID и настройки браузера.",true);
  return false;
 }
 saveSetup();
 const p=getProj();if(!p){if(show)status("Данные создания объекта сохранены в браузере. Выберите существующий проект или создайте новый.");return true;}
 if(!isProjectId(p)){if(show)status("Проект имеет неподдерживаемый идентификатор. Черновик НЕ сохранён, пожалуйста, сообщите в RID.",true);return false;}
 const old=readSnapshot()||{};
 const inDom=snapshotAnswers();
 const answers={...(old.answers||{}),...inDom};
 const followups=selectedFollowups();
 const goals=currentGoals();
 const notes={...(old.notes||{})};
 for(const id of LOCAL_IDS){const x=el(id);if(x&&x.type!=="password")notes[id]=String(x.value||"");}
 const next={version:VERSION,userId,projectId:p,savedAt:Date.now(),answers,
   followups:followups===null?(old.followups||[]):followups,goals,notes,
   lastSubmittedAt:old.lastSubmittedAt||null,serverIntentAtSave:serverGoals()||null,
   lastServerRevision:typeof workspace?.revision==="number"?workspace.revision:null};
 const ok=write(prefixFor(p),next);
 if(ok){lastSavedAt=next.savedAt;if(show||Object.keys(inDom).length)status("Черновик проекта "+p.slice(0,12)+"… сохранён локально в "+stamp(next.savedAt)+". Для постоянного сохранения используйте «Сохранить анкету в RID».");}
 return ok;
}
function beforeProjectSwitch(){
 if(getProj()&&userId)saveNow(false);
 previousIntent=null;pilotIsLoaded=false;restoredProject=null;
}
function tryRestoreGoals(d){
 if(!d?.goals||!pilotIsLoaded||!d.goals.primary)return;
 if(previousIntent && !goalsMatch(d.goals,serverGoals())){status("В RID уже подтверждены другие цели. Я не заменяю их автоматически черновиком, чтобы не изменить проект.",true);return;}
 const primary=el("primaryIntent"),secondary=el("secondaryIntents");
 if(!primary||!secondary)return;
 const known=new Set(Array.from(primary.options).map(o=>o.value));
 if(!known.has(d.goals.primary))return;
 restoring=true;
 try{
  primary.value=d.goals.primary;
  for(const option of secondary.options)option.selected=(d.goals.additional||[]).includes(option.value)&&option.value!==primary.value;
  primary.dispatchEvent(new Event("change",{bubbles:false}));
 }finally{restoring=false;}
}
function restoreNotes(d){
 if(!d?.notes)return;
 restoring=true;
 try{for(const id of LOCAL_IDS){const x=el(id),v=d.notes[id];if(x&&typeof v==="string")x.value=v;}}
 finally{restoring=false;}
}
async function onEntryReady(){
 initPanel();
 if(!storageOkay()){status("Автосохранение браузера заблокировано. Пользуйтесь подтверждённой отправкой в RID.",true);return;}
 try{
  let id=auth?.user?.id||null;
  if(!isUuid(id)){
   const r=await fetch(SUPABASE_ORIGIN+"/auth/v1/user",{headers:{apikey:cfg.publishableKey,authorization:"Bearer "+token()},cache:"no-store"});
   if(!r.ok)throw Error("USER_NOT_AVAILABLE");
   const j=await r.json();id=j?.id;
  }
  if(!isUuid(id))throw Error("USER_ID_MISSING");
  userId=id;
  restoreSetup();
  if(!selectedOnce&&entry){
   const remembered=localStorage.getItem(lastKey());
   const projectList=[...(entry.projects||[]),...(entry.participantProjects||[])];
   const eligible=projectList.filter(x=>(x.domainCodes||[x.domainCode]).map(y=>String(y).toUpperCase()).includes("KITCHEN") && !/(^|[-_])(dev|test|stress|e2e|fixture|synthetic)([-_]|$)/i.test(String(x.projectId||"")));
   const idToOpen=remembered&&eligible.some(x=>x.projectId===remembered)?remembered:null;
   if(idToOpen&&getProj()!==idToOpen){
    selectedOnce=true;
    status("Восстанавливаем последний проект кухни...");
    try{await selectProject(idToOpen);}catch(e){status("Последний проект не удалось открыть автоматически. Выберите его в списке RID.",true);}
    return;
   }
  }
  status("Автосохранение включено. Выберите проект кухни — прежние ответы будут восстановлены.");
 }catch{status("Не удалось подтвердить аккаунт для локальных черновиков. Войдите в RID ещё раз.",true);}
}
function onPilotLoaded(p){
 pilotIsLoaded=true;
 previousIntent=p?.coreIntent||null;
}
async function onProjectSelected(){
 const p=getProj();
 if(!p||!userId)return;
 if(!isProjectId(p)){status("Не удалось связать черновик с выбранным проектом.",true);return;}
 selectedOnce=true;
 try{localStorage.setItem(lastKey(),p);}catch{}
 const saved=readSnapshot();
 if(!saved){status("Для этого проекта включено автоматическое сохранение новых ответов.");return;}
 tryRestoreGoals(saved);
 restoreNotes(saved);
 status("Найден черновик этого проекта от "+stamp(saved.savedAt)+". Восстанавливаем ответы анкеты...");
 if(pilotIsLoaded&&previousIntent){
  try{await loadPrelim();}catch(e){status("Черновик найден. Чтобы показать сохранённые ответы, нажмите «Показать вопросы о кухне».");}
 }else{
  status("Черновик целей найден. После подтверждения целей нажмите «Показать вопросы о кухне».");
 }
}
function applyPrelim(answers,followups,manual=false){
 if(!answers||typeof answers!=="object")return 0;
 restoring=true;let n=0;
 try{
  for(const f of document.querySelectorAll("#prelimFields [data-fid]")){
   if(!Object.prototype.hasOwnProperty.call(answers,f.dataset.fid))continue;
   const v=String(answers[f.dataset.fid]??"");
   if(Array.from(f.options||[]).length&&v&&!Array.from(f.options).some(o=>o.value===v))continue;
   f.value=v;n++;
  }
  if(Array.isArray(followups)){
   for(const f of document.querySelectorAll("#prelimMediaFollowups [data-followup-response-id]")){
    const id=f.getAttribute("data-followup-response-id");f.checked=followups.includes(id);
    if(typeof prelimSelectedFollowupIds!=="undefined"){
     if(f.checked)prelimSelectedFollowupIds.add(id);else prelimSelectedFollowupIds.delete(id);
    }
   }
  }
 }finally{restoring=false;}
 return n;
}
function onPrelimRendered(serverAnswers={},schema=null){
 const draft=readSnapshot();if(!draft){status("Вопросы загружены. Ответы сохраняются автоматически при вводе.");return;}
 const fields=document.querySelectorAll("#prelimFields [data-fid]");
 if(!fields.length)return;
 // A confirmed server-side intent is authoritative, not a local browser selection.
 if(pilotIsLoaded&&previousIntent&&draft.serverIntentAtSave&&!goalsMatch(draft.serverIntentAtSave,serverGoals())){
  status("Цели проекта изменились на сервере. Старый черновик сохранён, но автоматическое восстановление остановлено. Проверьте вопросы и используйте кнопку восстановления только после проверки.",true);
  const button=el("ridDraftRestore");if(button)button.style.display="";
  return;
 }
 const localAnswers=draft.answers||{};
 const server=serverAnswers&&typeof serverAnswers==="object"?serverAnswers:{};
 const safe={},conflicts=[];
 for(const f of fields){
  const id=f.dataset.fid;
  if(!Object.prototype.hasOwnProperty.call(localAnswers,id))continue;
  const local=String(localAnswers[id]??"");
  const hasServer=Object.prototype.hasOwnProperty.call(server,id);
  const remote=hasServer?String(server[id]??""):"";
  if(hasServer&&remote!==local){conflicts.push(id);continue;}
  safe[id]=local;
 }
 const count=applyPrelim(safe,draft.followups||[],false);
 const restore=el("ridDraftRestore");
 if(conflicts.length){
  if(restore)restore.style.display="";
  status("Восстановлены совпадающие ответы ("+count+"). Для "+conflicts.length+" вопросов ответы на сервере и в черновике различаются: нажмите «Восстановить мои последние ответы», если хотите вернуть черновик.");
 }else{
  if(restore)restore.style.display="none";
  status("Ответы восстановлены ("+count+"). Черновик сохранён в браузере в "+stamp(draft.savedAt)+".");
 }
 restoredProject=getProj();
}
function onSubmitted(){
 const p=getProj();if(!p)return;
 saveNow(false);
 const old=readSnapshot();if(!old)return;
 write(prefixFor(p),{...old,lastSubmittedAt:Date.now()});
 status("Анкета успешно отправлена и сохранена в проекте RID. Локальный черновик также оставлен для защиты от сбоев.");
}
function onLogout(){
 if(getProj())saveNow(false);
 userId=null;previousIntent=null;pilotIsLoaded=false;selectedOnce=false;
 status("Черновик остался на этом компьютере. После входа в RID можно продолжить работу.");
}
function scheduleSave(event){
 if(restoring||!userId||!storageOkay())return;
 const target=event.target;
 if(!(target instanceof HTMLElement))return;
 if(target.closest("#loginCard,#ridDraftPanel")||target.matches('input[type="password"],input[type="email"],input[type="file"]'))return;
 const app=target.closest("#app");
 if(!app)return;
 const isQuestion=target.matches("[data-fid],[data-followup-response-id]");
 const isIntent=!!target.closest("#ridMultiGoals")||target.id==="primaryIntent"||target.id==="secondaryIntents"||target.id==="intentChangeReason";
 const isSetup=SETUP_IDS.includes(target.id)||["propertyPortfolio","projectProperty"].includes(target.id);
 const isNote=LOCAL_IDS.includes(target.id);
 if(!isQuestion&&!isIntent&&!isSetup&&!isNote)return;
 clearTimeout(saveTimer);
 saveTimer=setTimeout(()=>saveNow(false),450);
 if(isQuestion||isIntent)status("Сохраняем последние изменения…");
}
document.addEventListener("input",scheduleSave,true);
document.addEventListener("change",scheduleSave,true);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&userId)saveNow(false);});
window.addEventListener("pagehide",()=>{if(userId)saveNow(false);});
window.RIDKitchenDraft={beforeProjectSwitch,onEntryReady,onPilotLoaded,onProjectSelected,onPrelimRendered,onSubmitted,onLogout,saveNow};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initPanel,{once:true});else initPanel();
})();