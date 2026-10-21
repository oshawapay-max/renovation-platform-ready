/* RID Kitchen pilot visual evidence inspection v1.
   Customer-session read-only. No external AI, no raw image/frame transmissions,
   no DB mutations, no simulated technical determinations.
   Photos stay in private Supabase Storage; previews and key frames are generated
   on the customer's own device via authenticated read requests. */
(()=>{
"use strict";
const SOURCE="RID_MEDIA_BROWSER_REVIEW_v1";
const $=id=>document.getElementById(id);
const categoryNames={
 ROOM_OVERVIEW:"Общий вид помещения",WALL:"Стена / перегородка",
 PLUMBING_SINK:"Мойка и сантехника",ELECTRICAL_PANEL:"Электрощит",
 ELECTRICAL_ROOM:"Розетки и электрика",RANGE_VENTILATION:"Вытяжка",
 FLOOR:"Пол",CEILING:"Потолок",CABINETRY:"Мебель",APPLIANCE:"Техника",
 MEASUREMENT:"Размеры",UNKNOWN_CONDITION:"Неизвестные условия",OTHER:"Другое"
};
const MAX_VIDEO=256*1024*1024;
let currentProject=null, urls=[],loading=false,runId=0, latestReport=null;
function isSelected(project){return typeof activeProjectId==="string"&&activeProjectId===project&&Boolean(roleAssignmentId);}
function assertSelected(project){if(!isSelected(project))throw Error("Выбранный проект изменился. Откройте нужную кухню заново.");}
function node(tag,text,css){
 const n=document.createElement(tag);
 if(text!==undefined&&text!==null)n.textContent=String(text);
 if(css)n.style.cssText=css;
 return n;
}
function line(target,label,text){const p=node("p");p.append(node("strong",label+": "),node("span",text));target.append(p);return p;}
function message(text,bad=false){
 const element=$("ridVisualStatus");if(!element)return;
 element.textContent=text;element.style.color=bad?"#922d26":"#245b3b";
}
function cleanup(){
 runId++;loading=false;
 for(const u of urls){try{URL.revokeObjectURL(u)}catch{}}
 urls=[];
 const gallery=$("ridVisualGallery");if(gallery)gallery.replaceChildren();
 const report=$("ridVisualReport");if(report)report.replaceChildren();
 latestReport=null;
}
function createUI(){
 if($("ridVisualEvidence"))return;
 const saved=$("ridProjectEvidence")||$("evidenceStatus");
 if(!saved)return;
 const panel=node("div");panel.id="ridVisualEvidence";
 panel.style.cssText="border:1px solid #a2bcb1;border-radius:12px;margin:16px 0;background:#f7faf8;padding:16px;line-height:1.55";
 panel.append(node("h3","Фото и видео проекта: визуальная проверка"));
 panel.append(node("p","Откройте материалы, уже сохранённые в RID. Новая загрузка не требуется. Фото и видеокадры обрабатываются только на этом устройстве: автоматически распознавать стены, технику или размеры RID пока не умеет."));
 const controls=node("div");controls.style.cssText="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0";
 const open=node("button","Показать мои фотографии и видео");open.type="button";open.id="ridVisualOpen";
 open.addEventListener("click",()=>load().catch(e=>message("Материалы не открылись: "+String(e.message||e),true)));
 const exportButton=node("button","Скачать карту обследования");exportButton.type="button";exportButton.className="secondary";exportButton.id="ridVisualExport";exportButton.disabled=true;
 exportButton.addEventListener("click",downloadReport);
 controls.append(open,exportButton);panel.append(controls);
 const status=node("p","Выберите существующий проект кухни. Затем можно просматривать уже загруженные фотографии и видеозапись.");status.id="ridVisualStatus";status.setAttribute("role","status");
 const report=node("div");report.id="ridVisualReport";
 const gallery=node("div");gallery.id="ridVisualGallery";
 gallery.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px";
 const foot=node("p","Важно: категория файла и слова заказчика — это сведения, но не подтверждённый результат визуального анализа. Не открывайте скрытые конструкции и электрические панели ради фотографий.");
 foot.style.cssText="font-size:12px;color:#525e57;margin-top:14px";
 panel.append(status,report,gallery,foot);
 saved.insertAdjacentElement("afterend",panel);
}
function previewClass(ev){
 const name=String(ev.objectName||"").toLowerCase(),mime=String(ev.mimeType||"").toLowerCase();
 if(ev.caption?.startsWith("RID_VIDEO_PARTS_V1|"))return "video";
 if(mime.startsWith("video/")||/\.(mp4|mov|webm)$/.test(name))return "video";
 if(mime.startsWith("image/")||/\.(jpe?g|png|webp|heic|heif)$/.test(name))return "image";
 return "other";
}
function videoManifest(ev){
 const caption=String(ev?.caption||"");
 if(!caption.startsWith("RID_VIDEO_PARTS_V1|"))return null;
 const matched=String(ev.objectName||"").match(/^(.*)-p000\.(mp4|mov|webm)$/);
 if(!matched)return null;
 let v=null;try{v=JSON.parse(caption.slice("RID_VIDEO_PARTS_V1|".length))}catch{return null;}
 if(v?.v!==1||!Number.isInteger(v.n)||v.n<2||v.n>16||!Number.isInteger(v.z)||v.z<1||v.z>MAX_VIDEO||typeof v.sha!=="string"||!/^[0-9a-f]{64}$/i.test(v.sha)||!["mp4","mov","webm"].includes(matched[2]))return null;
 return {stem:matched[1],ext:matched[2],n:v.n,z:v.z,sha:v.sha,f:String(v.f||"video."+matched[2]).slice(0,110),mime:String(v.m||"video/"+matched[2])};
}
function scopedName(name,project){
 return typeof name==="string"&&name.includes("/"+project+"/")&&!name.includes("..")&&name.length<850;
}
async function privateRead(name,project){
 assertSelected(project);
 if(!scopedName(name,project))throw Error("Материал не принадлежит выбранному проекту.");
 const encoded=name.split("/").map(encodeURIComponent).join("/");
 const r=await fetch(SUPABASE_ORIGIN+"/storage/v1/object/authenticated/rid-evidence/"+encoded,{
  method:"GET",headers:{"apikey":cfg.publishableKey,"authorization":"Bearer "+token()},cache:"no-store"
 });
 if(!r.ok)throw Error("Не удалось открыть частный файл (HTTP "+r.status+").");
 return await r.blob();
}
async function digestHex(blob){
 if(!crypto.subtle?.digest)throw Error("В этом браузере недоступна проверка SHA-256.");
 return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",await blob.arrayBuffer())),b=>b.toString(16).padStart(2,"0")).join("");
}
async function videoBlob(ev,manifest,project){
 const pieces=[];let size=0;
 for(let i=0;i<manifest.n;i++){
  assertSelected(project);
  message("Загрузка исходного видео: "+(i+1)+" из "+manifest.n+" частей...");
  const name=manifest.stem+"-p"+String(i).padStart(3,"0")+"."+manifest.ext;
  const blob=await privateRead(name,project);
  size+=blob.size;if(size>MAX_VIDEO)throw Error("Видео превышает безопасный предел просмотра.");
  pieces.push(blob);
 }
 if(size!==manifest.z)throw Error("Видео неполное: размер частей не совпадает с исходным.");
 const result=new Blob(pieces,{type:manifest.mime});
 if(await digestHex(result)!==manifest.sha)throw Error("Несовпадение SHA-256: видео не подтверждено.");
 return result;
}
function objectUrl(blob){const u=URL.createObjectURL(blob);urls.push(u);return u;}
function card(title,kind){
 const c=node("article");c.style.cssText="border:1px solid #d4e0d9;background:white;border-radius:10px;padding:12px;min-width:0";
 const hd=node("strong",title);c.append(hd,node("p",kind,"font-size:12px;color:#60736b;margin:4px 0 8px"));
 return c;
}
function imageCard(ev,project){
 const filename=String(ev.objectName||"").split("/").pop(),c=card(ev.caption||filename,categoryNames[ev.category]||ev.category||"Фото");
 const btn=node("button","Посмотреть фото");btn.type="button";btn.className="secondary";
 const view=node("div");view.style.marginTop="7px";c.append(btn,view);
 btn.onclick=async()=>{
  btn.disabled=true;view.textContent="Открываем частное изображение…";
  try{
   const blob=await privateRead(ev.objectName,project);
   assertSelected(project);
   const url=objectUrl(blob);
   const img=node("img");img.alt="Сохранённая фотография "+filename;
   img.style.cssText="display:block;width:100%;height:auto;max-height:300px;object-fit:contain;border-radius:6px;background:#f0f0f0";
   img.onload=()=>{view.replaceChildren(img,node("p","Размер изображения: "+img.naturalWidth+" × "+img.naturalHeight+" пикселей. Это не физические размеры кухни.","font-size:12px;color:#60736b"));};
   img.onerror=()=>{view.textContent="Этот формат изображения нельзя показать в браузере. Файл остаётся сохранённым в RID.";};
   img.src=url;
  }catch(e){view.textContent="Не удалось открыть изображение: "+String(e.message||e);btn.disabled=false;}
 };
 return c;
}
async function waitFor(video,type,timeout=14000){
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{cleanup();reject(Error("Браузер не декодировал видеокадр вовремя."));},timeout);
  function cleanup(){clearTimeout(timer);video.removeEventListener(type,success);video.removeEventListener("error",failure);}
  function success(){cleanup();resolve();}
  function failure(){cleanup();reject(Error("Ошибка декодирования видео в браузере."));}
  video.addEventListener(type,success,{once:true});video.addEventListener("error",failure,{once:true});
 });
}
function timestamp(sec){const s=Math.round(sec);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
async function extractFrames(video,target,project){
 if(!Number.isFinite(video.duration)||video.duration<=0||video.videoWidth<=0||video.videoHeight<=0)throw Error("Нельзя определить длительность или размер кадров.");
 target.replaceChildren();
 const summary=node("p","Кадры взяты только для просмотра. AI не анализировал содержимое. Специалист должен подтвердить увиденное.");target.append(summary);
 const snapshots=[0.12,0.32,0.52,0.72,0.92];
 for(const t of snapshots){
  assertSelected(project);
  const desired=Math.min(Math.max(0.05,video.duration*t),Math.max(0.05,video.duration-0.05));
  if(Math.abs(video.currentTime-desired)>0.08){video.currentTime=desired;await waitFor(video,"seeked");}
  const ratio=Math.min(1,360/video.videoWidth);
  const canvas=node("canvas");canvas.width=Math.max(1,Math.round(video.videoWidth*ratio));canvas.height=Math.max(1,Math.round(video.videoHeight*ratio));
  const context=canvas.getContext("2d");if(!context)throw Error("Canvas недоступен");
  context.drawImage(video,0,0,canvas.width,canvas.height);
  canvas.style.cssText="width:100%;height:auto;border:1px solid #ddd;border-radius:5px";
  target.append(node("p","Кадр в "+timestamp(desired)+" · "+canvas.width+" × "+canvas.height,"font-size:12px;margin:10px 0 4px"),canvas);
 }
 message("Видео открыто. Пять кадров извлечены локально. Автоматической интерпретации содержимого ещё нет.");
}
function videoCard(ev,project){
 const manifest=videoManifest(ev),kind=manifest?"MP4, сохранён частями без сжатия":"Видеофайл";
 const c=card("Видео: "+(manifest?.f||String(ev.objectName||"").split("/").pop()),kind);
 const btn=node("button","Открыть исходное видео");btn.type="button";btn.className="secondary";
 const holder=node("div");holder.style.marginTop="8px";c.append(btn,holder);
 btn.onclick=async()=>{
  btn.disabled=true;holder.textContent="Готовим видео для локального просмотра…";
  try{
   const blob=manifest?await videoBlob(ev,manifest,project):await privateRead(ev.objectName,project);
   assertSelected(project);
   const url=objectUrl(blob);
   const v=node("video");v.controls=true;v.preload="metadata";v.playsInline=true;v.style.cssText="width:100%;max-height:320px;background:#111;border-radius:7px";
   const frameBtn=node("button","Показать 5 кадров из видео");frameBtn.type="button";frameBtn.className="secondary";frameBtn.style.marginTop="8px";
   const frames=node("div");
   frameBtn.onclick=async()=>{
    frameBtn.disabled=true;try{await extractFrames(v,frames,project)}catch(e){frames.textContent="Кадры не удалось получить: "+String(e.message||e)}finally{frameBtn.disabled=false}
   };
   v.src=url;holder.replaceChildren(v,frameBtn,frames);
   message(manifest?"Проверено: исходное видео собрано из "+manifest.n+" частей, SHA-256 совпал.":"Видео получено из частного хранилища RID.");
  }catch(e){holder.textContent="Не удалось восстановить/открыть видео: "+String(e.message||e);btn.disabled=false;message(holder.textContent,true)}
 };
 return c;
}
function gapAnalysis(answer,evidence){
 const val=id=>answer?.[id];
 const unknown=x=>x===null||x===undefined||x===""||x==="UNKNOWN"||x==="не знаю";
 const gaps=[];
 const push=(topic,reason,next)=>gaps.push({topic,reason,next,verified:false});
 if(val("wall_removal")===true||val("wall_removal")==="true")push("Стена и конструкция","Заказчик планирует изменение стены; несущая функция и коммуникации не установлены.","Обмеры, расположение проёма, осмотр конструкций компетентным специалистом до любых работ.");
 if(val("ventilation_change")===true||val("ventilation_change")==="true")push("Кухонная вытяжка","Новая вытяжка предусмотрена, но маршрут воздуховода и возможность вывода не проверены.","Проверить место установки, доступный путь воздуховода и требования к вентиляции.");
 if(val("appliance_changes")===true||val("appliance_changes")==="true")push("Посудомоечная машина и техника","Изменение оборудования влияет на шкафы, электричество и водоснабжение.","Проверить габариты, место ПММ, подключения воды/слива и электрическую цепь.");
 if(unknown(val("plumbing_change"))||unknown(val("sink_location_change")))push("Мойка и коммуникации","Не подтверждено, останется ли мойка на месте и понадобится ли перенос труб.","Зафиксировать положение существующей мойки и точек подключения.");
 if(unknown(val("gas_appliance")))push("Газовое оборудование","Наличие и планы по газовой плите не определены.","Уточнить тип плиты и существующие подключения; не открывать трубопроводы.");
 if(Number(val("approx_area"))>0)push("Геометрия кухни","Площадь "+Number(val("approx_area"))+" кв. футов указана заказчиком, но реальных размеров стен, проёмов и проходов нет.","Получить размеры стен и высоту, ширину дверей и окон, расположение инженерных точек.");
 const categories=new Set(evidence.map(e=>e.category).filter(Boolean));
 const requests=[["PLUMBING_SINK","мойка и видимые трубы"],["ELECTRICAL_ROOM","розетки и выключатели"],["RANGE_VENTILATION","вытяжка"],["CABINETRY","кухонные шкафы"],["APPLIANCE","крупная техника"],["MEASUREMENT","размеры и замеры"]];
 const missing=requests.filter(([key])=>!categories.has(key)).map(([,name])=>name);
 return {gaps,missing};
}
function showReport(project,evidence,ans){
 const report=$("ridVisualReport");report.replaceChildren();
 const media=evidence.filter(e=>previewClass(e)==="video"),images=evidence.filter(e=>previewClass(e)==="image");
 const header=node("div");header.style.cssText="padding:10px;border:1px solid #d8e7df;background:white;border-radius:8px;margin:10px 0";
 header.append(node("h4","Существующие материалы кухни"),node("p","Фото: "+images.length+". Видео: "+media.length+". Всего зарегистрировано в проекте: "+evidence.length+"."));
 header.append(node("p","Файлы зарегистрированы в RID, но их содержимое НЕ проходило AI-анализ. Изображения ниже можно открыть вручную в вашем браузере."));
 report.append(header);
 const {gaps,missing}=gapAnalysis(ans,evidence);
 const list=node("div");list.style.cssText="border-left:3px solid #c49f4c;padding:9px;margin:12px 0;background:#fffbf1";
 list.append(node("h4","Неизвестные условия, влияющие на планировку и бюджет"));
 for(const g of gaps){
  const p=node("p");p.append(node("strong",g.topic+" — "),node("span",g.reason+" Что проверить: "+g.next));list.append(p);
 }
 if(missing.length)list.append(node("p","Отдельные категории фотографий не отмечены: "+missing.join(", ")+". Это НЕ означает, что этих объектов нет на общих фото."));
 list.append(node("p","Статус: предварительное сопоставление анкеты и реестра файлов. Технический специалист должен подтвердить факты. Нельзя делать вывод о несущей стене по фото."));
 report.append(list);
 latestReport={source:SOURCE,projectId:project,createdAt:new Date().toISOString(),reviewMode:"USER_BROWSER_REVIEW_NOT_AI",evidenceCount:evidence.length,imageCount:images.length,videoCount:media.length,gaps,missingEvidenceCategories:missing,customerAnswersUsed:["wall_removal","ventilation_change","appliance_changes","plumbing_change","sink_location_change","gas_appliance","approx_area"]};
 $("ridVisualExport").disabled=false;
}
async function load(){
 if(loading)return;
 if(!activeProjectId||!roleAssignmentId){message("Сначала откройте существующий проект кухни в разделе 1.",true);return;}
 const project=activeProjectId;
 cleanup();currentProject=project;loading=true;
 const button=$("ridVisualOpen");button.disabled=true;
 try{
  message("Проверяем материалы и ответы сохранённого проекта. Файлы пока не скачиваются.");
  const h={"x-role-assignment-id":roleAssignmentId};
  const [result,prelim]=await Promise.all([
    api("/projects/"+project+"/pilot",{method:"GET",headers:h}),
    api("/projects/"+project+"/preliminary-input",{method:"GET",headers:h}).catch(()=>null)
  ]);
  assertSelected(project);
  const data=result?.data||{},records=Array.isArray(data.evidence)?data.evidence:[];
  if(!records.length)message("В выбранном проекте нет зарегистрированных материалов. Другие проекты могут содержать ваши файлы.",true);
  const answers=prelim?.data?.prefilledAnswers||{};
  showReport(project,records,answers);
  const gallery=$("ridVisualGallery");
  for(const rec of records){if(previewClass(rec)==="image")gallery.append(imageCard(rec,project));else if(previewClass(rec)==="video")gallery.append(videoCard(rec,project));}
  message("Карта исходных условий подготовлена из анкеты и реестра. Нажмите «Посмотреть фото» или «Открыть исходное видео» для проверки содержания.");
 }finally{loading=false;button.disabled=false;}
}
function downloadReport(){
 if(!latestReport||!isSelected(latestReport.projectId))return;
 const r=latestReport;
 const lines=[
  "RID KITCHEN — PRELIMINARY MEDIA COVERAGE / FACT GAPS",
  "Project: "+r.projectId,
  "Generated: "+r.createdAt,
  "REVIEW MODE: USER_BROWSER_REVIEW_NOT_AI (not a professional assessment)",
  "Images registered: "+r.imageCount+"; video records: "+r.videoCount,
  "",
  ...r.gaps.flatMap((g,i)=>[String(i+1)+". "+g.topic,g.reason,"Required: "+g.next,""]),
  "Categories not separately tagged (may appear on overview photos): "+r.missingEvidenceCategories.join(", "),
  "",
  "No photos, extracted frames, customer passwords or access tokens included.",
  "Server project data, budget and project approvals have NOT been modified."
 ];
 const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"});
 const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="RID_KITCHEN_MEDIA_REVIEW_"+r.projectId.slice(0,12)+".txt";
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),12000);
 message("Карта обследования сохранена на вашем устройстве. В проект RID она автоматически не отправлялась.");
}
window.RIDKitchenVisualEvidence=Object.freeze({open:load,version:SOURCE});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",createUI,{once:true});else createUI();
})();