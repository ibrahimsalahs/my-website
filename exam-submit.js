/*
 * exam-submit.js
 * مسؤول عن جمع إجابات الطالب وإرسالها إلى Google Apps Script.
 */

const SUBMIT_API_URL = 'https://script.google.com/macros/s/AKfycbwy0LYP84fqgl8-qUxcSIfnU4OQJFg2_dQkeIT-nCOgm45O7jWjfIVWTLbfQmAfX-x_0Q/exec';

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('submitBtn').addEventListener('click', submitExam);
});

async function submitExam(){

  if(!EXAM_DATA){
    showSubmitStatus('بيانات الاختبار غير جاهزة.', false);
    return;
  }

  if(SUBMIT_API_URL.includes('ضع_نفس_رابط')){
    showSubmitStatus('ضع رابط Google Apps Script داخل SUBMIT_API_URL في ملف exam-submit.js', false);
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'جاري إرسال الإجابات...';

  try{

    const answers = collectAnswers();

    const payload = {
      action: 'submit',
      userId: USER_ID,

      // معرف الاختبار لو أضفناه لاحقًا
      examId: EXAM_DATA.examId || '',

      // الإجابات مجمعة حسب أعمدة H:L
      answers: answers
    };

    const response = await fetch(SUBMIT_API_URL,{
      method:'POST',
      headers:{
        'Content-Type':'text/plain;charset=utf-8'
      },
      body:JSON.stringify(payload)
    });

    const result = await response.json();

    if(result.success){
      showSubmitStatus(
        result.message || 'تم إرسال الاختبار بنجاح.',
        true
      );

      btn.textContent = 'تم إرسال الاختبار';
      document.querySelectorAll('input,textarea').forEach(el=>{
        el.disabled = true;
      });

    }else{
      throw new Error(result.message || 'تعذر حفظ الإجابات.');
    }

  }catch(error){
    console.error(error);
    showSubmitStatus(
      error.message || 'حدث خطأ أثناء إرسال الاختبار.',
      false
    );

    btn.disabled = false;
    btn.textContent = 'إرسال الاختبار';
  }
}

function collectAnswers(){

  const result = {
    H: [], // اختيار من متعدد
    I: [], // صح وخطأ
    J: [], // أكمل
    K: [], // أسئلة متنوعة
    L: []  // استخرج
  };

  // H - اختيار من متعدد
  if(EXAM_DATA.sections.choice){
    EXAM_DATA.sections.choice.forEach(q=>{
      const selected = document.querySelector(
        `input[name="q_${CSS.escape(q.id)}"]:checked`
      );

      result.H.push(selected ? selected.value : '');
    });
  }

  // I - صح وخطأ
  if(EXAM_DATA.sections.trueFalse){
    EXAM_DATA.sections.trueFalse.forEach(q=>{
      const selected = document.querySelector(
        `input[name="q_${CSS.escape(q.id)}"]:checked`
      );

      result.I.push(selected ? selected.value : '');
    });
  }

  // J - أكمل
  if(EXAM_DATA.sections.complete){
    EXAM_DATA.sections.complete.forEach(q=>{
      const el = document.querySelector(
        `textarea[data-question-id="${CSS.escape(q.id)}"]`
      );

      result.J.push(el ? el.value.trim() : '');
    });
  }

  // K - متنوعة
  if(EXAM_DATA.sections.mixed){
    EXAM_DATA.sections.mixed.forEach(group=>{
      group.questions.forEach((q,i)=>{
        const id = group.id + '_' + i;

        const el = document.querySelector(
          `textarea[data-question-id="${CSS.escape(id)}"]`
        );

        result.K.push(el ? el.value.trim() : '');
      });
    });
  }

  // L - استخرج
  if(EXAM_DATA.sections.extract){
    EXAM_DATA.sections.extract.forEach(group=>{
      group.questions.forEach((q,i)=>{
        const id = group.id + '_' + i;

        const el = document.querySelector(
          `textarea[data-question-id="${CSS.escape(id)}"]`
        );

        result.L.push(el ? el.value.trim() : '');
      });
    });
  }

  return result;
}

function showSubmitStatus(message,success){
  const el = document.getElementById('status');

  el.style.display = 'block';
  el.className = 'status ' + (success ? 'success' : 'error');
  el.textContent = message;

  el.scrollIntoView({
    behavior:'smooth',
    block:'center'
  });
}
