const SUBMIT_API_URL='https://script.google.com/macros/s/AKfycbyPhzepqoXzJpyz9rEFsjs5t59fcWUruOMrVmVAleO3Fcuc8NmKf_B5JzWE3ltJDDkC/exec';

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('saveBtn').addEventListener('click',saveResult);
});

async function saveResult(){
  const result=document.getElementById('finalResult').value.trim();
  if(!result)return status('اكتب النتيجة أولًا.',false);
  if(SUBMIT_API_URL.includes('ضع_نفس_رابط'))return status('ضع رابط Web App في correction-submit.js',false);

  const btn=document.getElementById('saveBtn');
  btn.disabled=true;btn.textContent='جاري الحفظ...';

  try{
    const r=await fetch(SUBMIT_API_URL,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({
        action:'saveExamResult',
        userId:USER_ID,
        teacher:DATA.student.teacher,
        subject:DATA.student.subject,
        result:result
      })
    });
    const d=await r.json();
    if(!d.success)throw new Error(d.message||'تعذر حفظ النتيجة.');
    status(d.message||'تم حفظ النتيجة بنجاح.',true);
    btn.textContent='تم حفظ النتيجة';
  }catch(e){
    console.error(e);
    status(e.message||'حدث خطأ أثناء الحفظ.',false);
    btn.disabled=false;btn.textContent='حفظ النتيجة';
  }
}

function status(msg,ok){
 const x=document.getElementById('status');
 x.className='status '+(ok?'ok':'err');
 x.textContent=msg;
 x.scrollIntoView({behavior:'smooth',block:'center'});
}
