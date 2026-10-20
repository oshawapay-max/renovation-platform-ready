const Q={"project_motivation":"Почему вы решили заняться ремонтом кухни именно сейчас?","desired_result":"Какой результат ремонта кухни вы хотите получить?","primary_use":"Как вы планируете пользоваться кухней после ремонта?","current_problem":"Что на существующей кухне неудобно или требует улучшения?","must_keep":"Что нужно обязательно сохранить из существующей кухни?","desired_changes":"Что хотите изменить, добавить, убрать или перенести?","priority_summary":"Что для вас важнее всего, если потребуется выбирать между вариантами?","budget_sensitivity":"Насколько важно не превышать первоначальный бюджет?","phasing_preference":"Выполнить ремонт сразу или разделить на этапы?","timing_constraint":"Есть ли желательные сроки или ограничения по времени?","disruption_tolerance":"Насколько допустимы неудобства во время ремонта?","project_history":"Что знаете о прежних ремонтах, протечках, повреждениях и разрешениях?","evidence_available":"Есть ли фото, чертежи, документы или отчёты по существующей кухне?","future_intentions":"Какие будущие изменения кухни желательно предусмотреть?","approx_area":"Какова примерная площадь кухни?","existing_layout_change":"Хотите изменить планировку кухни?","intended_scope":"Какой объём ремонта вы планируете?","cabinet_length":"Какова примерная общая длина существующих кухонных шкафов?","appliance_changes":"Планируете оставить, добавить, заменить или переместить кухонную технику?","island":"Рассматриваете ли кухонный остров или полуостров?","sink_location_change":"Хотите перенести мойку или изменить её расположение?","gas_appliance":"Хотите оставить, добавить или рассмотреть газовую плиту?","outlets":"Сколько электрических розеток примерно имеется сейчас?","lighting_points":"Сколько мест стационарного освещения сейчас видно? Считайте каждый потолочный светильник или отдельную группу подсветки приблизительно как одно место. Позже специалист проверит расположение.","wall_removal":"Планируете снос, изменение стены или расширение проёма?","flooring":"Хотите заменить или существенно изменить пол?","ventilation_change":"Хотите изменить расположение или устройство вытяжки и вентиляции?","plumbing_change":"Планируете менять подключения воды, канализации, мойки или посудомойки?","cooking_workflow_priority":"Что должно стать удобнее во время приготовления пищи?","entertaining_priority":"Как кухня должна подходить для гостей и совместного общения?","storage_priority":"Какие задачи хранения для вас наиболее важны?","appliance_goal":"Какую технику хотите оставить, заменить, добавить или переместить? По возможности укажите, встроенная она или отдельностоящая.","accessibility_needs":"Нужны ли особые решения по высоте, доступу, видимости или удобству?","indoor_environment_goal":"Какие проблемы воздуха, температуры, запахов, влажности или шума хотите устранить?","damage_symptom_summary":"Какие протечки, сырость, запахи, повреждения или повторяющиеся проблемы вы заметили?","damage_history":"Когда вы впервые заметили проблему и как она менялась?","mixed_use_goal":"Какие занятия, кроме приготовления пищи, должны быть возможны на кухне?","beverage_station_goal":"Что должно быть в зоне кофе и напитков?","sink_goal":"Что хотите улучшить в зоне мойки, смесителя и уборки?","adjacent_space_relationship_goal":"Как кухня должна быть связана с соседними комнатами?","lighting_function_goal":"Что хотите улучшить в освещении?","household_cooking_pattern":"Сколько человек обычно готовят одновременно?","appliance_location_flexibility":"Готовы ли вы менять расположение кухонной техники?","seating_gathering_goal":"Какие сидячие места и зоны общения нужны на кухне?","storage_problem_summary":"Какие вещи сейчас трудно хранить или доставать?","accessibility_priority":"Какие улучшения удобства или доступности наиболее важны?","comfort_problem_detail":"Какая проблема комфорта наиболее важна: запахи, жара, влажность, шум, свет?","damage_location_summary":"Где именно находятся замеченные повреждения?","countertop_work_priority":"Для чего вам нужно больше удобной поверхности столешниц?","cleanup_workflow_priority":"Что должно быть удобнее при мытье посуды и уборке?","kitchen_renewal_goal":"Что хотите сохранить, заменить или улучшить на кухне? Какой результат будете считать успешным?","ceiling_height":"Примерная высота потолка","existing_finish_level":"Состояние существующей отделки","windows":"Примерное число окон и наружных проёмов","visible_water_or_moisture":"Замечали протечки, сырость, пятна от воды или постоянную влажность?","visible_cracks":"Замечали трещины, которые стоит проверить?"};
const INT={"INTENT_KITCHEN_RENEWAL":"Обновить кухню","INTENT_LAYOUT_RECONFIGURATION":"Изменить планировку","INTENT_FAMILY_COOKING":"Удобнее готовить для семьи","INTENT_ENTERTAINING":"Принимать гостей и общаться","INTENT_STORAGE_OPTIMIZATION":"Улучшить хранение","INTENT_APPLIANCE_UPGRADE":"Обновить кухонную технику","INTENT_ACCESSIBILITY":"Улучшить доступность и эргономику","INTENT_INDOOR_ENVIRONMENT":"Повысить комфорт и качество воздуха","INTENT_DAMAGE_OR_DEFECT_REMEDIATION":"Устранить повреждения и дефекты","INTENT_MIXED_USE":"Добавить другие функции кухни","INTENT_PANTRY":"Организовать кладовую и хранение продуктов","INTENT_BAKING_AND_PREPARATION":"Улучшить зону выпечки и подготовки продуктов","INTENT_BEVERAGE_STATION":"Сделать кофейную/напиточную зону","INTENT_SINK_AND_WATER_FIXTURES":"Обновить мойку и водоснабжение"};
const OP={"UNKNOWN":"Не знаю","YES":"Да","NO":"Нет","true":"Да","false":"Нет","LOW":"Низкая","MEDIUM":"Средняя","HIGH":"Высокая","ONE_PHASE":"Одним этапом","OPEN_TO_PHASES":"Возможно разделить на этапы","PREFER_PHASES":"Предпочитаю несколько этапов","REPAIR_OR_REMEDIATION":"Ремонт и устранение дефектов","LIGHT_REFRESH":"Небольшое обновление","PARTIAL_REMODEL":"Частичная переделка","FULL_REMODEL":"Полная переделка","LAYOUT_RECONFIGURATION":"Изменение планировки","KEEP_AS_IS":"Оставить как сейчас","MORE_OPEN_VISUAL_CONNECTION":"Открыть пространство","IMPROVE_CIRCULATION":"Улучшить проходы","CREATE_OR_WIDEN_OPENING":"Создать или увеличить проём","MORE_SEPARATION":"Больше разделения","OPEN_TO_OPTIONS":"Готов рассмотреть варианты","MOSTLY_ONE_COOK":"Обычно один человек","OFTEN_TWO_OR_MORE_COOKS":"Часто готовят двое или больше","VARIABLE":"По-разному","KEEP_CURRENT_LOCATIONS":"Оставить текущие места","OPEN_TO_MOVING":"Допускаю перенос техники","SPECIFIC_MOVES_IN_MIND":"Знаю, что хочу перенести","NO_SEATING_NEEDED":"Не нужны","QUICK_MEALS":"Для быстрых приёмов пищи","FAMILY_SEATING":"Для всей семьи","ENTERTAINING":"Для гостей","FLEXIBLE_MULTI_USE":"Универсальная зона","UNFINISHED":"Без отделки","PARTLY_FINISHED":"Частичная отделка","FINISHED":"Полная отделка"};
const SECT={"CUSTOMER_CORE":"Общие вопросы и ваши пожелания","CURRENT_CONDITIONS":"Что есть сейчас","KITCHEN_SCOPE":"Объём ремонта кухни","KITCHEN_CURRENT":"Существующая кухня","KITCHEN_FUNCTION":"Какой должна стать кухня","KITCHEN_CONDITION":"Замеченные проблемы","DOMAIN_SCOPE":"Объём работ","PROJECT":"О проекте"};
const T={"Step 1 · Describe the project":"Шаг 1. Опишите, зачем нужен ремонт","Step 2 · Confirm constraints and basic project facts":"Шаг 2. Уточните условия и ограничения","Step 3 · Answer only the relevant project-specific questions":"Шаг 3. Уточните вашу кухню","Evidence guidance":"Что стоит сфотографировать или уточнить","Reused from your previous confirmed project definition. Review and change it if your goal has changed.":"Ответ перенесён из предыдущей версии. При необходимости измените его.","Approximate customer-reported value; C02 verification may follow.":"Это предварительная оценка. Позже специалист сможет её проверить.","Unknown is acceptable when you do not know.":"Если не знаете — так и укажите.","Yes":"Да","No":"Нет","Unknown":"Не знаю","Choose only additional project goals. RID removes the primary intent from the secondary set and deduplicates repeated selections.":"Отмечайте дополнительные цели галочками. Главную цель выберите выше.","Changing a confirmed intent before Project Input Baseline creates a new intent revision. RID keeps prior history and still-valid C02 field facts/evidence, but the current Preliminary Input, preliminary estimate, preliminary regulatory screening, customer preliminary decision and current C03 binding are no longer current and must be rebuilt from the revised intent. After Project Input Baseline, this shortcut is blocked and the governed rebaseline/change path is required.":"После изменения уже подтверждённых целей RID сохранит историю проекта; связанные предварительные результаты потребуется обновить.","Select only the participant-confirmed answers you want to use in this C01 submission. AI observations are never applied automatically. If a selected candidate conflicts with the form answer, preview/submit fails until you explicitly resolve the conflict.":"Используйте только ответы, которые вы подтвердили. Предположения AI не становятся фактами автоматически.","Confirmed media follow-ups available for C01":"Уточнения по фото и видео","Unknown is valid. RID must not turn missing information into an assumed fact.":"Если не знаете ответ, его можно оставить неизвестным. RID не будет придумывать данные.","Load domain intake fields":"Показать вопросы о кухне","Create intent set":"Сохранить выбранные цели","Update draft intent set":"Изменить набор целей","Confirm selected intent":"Подтвердить выбранные цели","Preview":"Проверить ответы","Submit customer-reported input":"Сохранить анкету","5. Real evidence / photos":"5. Фотографии и видео кухни","Photo / video / file":"Выбрать фотографию или видео","Upload and register evidence":"Загрузить фотографию/видео","2. Active project":"2. Текущий проект","3. Customer Intent":"3. Что вы хотите изменить","4. Preliminary Input":"4. Вопросы о вашей кухне","Pilot Workspace ready. Sign in with the existing RID account.":"Пилот открыт. Войдите с учётной записью RID.","Authenticated. RID Pilot Workspace is active.":"Вы вошли в систему RID.","Reused answers:":"Ответов перенесено:","New questions:":"Новых вопросов:","Multi-intent coordination:":"Согласование нескольких целей:"};

(function(){
"use strict";
var EN=new URLSearchParams(location.search).get("lang")==="en";
document.documentElement.lang=EN?"en":"ru";
var $=function(id){return document.getElementById(id);};
var normalize=function(s){return String(s||"").trim();};
function localOption(op){
 if(!op||op.tagName!=="OPTION"||op.dataset.ridDone)return;
 var raw=op.getAttribute("value")===null?normalize(op.textContent):op.value;
 op.value=raw;
 var translation=INT[raw]||OP[raw];
 if(EN)translation=(INT[raw]?raw.replace(/^INTENT_/,"").toLowerCase().replace(/_/g," "):null);
 if(translation)op.textContent=translation;
 op.dataset.ridDone="1";
}
function trans(root){
 if(EN||!root||root.nodeType!==1)return;
 var selector="h1,h2,h3,h4,label,p,small,strong,button,option,.muted,.status,.danger-note,.prelim-group-meta";
 var candidates=[];
 if(root.matches&&root.matches(selector))candidates.push(root);
 if(root.querySelectorAll)candidates.push.apply(candidates,root.querySelectorAll(selector));
 for(var node of candidates){
  if(node.closest("pre,code,textarea,#diag"))continue;
  if(node.tagName==="OPTION"){localOption(node);continue;}
  if(node.classList.contains("prelim-group-meta")){
   var v=normalize(node.textContent),m=v.match(/^(\d+) required(?:\s*·\s*(\d+) optional)?$/i);
   if(m)node.textContent=m[1]+" обязательных"+(m[2]?" · "+m[2]+" необязательных":"");
   continue;
  }
  for(var child of Array.from(node.childNodes)){
   if(child.nodeType!==3)continue;
   var original=child.textContent,value=normalize(original);
   var translation=T[value]||SECT[value];
   if(!translation)for(var start of Object.keys(T))if(value.startsWith(start)&&value.length>start.length&&start.startsWith("Step ")){translation=T[start]+value.slice(start.length).replace(/intents/g,"целей");break;}
   if(translation&&translation!==value)child.textContent=original.replace(value,translation);
  }
 }
 var fields=[];
 if(root.matches&&root.matches("[data-fid]"))fields.push(root);
 if(root.querySelectorAll)fields.push.apply(fields,root.querySelectorAll("[data-fid]"));
 for(var field of fields){
  if(!field.dataset.fid||!Q[field.dataset.fid])continue;
  var container=field.closest(".field"),label=container&&container.querySelector("label");
  if(!label||label.dataset.ridQuestion)continue;
  var original=label.textContent,units=(original.match(/\((sq_ft|linear_ft|ft|count)\)/i)||[])[1];
  var translatedUnit=({sq_ft:"кв. фут",linear_ft:"пог. фут",ft:"фут",count:"шт."})[units]||units;
  label.textContent=Q[field.dataset.fid]+(translatedUnit?" ("+translatedUnit+")":"")+(original.indexOf("*")>=0?" *":"");
  label.dataset.ridQuestion="1";
 }
 if(root.querySelectorAll)for(var op of root.querySelectorAll("option"))localOption(op);
}
function showGoals(){
 var sel=$("secondaryIntents"),pri=$("primaryIntent");if(!sel||!pri)return;
 sel.style.cssText="position:absolute;opacity:0;width:1px;height:1px;pointer-events:none";
 sel.tabIndex=-1;sel.setAttribute("aria-hidden","true");
 var box=document.createElement("div");box.id="ridMultiGoals";box.className="rid-goals";
 sel.insertAdjacentElement("afterend",box);
 var hint=document.createElement("div");hint.className="muted";hint.id="ridGoalHint";box.insertAdjacentElement("afterend",hint);
 function refresh(){
  box.replaceChildren();
  for(var opt of Array.from(sel.options)){
   localOption(opt);
   var label=document.createElement("label");label.className="rid-goal";
   var check=document.createElement("input");check.type="checkbox";check.value=opt.value;check.checked=opt.selected;check.disabled=opt.value===pri.value;
   if(check.disabled&&check.checked)opt.selected=false;
   var text=document.createElement("span");text.textContent=EN?opt.value.replace(/^INTENT_/,"").toLowerCase().replace(/_/g," "):(INT[opt.value]||opt.value);
   check.onchange=function(o,c){return function(){o.selected=c.checked;count();};}(opt,check);
   label.append(check,text);box.appendChild(label);
  }
  count();
 }
 function count(){
  var n=Array.from(sel.selectedOptions).filter(function(o){return o.value!==pri.value;}).length;
  hint.textContent=EN?"Additional goals: "+n+". Tick as many as you want.":"Выбрано дополнительных целей: "+n+". Можно отметить любое количество галочек без Ctrl.";
 }
 var obs=new MutationObserver(function(list){if(list.some(function(m){return m.type==="childList";}))queueMicrotask(refresh);});
 obs.observe(sel,{childList:true});
 pri.addEventListener("change",refresh);
 refresh();
}
function info(){
 var main=document.querySelector("main");if(!main)return;
 var intro=document.createElement("div");intro.className="rid-guide";
 intro.textContent=EN?"Kitchen pilot: 1. Choose one main goal and any additional goals. 2. Save and confirm them. 3. Open the kitchen questions (this does not upload files). 4. Answer, preview and save. 5. Upload real photos/videos in section 5.":"Пилот «Кухня»: 1) Создайте или выберите проект. 2) Выберите главную цель и поставьте галочки у дополнительных целей. Сохраните и подтвердите выбор. 3) Нажмите «Показать вопросы о кухне» — это открывает анкету, а не загружает файлы. 4) Заполните и сохраните ответы. 5) Добавьте фотографии или видео кухни в следующем разделе.";
 main.insertAdjacentElement("afterbegin",intro);
 var pre=$("loadPrelim");
 if(pre){var hint=document.createElement("p");hint.className="muted";hint.textContent=EN?"This button shows the questionnaire. It does not upload photos.":"Эта кнопка показывает вопросы анкеты. Фото и видео загружаются отдельно ниже.";pre.insertAdjacentElement("beforebegin",hint);}
 var photo=$("evidenceFile"),form=$("prelimFields");
 if(photo&&form){var photoCard=photo.closest("section.card"),formCard=form.closest("section.card");if(photoCard&&formCard)formCard.after(photoCard);}
 var advanced=Array.from(document.querySelectorAll("section.card")).filter(function(x){return /LATER \/ FULL E2E/.test(x.querySelector("h2")?.textContent||"");});
 if(advanced.length){for(var x of advanced)x.style.display="none";
 var button=document.createElement("button");button.type="button";button.className="rid-advanced-toggle";button.textContent=EN?"Show expert tools":"Служебные функции специалистов (не нужны для первого этапа)";
 advanced[0].before(button);
 button.onclick=function(){var hidden=advanced[0].style.display==="none";for(var x of advanced)x.style.display=hidden?"":"none";button.textContent=hidden?(EN?"Hide expert tools":"Скрыть служебные функции"):(EN?"Show expert tools":"Служебные функции специалистов (не нужны для первого этапа)");};
 }
}
function styles(){
 var st=document.createElement("style");
 st.textContent=".rid-goals{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin:8px 0 12px}.rid-goal{display:flex;gap:10px;align-items:flex-start;border:1px solid #c5d1c9;border-radius:8px;padding:10px;background:#fff;cursor:pointer;font-size:14px;font-weight:500}.rid-goal input{width:auto;min-width:18px;min-height:18px;margin:1px}.rid-goal:has(input:checked){background:#e0f3e8;border-color:#4e916c}.rid-goal:has(input:disabled){opacity:.5;cursor:default}.rid-guide{border-radius:10px;padding:16px;background:#e7f1e9;border:1px solid #b2ccb8;margin:0 0 18px;line-height:1.7}.rid-advanced-toggle{background:#505d56}.field textarea{min-height:95px}@media(max-width:650px){.rid-goals{grid-template-columns:1fr}}";
 document.head.appendChild(st);
}
styles();showGoals();info();trans(document.body);
var watcher=new MutationObserver(function(ms){for(var m of ms){for(var n of m.addedNodes){if(n.nodeType===1)trans(n);}if(m.type==="characterData"&&m.target.parentElement&&!EN){var txt=normalize(m.target.textContent);if(T[txt]||SECT[txt])m.target.textContent=T[txt]||SECT[txt];}}});
watcher.observe(document.body,{childList:true,characterData:true,subtree:true});
})();
