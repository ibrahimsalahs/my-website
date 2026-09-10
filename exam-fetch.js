const API_URL = "https://script.google.com/macros/s/AKfycbwy0LYP84fqgl8-qUxcSIfnU4OQJFg2_dQkeIT-nCOgm45O7jWjfIVWTLbfQmAfX-x_0Q/exec";
const userId = new URLSearchParams(location.search).get("userId");

const state = document.getElementById("state");
const examEl = document.getElementById("exam");
const picker = document.getElementById("examPicker");

let exams = [];

function esc(v){
  return String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
}
function groups(text){
  const out=[]; const re=/\(([^()]*)\)/g; let m;
  while((m=re.exec(String(text||"")))!==null) if(m[1].trim()) out.push(m[1].trim());
  return out;
}
function splitFirst(s, sep="_"){
  const i=s.indexOf(sep); return i<0?[s.trim(),""]:[s.slice(0,i).trim(),s.slice(i+1).trim()];
}
function splitLast(s, sep="/"){
  const i=s.lastIndexOf(sep); return i<0?[s.trim(),""]:[s.slice(0,i).trim(),s.slice(i+1).trim()];
}
function parseInfo(text){
  const g=groups(text);
  const student=g[0]?splitFirst(g[0],"-"):[ "", "" ];
  const teacher=g[1]?splitFirst(g[1],"-"):[ "", "" ];
  return {student:student[0], code:student[1], teacher:teacher[0], subject:teacher[1]};
}
function parseMC(text){
  return groups(text).map((g,i)=>{
    const [q,rest]=splitFirst(g,"_");
    const [choices,answer]=splitLast(rest,"/");
    return {n:i+1,q,choices:choices.split("-").map(x=>x.trim()).filter(Boolean),answer:answer.trim()};
  });
}
function parseTF(text){
  return groups(text).map((g,i)=>{
    const [q,a]=splitLast(g,"/");
    return {n:i+1,q:q.trim(),answer:a.trim()};
  });
}
function parseComplete(text){
  return groups(text).map((g,i)=>({n:i+1,q:g.trim()}));
}
function parseTypeQuestions(text){
  return groups(text).map((g,i)=>{
    const [type,questions]=splitFirst(g,"_");
    return {n:i+1,type:type.trim(),questions:questions.split("-").map(x=>x.trim()).filter(Boolean)};
  });
}
function parseExtract(text){
  const g=groups(text);
  return g.map((x,i)=>{
    if(i===0) return {paragraph:x,questions:[]};
    return {paragraph:"",questions:x.split("-").map(y=>y.trim()).filter(Boolean)};
  }).reduce((a,x)=>{
    if(x.paragraph) a.paragraph=x.paragraph; else a.questions.push(...x.questions);
    return a;
  },{paragraph:"",questions:[]});
}
function buildExam(row){
  const info=parseInfo(row.info);
  return {
    ...row, info,
    mc:parseMC(row.mc), tf:parseTF(row.tf), complete:parseComplete(row.complete),
    typeq:parseTypeQuestions(row.typeq), extract:parseExtract(row.extract)
  };
}
function renderMeta(ex){
  document.getElementById("meta").innerHTML=[
    ex.info.student ? `👤 ${esc(ex.info.student)}`:"",
    ex.info.teacher ? `👨‍🏫 ${esc(ex.info.teacher)}`:"",
    ex.info.subject ? `📚 ${esc(ex.info.subject)}`:"",
    ex.mc.length+ex.tf.length+ex.complete.length+ex.typeq.length+ex.extract.questions.length ? `📝 ${ex.mc.length+ex.tf.length+ex.complete.length+ex.typeq.length+ex.extract.questions.length} سؤال`:""
  ].filter(Boolean).map(x=>`<span class="pill">${x}</span>`).join("");
}
function section(title,body){
  if(!body) return "";
  return `<section class="section"><h2>${title}</h2>${body}</section>`;
}
function render(ex){
  document.getElementById("examTitle").textContent = ex.info.subject ? `اختبار ${ex.info.subject}` : "الاختبار";
  renderMeta(ex);
  let html="";

  if(ex.mc.length){
    html+=section("🟦 أولًا: اختر الإجابة الصحيحة",
      ex.mc.map(q=>`<div class="question"><div class="qhead">${q.n}. ${esc(q.q)}</div>${
        q.choices.map((c,j)=>`<label class="option"><input type="radio" name="mc_${q.n}"> <span>${esc(c)}</span></label>`).join("")
      }</div>`).join(""));
  }
  if(ex.tf.length){
    html+=section("🟩 ثانيًا: صح أم خطأ",
      ex.tf.map(q=>`<div class="question"><div class="qhead">${q.n}. ${esc(q.q)}</div>
        <label class="option"><input type="radio" name="tf_${q.n}"> <span>صح</span></label>
        <label class="option"><input type="radio" name="tf_${q.n}"> <span>خطأ</span></label>
      </div>`).join(""));
  }
  if(ex.complete.length){
    html+=section("🟨 ثالثًا: أكمل",
      ex.complete.map(q=>`<div class="question"><div class="qhead">${q.n}. ${esc(q.q)}</div>
        <input class="blank" style="width:100%;border-style:solid;color:var(--text);background:#fff" type="text" placeholder="اكتب الإجابة هنا">
      </div>`).join(""));
  }
  if(ex.typeq.length){
    html+=section("🟧 رابعًا: أسئلة متنوعة",
      ex.typeq.map(block=>`<div class="question"><div class="qhead">نوع السؤال: ${esc(block.type)}</div>${
        block.questions.map((q,j)=>`<div class="question"><div class="qhead">${j+1}. ${esc(q)}</div><div class="blank">اترك الإجابة للطالب</div></div>`).join("")
      }</div>`).join(""));
  }
  if(ex.extract.paragraph || ex.extract.questions.length){
    html+=section("🟥 خامسًا: استخرج من الفقرة السابقة",
      ex.extract.paragraph?`<div class="paragraph">${esc(ex.extract.paragraph)}</div>`:"");
    if(ex.extract.questions.length){
      html+=`<div class="question"><div class="qhead">الأسئلة</div>${
        ex.extract.questions.map((q,i)=>`<div style="margin:10px 0"><strong>${i+1}. ${esc(q)}</strong><input class="blank" style="display:block;width:100%;margin-top:7px;border-style:solid;color:var(--text);background:#fff" type="text" placeholder="اكتب الإجابة هنا"></div>`).join("")
      }</div>`;
    }
  }
  examEl.innerHTML=html;
  state.classList.add("hidden");
}
function showPicker(){
  if(exams.length<2) return;
  picker.classList.remove("hidden");
  picker.innerHTML=`<h2>اختر الاختبار</h2><select id="examSelect" style="width:100%;padding:12px;border:1px solid var(--border);border-radius:12px;font-size:15px">${exams.map((e,i)=>`<option value="${i}">${esc(e.title || e.info.subject || "اختبار "+(i+1))}</option>`).join("")}</select>`;
  document.getElementById("examSelect").onchange=e=>render(exams[+e.target.value]);
}
function fail(msg){
  state.className="error"; state.textContent=msg;
}
function loadViaJsonp(){
  if(!API_URL || API_URL.includes("ضع_رابط")) return fail("ضع رابط مشروع Google Apps Script في ملف exam.js أولًا.");
  if(!userId) return fail("لم يتم العثور على معرف الطالب في الرابط.");
  const cb="albayanExamCallback_"+Date.now();
  const script=document.createElement("script");
  const url=API_URL+"?action=getExam&userId="+encodeURIComponent(userId)+"&callback="+cb;
  window[cb]=(data)=>{
    delete window[cb]; script.remove();
    if(!data || !data.ok) return fail(data?.message || "تعذر تحميل الاختبار.");
    exams=(data.exams||[]).map(buildExam);
    if(!exams.length) return fail("لا يوجد اختبار متاح لهذا الطالب حاليًا.");
    showPicker(); render(exams[0]);
  };
  script.onerror=()=>{delete window[cb];script.remove();fail("حدث خطأ في الاتصال بخادم الاختبارات.");};
  script.src=url; document.body.appendChild(script);
}
loadViaJsonp();
