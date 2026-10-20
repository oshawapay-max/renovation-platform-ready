/* RID Kitchen pilot evidence upload UX v2: frontend only, no backend bypass or secret keys. */
(()=>{
"use strict";
const MAX_BYTES=52428800;
const MIME_BY_EXT={
 jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",
 heic:"image/heic",heif:"image/heif",mp4:"video/mp4",webm:"video/webm",
 mov:"video/quicktime",pdf:"application/pdf"
};
const CATS={ROOM_OVERVIEW:"Общий вид кухни",WALL:"Стены",PLUMBING_SINK:"Мойка и трубы",ELECTRICAL_PANEL:"Электрощит",ELECTRICAL_ROOM:"Розетки и электрика",RANGE_VENTILATION:"Вытяжка и вентиляция",FLOOR:"Пол",CEILING:"Потолок",CABINETRY:"Кухонные шкафы",APPLIANCE:"Бытовая техника",MEASUREMENT:"Замеры",UNKNOWN_CONDITION:"Неизвестное состояние",OTHER:"Другое"};
const fileInput=document.getElementById("evidenceFile");
const uploadBtn=document.getElementById("uploadEvidence");
const status=document.getElementById("evidenceStatus");
const existingCategory=document.getElementById("evidenceCategory");
if(!fileInput||!uploadBtn||!status||!existingCategory)return;
fileInput.multiple=true;
fileInput.removeAttribute("capture");
fileInput.accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.mp4,.webm,.mov,.pdf";
const info=document.createElement("div");
info.id="ridUploadHelp";
info.className="muted";
info.style.margin="9px 0";
info.textContent="Можно выбрать сразу несколько фото или видео (Shift или Ctrl в окне выбора). Поддерживаются JPG, PNG, WebP, HEIC, MP4, MOV, WebM и PDF. Размер каждого файла — не более 50 МБ. Файлы сохраняются только в выбранном проекте.";
fileInput.insertAdjacentElement("afterend",info);
const queue=document.createElement("div");queue.id="ridUploadQueue";queue.setAttribute("aria-live","polite");fileInput.insertAdjacentElement("afterend",queue);
const registry=document.createElement("div");registry.id="ridProjectEvidence";registry.setAttribute("aria-live","polite");
status.insertAdjacentElement("afterend",registry);
uploadBtn.textContent="Загрузить выбранные файлы в проект";
const pending=new Map();
const uploadedThisSelection=new Set();
let selectedCategory=new Map();
let inFlight=false;
let latestProjectId="";
const labelFor=code=>CATS[code]||code||"Материал";
const friendlyError=e=>{
 const msg=String(e?.message||e||"");
 if(msg.includes("PILOT_NOT_INITIALIZED"))return "Пилот не запущен. Сначала выберите проект: программа попробует активировать его перед загрузкой.";
 if(msg.includes("SHADOW_ROLE_MISMATCH"))return "Активная роль не позволяет загружать материалы. Переключитесь на роль CUSTOMER (Заказчик).";
 if(msg.includes("WORKSPACE_NOT_LOADED")||msg.includes("PROJECT_NOT_SELECTED"))return "Сначала выберите проект кухни в разделе 1.";
 if(msg.includes("401")||msg.includes("UNAUTHENTICATED"))return "Сессия входа завершилась. Войдите в RID ещё раз.";
 if(msg.includes("403")||msg.includes("EVIDENCE_OBJECT_NOT_OWNED"))return "Доступ к хранилищу или проекту отклонён. Проверьте, что вошли в свой RID аккаунт.";
 if(msg.includes("413")||msg.includes("EntityTooLarge"))return "Файл превышает допустимый размер (50 МБ).";
 if(msg.includes("REVISION_CONFLICT")||msg.includes("409"))return "Проект изменился во время операции. Повторите регистрацию после обновления проекта.";
 if(msg.includes("Failed to fetch")||msg.includes("NetworkError"))return "Не удалось связаться с сервером. Проверьте соединение с интернетом.";
 return msg.slice(0,220)||"Неизвестная ошибка.";
};
function setStatus(message,kind=""){
 status.textContent=message;
 status.className=kind==="error"?"status risk":kind==="good"?"status good":"status";
}
function fileKey(file,i){return [file.name,file.size,file.lastModified,i].join(":");}
function humanSize(bytes){return (bytes/(1024*1024)).toFixed(1)+" МБ";}
function allowedMime(file){
 const ext=(file.name.split(".").pop()||"").toLowerCase();
 return MIME_BY_EXT[ext]||null;
}
function fileIssue(file){
 const mime=allowedMime(file);
 if(!mime)return "Неподдерживаемый тип файла: "+(file.name||"без названия")+". Допустимы JPG, PNG, WebP, HEIC, MP4, MOV, WebM, PDF.";
 if(file.size===0)return "Файл пустой (0 байт): "+file.name+".";
 if(file.size>MAX_BYTES)return "Файл слишком большой: "+file.name+" ("+humanSize(file.size)+"). Максимум — 50 МБ.";
 return null;
}
function safeName(name){
 const base=String(name||"file").replace(/[^A-Za-z0-9._-]+/g,"_").slice(-100);
 return base||"file";
}
function decodeResponse(r,data){
 if(r.ok)return data;
 const err=data?.message||data?.error_description||data?.error||data?.code||("HTTP "+r.status);
 throw Error("HTTP "+r.status+" "+String(err).slice(0,300));
}
async function jsonResponse(r){let payload;try{payload=await r.json()}catch{payload={}}return decodeResponse(r,payload);}
function updateQueue(){
 queue.replaceChildren();
 selectedCategory=new Map();
 uploadedThisSelection.clear();
 const chosen=Array.from(fileInput.files||[]);
 if(!chosen.length){setStatus("Сначала выберите один или несколько файлов.");return;}
 const header=document.createElement("div");header.style.cssText="margin:8px 0;font-weight:600";
 header.textContent="Выбрано файлов: "+chosen.length+". Перед загрузкой можно выбрать назначение для каждого файла.";
 queue.appendChild(header);
 for(const [i,file] of chosen.entries()){
   const line=document.createElement("div");line.style.cssText="border:1px solid #ddd;border-radius:8px;padding:8px 10px;margin:6px 0;background:#fcfcfc";
   const name=document.createElement("div");name.textContent=(i+1)+". "+file.name+" — "+humanSize(file.size);name.style.fontWeight="600";
   const cat=document.createElement("select");cat.style.cssText="margin-top:6px;width:100%;max-width:360px";
   for(const opt of Array.from(existingCategory.options)){
     const o=document.createElement("option");o.value=opt.value;o.textContent=labelFor(opt.value);
     cat.appendChild(o);
   }
   cat.value=existingCategory.value||"ROOM_OVERVIEW";
   const key=fileKey(file,i);
   selectedCategory.set(key,cat.value);
   cat.addEventListener("change",()=>selectedCategory.set(key,cat.value));
   const state=document.createElement("div");state.className="muted";state.id="ridUploadState"+i;state.style.marginTop="4px";
   const issue=fileIssue(file);
   if(issue){state.textContent="Пропущен: "+issue;state.style.color="#9a4400";line.style.borderColor="#c77";line.style.background="#fff7f6";cat.disabled=true;}
   else state.textContent="Ожидает загрузки";
   line.append(name,cat,state);queue.appendChild(line);
 }
 const rejected=chosen.filter(fileIssue);
 const allowed=chosen.length-rejected.length;
 setStatus("Выбрано: "+chosen.length+". Можно загрузить: "+allowed+". Неподходящих файлов: "+rejected.length+"."+(rejected.length?" Они выделены красным и не помешают остальным.":"")+" Нажмите «Загрузить выбранные файлы в проект».",rejected.length?"error":"");
}
function setFileState(i,text,good=false){
 const el=document.getElementById("ridUploadState"+i);
 if(el){el.textContent=text;el.style.color=good?"#23683e":"#9a4400";}
}
function pendingKey(projectId){return "ridKitchenPendingUploads:"+projectId;}
function readPending(projectId){
 try{const xs=JSON.parse(sessionStorage.getItem(pendingKey(projectId))||"[]");return Array.isArray(xs)?xs.filter(x=>x&&typeof x.objectName==="string"&&x.objectName.length<500):[];}catch{return [];}
}
function writePending(projectId,record){
 let list=readPending(projectId).filter(x=>x.objectName!==record.objectName);
 list.push(record);sessionStorage.setItem(pendingKey(projectId),JSON.stringify(list.slice(-50)));
}
function clearPending(projectId,objectName){
 const remaining=readPending(projectId).filter(x=>x.objectName!==objectName);
 if(remaining.length)sessionStorage.setItem(pendingKey(projectId),JSON.stringify(remaining)); else sessionStorage.removeItem(pendingKey(projectId));
}
async function getPilotEvidence(projectId){
 const j=await api("/projects/"+projectId+"/pilot",{method:"GET",headers:{"x-role-assignment-id":roleAssignmentId}});
 if(!j||!j.data||!Array.isArray(j.data.evidence))throw Error("PROJECT_EVIDENCE_NOT_AVAILABLE");
 return j.data;
}
function showRegistry(p){
 if(!p||!activeProjectId)return;
 latestProjectId=activeProjectId;
 registry.replaceChildren();
 const heading=document.createElement("h3");heading.textContent="Материалы, сохранённые в этом проекте: "+(p.evidence||[]).length;heading.style.marginTop="16px";registry.appendChild(heading);
 const records=Array.from(p.evidence||[]).slice().reverse();
 if(!records.length){const empty=document.createElement("p");empty.className="muted";empty.textContent="Пока нет зарегистрированных файлов. После успешной загрузки они появятся здесь и сохранятся после обновления страницы.";registry.appendChild(empty);}
 for(const ev of records){
  const line=document.createElement("div");line.style.cssText="display:flex;gap:12px;justify-content:space-between;align-items:center;flex-wrap:wrap;border-bottom:1px solid #ddd;padding:9px 0";
  const title=document.createElement("div");title.style.cssText="flex:1;min-width:210px";
  const fileName=(ev.objectName||"").split("/").pop();
  const caption=document.createElement("strong");caption.textContent=ev.caption||fileName||"Файл";title.appendChild(caption);
  const details=document.createElement("div");details.className="muted";details.textContent=labelFor(ev.category)+" · "+(ev.sizeBytes?humanSize(ev.sizeBytes):"размер не указан")+" · зарегистрировано в RID";title.appendChild(details);
  const download=document.createElement("button");download.type="button";download.className="secondary";download.textContent="Скачать / открыть";download.onclick=()=>openSaved(ev).catch(e=>setStatus("Не удалось открыть файл: "+friendlyError(e),"error"));
  line.append(title,download);registry.appendChild(line);
 }
 const ids=new Set(records.map(x=>x.objectName));
 const orphans=readPending(activeProjectId).filter(x=>!ids.has(x.objectName));
 if(orphans.length){
   const warn=document.createElement("p");warn.className="status risk";warn.textContent="Есть файлы, отправленные в хранилище, но пока не привязанные к проекту: "+orphans.length+". Ниже можно повторить регистрацию.";registry.appendChild(warn);
   for(const item of orphans){
     const row=document.createElement("div");row.style.margin="6px 0";const b=document.createElement("button");b.type="button";b.textContent="Повторить регистрацию: "+(item.filename||"файл");b.onclick=async()=>{b.disabled=true;try{await registerObject(item,activeProjectId);await refreshRegistry();setStatus("Файл зарегистрирован в проекте.","good");}catch(e){setStatus("Повторная регистрация не удалась: "+friendlyError(e),"error");b.disabled=false;}};row.appendChild(b);registry.appendChild(row);
   }
 }
 for(const item of readPending(activeProjectId))if(ids.has(item.objectName))clearPending(activeProjectId,item.objectName);
}
async function refreshRegistry(){
 if(!activeProjectId||!roleAssignmentId)return;
 const project=activeProjectId,p=await getPilotEvidence(project);
 if(activeProjectId===project)showRegistry(p);
 return p;
}
async function openSaved(ev){
 const name=ev?.objectName;
 if(!name)throw Error("FILE_NOT_FOUND");
 const encoded=name.split("/").map(encodeURIComponent).join("/");
 const r=await fetch(SUPABASE_ORIGIN+"/storage/v1/object/authenticated/rid-evidence/"+encoded,{headers:{apikey:cfg.publishableKey,authorization:"Bearer "+token()},cache:"no-store"});
 if(!r.ok)throw Error("HTTP "+r.status);
 const blob=await r.blob(),url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=(name.split("/").pop()||"rid-file");document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
async function ensureReady(projectId){
 if(!projectId||!roleAssignmentId||!workspace)throw Error("PROJECT_NOT_SELECTED");
 let p=await getPilotEvidence(projectId);
 if(p.status!=="ACTIVE"){
   setStatus("Подготавливаем пилот, чтобы ваши фотографии были связаны с проектом…");
   await pilotCommand("INITIALIZE_PILOT");
   p=await getPilotEvidence(projectId);
   if(p.status!=="ACTIVE")throw Error("PILOT_NOT_INITIALIZED");
 }
 const role=p.activeShadowRole||"CUSTOMER";
 if(!["CUSTOMER","RID_OPERATOR","EXPERT_ASSESSOR_SIMULATION","DESIGNER_ENGINEER_SIMULATION","CONTRACTOR_TRADE_SIMULATION","CONTRACTOR_SUPERVISOR_SIMULATION","INSPECTOR_VERIFIER_SIMULATION"].includes(role)){
   setStatus("Подключаем роль заказчика для загрузки материалов…");
   await pilotCommand("SET_ACTIVE_SHADOW_ROLE",{role:"CUSTOMER"});
 }
}
async function identity(){
 const r=await fetch(SUPABASE_ORIGIN+"/auth/v1/user",{headers:{apikey:cfg.publishableKey,authorization:"Bearer "+token()},cache:"no-store"});
 const u=await jsonResponse(r);
 if(!u.id||!/^[0-9a-f-]{36}$/i.test(u.id))throw Error("UNAUTHENTICATED");
 return u.id;
}
async function registerObject(item,projectId){
 if(activeProjectId!==projectId)throw Error("Проект изменён во время загрузки.");
 await pilotCommand("REGISTER_EVIDENCE",{objectName:item.objectName,category:item.category,provenance:item.provenance||"CUSTOMER_REPORTED",caption:item.caption});
 const p=await getPilotEvidence(projectId);
 if(!p.evidence.some(x=>x.objectName===item.objectName))throw Error("Файл не подтверждён в проекте. Повторите регистрацию.");
 clearPending(projectId,item.objectName);
 return p;
}
async function uploadBatch(){
 if(inFlight)return;
 const files=Array.from(fileInput.files||[]);
 if(!files.length){setStatus("Выберите фотографии, видео или документы, затем нажмите «Загрузить выбранные файлы».","error");return;}
 const projectId=activeProjectId;
 if(!projectId||!roleAssignmentId){setStatus("Сначала выберите действующий проект кухни в первом разделе.","error");return;}
 const invalid=files.map((f,i)=>({file:f,index:i,reason:fileIssue(f)})).filter(x=>x.reason);
 const validCount=files.length-invalid.length;
 for(const x of invalid)setFileState(x.index,"Не загружен: "+x.reason);
 if(!validCount){
   setStatus("Ни один файл нельзя загрузить. Проверьте отмеченные красным названия и размеры: "+invalid.map(x=>(x.index+1)+". "+x.reason).join(" | ").slice(0,1100),"error");
   return;
 }
 inFlight=true;uploadBtn.disabled=true;
 let completed=0,failed=invalid.length;
 setStatus("Начинаем загрузку "+validCount+" подходящих файлов. Пропускаем: "+invalid.length+".");
 const id=await identity().catch(e=>{inFlight=false;uploadBtn.disabled=false;setStatus(friendlyError(e),"error");return null;});
 if(!id)return;
 try{
   await ensureReady(projectId);
   for(let i=0;i<files.length;i++){
     if(projectId!==activeProjectId){failed+=files.length-i;setStatus("Проект переключился во время загрузки. Остановлено.","error");break;}
     const f=files[i],key=fileKey(f,i);
     if(fileIssue(f))continue; // Per-file validation must not block other selected files.
     if(uploadedThisSelection.has(key)){completed++;continue;}
     setFileState(i,"Передача файла "+(i+1)+" из "+files.length+"…");
     try{
       const originalName=f.name;
       const objectName=id+"/"+projectId+"/"+Date.now()+"-"+crypto.randomUUID()+"-"+safeName(originalName);
       const mime=allowedMime(f);
       const item={objectName,category:selectedCategory.get(key)||existingCategory.value||"ROOM_OVERVIEW",provenance:document.getElementById("evidenceProvenance")?.value||"CUSTOMER_REPORTED",caption:((document.getElementById("evidenceCaption")?.value||"").trim()||originalName).slice(0,500),filename:originalName};
       const encoded=objectName.split("/").map(encodeURIComponent).join("/");
       const up=await fetch(SUPABASE_ORIGIN+"/storage/v1/object/rid-evidence/"+encoded,{
         method:"POST",
         headers:{apikey:cfg.publishableKey,authorization:"Bearer "+token(),"content-type":mime,"x-upsert":"false"},
         body:f,
         cache:"no-store"
       });
       await jsonResponse(up);
       writePending(projectId,item);
       setFileState(i,"Файл передан. Сохраняем связь с проектом…");
       await registerObject(item,projectId);
       uploadedThisSelection.add(key);completed++;
       setFileState(i,"Сохранён в проекте ✓",true);
       setStatus("Сохранено: "+completed+" из "+files.length+". Файлы регистрируются по очереди.");
       await refreshRegistry();
     }catch(e){
       failed++;setFileState(i,"Ошибка: "+friendlyError(e));setStatus("Не удалось загрузить «"+f.name+"»: "+friendlyError(e),"error");
     }
   }
   await refreshRegistry();
   if(failed===0){setStatus("Готово: "+completed+" файл(ов) сохранены в проекте и доступны после повторного входа.","good");fileInput.value="";queue.replaceChildren();}
   else if(completed>0)setStatus("Сохранено в проекте: "+completed+" из "+files.length+". Не загружено: "+failed+". Проверьте отмеченные файлы и причины рядом с каждым названием.","error");
   else setStatus("Не удалось сохранить ни одного файла. Причины показаны рядом с каждым названием. Сначала исправьте ошибку, затем повторите загрузку.","error");
 }catch(e){setStatus("Загрузка остановлена: "+friendlyError(e),"error");}
 finally{inFlight=false;uploadBtn.disabled=false;}
}
fileInput.addEventListener("change",updateQueue);
uploadBtn.onclick=()=>uploadBatch().catch(e=>{inFlight=false;uploadBtn.disabled=false;setStatus("Ошибка загрузки: "+friendlyError(e),"error");});
const oldLoadPilot=typeof loadPilot==="function"?loadPilot:null;
if(oldLoadPilot){
 window.loadPilot=async function(...args){
   const result=await oldLoadPilot.apply(this,args);
   if(activeProjectId&&roleAssignmentId){
     try{await refreshRegistry();}catch(e){setStatus("Не удалось получить список файлов проекта: "+friendlyError(e),"error");}
     if(!inFlight)uploadBtn.disabled=false;
   }
   return result;
 };
}
setStatus("Выберите один или несколько файлов. После загрузки они появятся в списке сохранённых материалов проекта.");
})();