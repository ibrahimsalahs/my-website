const API_URL='https://script.google.com/macros/s/AKfycbyPhzepqoXzJpyz9rEFsjs5t59fcWUruOMrVmVAleO3Fcuc8NmKf_B5JzWE3ltJDDkC/exec';
const USER_ID=new URLSearchParams(location.search).get('userId');

let DATA=null;

document.addEventListener('DOMContentLoaded',loadCorrection);

async function loadCorrection(){
  if(!USER_ID){return error('معرف الطالب غير موجود في الرابط.');}
  if(API_URL.includes('ضع_رابط')){return error('ضع رابط Web App في correction-fetch.js');}
  try{
    const r=await fetch(API_URL+'?action=getCorrection&userId='+encodeURIComponent(USER_ID));
    const d=await r.json();
    if(!d.success)return error(d.message||'تعذر جلب بيانات الاختبار.');
    DATA=d;
    render(d);
  }catch(e){
    console.error(e); error('حدث خطأ أثناء الاتصال بالخادم.');
  }
}

function render(d){
  document.getElementById('loading').style.display='none';
  document.getElementById('app').style.display='block';

  document.getElementById('meta').innerHTML=
    'الطالب: <b>'+esc(d.student.name)+'</b><br>'+
    'المعلم: <b>'+esc(d.student.teacher)+'</b><br>'+
    'المادة: <b>'+esc(d.student.subject)+'</b>';

  const root=document.getElementById('exam');
  root.innerHTML='';
  section(root,'اختيار من متعدد',d.sections.choice,'choice');
  section(root,'صح وخطأ',d.sections.trueFalse,'tf');
  section(root,'أكمل',d.sections.complete,'complete');
  mixedSection(root,d.sections.mixed);
  extractSection(root,d.sections.extract);
}

function section(root,title,arr,type){
  if(!arr||!arr.length)return;
  const card=document.createElement('div'); card.className='card';
  card.innerHTML='<div class="section-title">'+title+'</div>';
  arr.forEach((q,i)=>{
    const box=document.createElement('div');box.className='q';
    let html='<div class="qtitle">'+(i+1)+'. '+esc(q.question)+'</div>';
    html+='<div class="answer"><span class="label">إجابة الطالب</span><br>'+esc(q.answer||'—')+'</div>';
    if(type==='choice'||type==='tf'){
      html+='<div class="correct"><span class="label">الإجابة الصحيحة</span><br>'+esc(q.correct||'')+'</div>';
    }
    box.innerHTML=html;card.appendChild(box);
  });
  root.appendChild(card);
}

function mixedSection(root,groups){
  if(!groups||!groups.length)return;
  const card=document.createElement('div');card.className='card';
  card.innerHTML='<div class="section-title">أسئلة متنوعة</div>';
  groups.forEach((g)=>{
    const h=document.createElement('div');h.className='qtitle';h.textContent='نوع السؤال: '+g.type;card.appendChild(h);
    g.questions.forEach((q,i)=>{
      const box=document.createElement('div');box.className='q';
      box.innerHTML='<div class="qtitle">'+(i+1)+'. '+esc(q.question)+'</div>'+
        '<div class="answer"><span class="label">إجابة الطالب</span><br>'+esc(q.answer||'—')+'</div>';
      card.appendChild(box);
    });
  });
  root.appendChild(card);
}

function extractSection(root,groups){
  if(!groups||!groups.length)return;
  const card=document.createElement('div');card.className='card';
  card.innerHTML='<div class="section-title">استخرج من الفقرة السابقة</div>';
  groups.forEach(g=>{
    const p=document.createElement('div');p.className='correct';p.innerHTML='<span class="label">الفقرة</span><br>'+esc(g.passage);card.appendChild(p);
    g.questions.forEach((q,i)=>{
      const box=document.createElement('div');box.className='q';
      box.innerHTML='<div class="qtitle">'+(i+1)+'. '+esc(q.question)+'</div>'+
        '<div class="answer"><span class="label">إجابة الطالب</span><br>'+esc(q.answer||'—')+'</div>';
      card.appendChild(box);
    });
  });
  root.appendChild(card);
}

function error(msg){
  const x=document.getElementById('loading');x.innerHTML='<b>تعذر فتح التصحيح</b><br>'+esc(msg);x.style.color='#b42318';
}
function esc(v){
 return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
