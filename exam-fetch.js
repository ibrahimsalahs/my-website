/*
 * exam-fetch.js
 * مسؤول عن جلب الاختبار من Google Apps Script وعرضه.
 */

const API_URL = 'https://script.google.com/macros/s/AKfycbwy0LYP84fqgl8-qUxcSIfnU4OQJFg2_dQkeIT-nCOgm45O7jWjfIVWTLbfQmAfX-x_0Q/exec';

const params = new URLSearchParams(window.location.search);
const USER_ID = params.get('userId');

let EXAM_DATA = null;

document.addEventListener('DOMContentLoaded', loadExam);

async function loadExam(){
  const loading = document.getElementById('loading');

  if(!USER_ID){
    showError('لم يتم العثور على معرف الطالب في الرابط.');
    return;
  }

  if(API_URL.includes('ضع_رابط')){
    showError('ضع رابط Google Apps Script داخل المتغير API_URL في ملف exam-fetch.js');
    return;
  }

  try{
    const url = API_URL + '?userId=' + encodeURIComponent(USER_ID);

    const response = await fetch(url, {method:'GET'});
    const data = await response.json();

    if(!data.success){
      showError(data.message || 'تعذر جلب بيانات الاختبار.');
      return;
    }

    EXAM_DATA = data;
    renderExam(data);

  }catch(error){
    console.error(error);
    showError('حدث خطأ أثناء الاتصال بالخادم.');
  }
}

function renderExam(data){
  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  const student = data.student || {};
  document.getElementById('studentInfo').innerHTML =
    '<span class="badge">اختبار</span><br>' +
    'الطالب: <b>' + escapeHtml(student.name || '') + '</b>' +
    '<br>' +
    'المعلم: <b>' + escapeHtml(student.teacher || '') + '</b>' +
    '<br>' +
    'المادة: <b>' + escapeHtml(student.subject || '') + '</b>';

  const form = document.getElementById('examForm');
  form.innerHTML = '';

  renderChoiceSection(form, 'أولًا: أسئلة الاختيار من متعدد', data.sections.choice, 'choice');
  renderTrueFalseSection(form, 'ثانيًا: صح وخطأ', data.sections.trueFalse);
  renderOpenSection(form, 'ثالثًا: أكمل', data.sections.complete, 'complete');
  renderMixedSection(form, 'رابعًا: أسئلة متنوعة', data.sections.mixed);
  renderExtractSection(form, 'خامسًا: استخرج من الفقرة السابقة', data.sections.extract);
}

function renderChoiceSection(parent, title, questions, type){
  if(!questions || !questions.length) return;

  const section = createSection(title);

  questions.forEach((q,i)=>{
    const box = document.createElement('div');
    box.className = 'question';

    let options = '';
    q.options.forEach((option,j)=>{
      options += `
        <label class="option">
          <input type="radio"
                 name="q_${q.id}"
                 value="${escapeAttr(option)}">
          <span>${escapeHtml(option)}</span>
        </label>`;
    });

    box.innerHTML = `
      <div class="question-title">${i+1}. ${escapeHtml(q.question)}</div>
      ${options}
    `;

    section.appendChild(box);
  });

  parent.appendChild(section);
}

function renderTrueFalseSection(parent, title, questions){
  if(!questions || !questions.length) return;

  const section = createSection(title);

  questions.forEach((q,i)=>{
    const box = document.createElement('div');
    box.className = 'question';

    box.innerHTML = `
      <div class="question-title">${i+1}. ${escapeHtml(q.question)}</div>
      <label class="option">
        <input type="radio" name="q_${q.id}" value="صح">
        <span>صح</span>
      </label>
      <label class="option">
        <input type="radio" name="q_${q.id}" value="خطأ">
        <span>خطأ</span>
      </label>
    `;

    section.appendChild(box);
  });

  parent.appendChild(section);
}

function renderOpenSection(parent, title, questions, type){
  if(!questions || !questions.length) return;

  const section = createSection(title);

  questions.forEach((q,i)=>{
    const box = document.createElement('div');
    box.className = 'question';

    box.innerHTML = `
      <div class="question-title">${i+1}. ${escapeHtml(q.question)}</div>
      <textarea
        class="answer-input"
        data-question-id="${escapeAttr(q.id)}"
        placeholder="اكتب الإجابة هنا"></textarea>
    `;

    section.appendChild(box);
  });

  parent.appendChild(section);
}

function renderMixedSection(parent, title, questions){
  if(!questions || !questions.length) return;

  const section = createSection(title);

  questions.forEach((group,groupIndex)=>{
    const groupBox = document.createElement('div');
    groupBox.className = 'question';

    groupBox.innerHTML =
      '<div class="question-title">نوع السؤال: ' +
      escapeHtml(group.type) +
      '</div>';

    group.questions.forEach((q,i)=>{
      const inner = document.createElement('div');
      inner.className = 'question';

      inner.innerHTML = `
        <div class="question-title">${i+1}. ${escapeHtml(q)}</div>
        <textarea
          class="answer-input"
          data-question-id="${escapeAttr(group.id + '_' + i)}"
          placeholder="اترك الإجابة للطالب هنا"></textarea>
      `;

      groupBox.appendChild(inner);
    });

    section.appendChild(groupBox);
  });

  parent.appendChild(section);
}

function renderExtractSection(parent, title, groups){
  if(!groups || !groups.length) return;

  const section = createSection(title);

  groups.forEach((group,groupIndex)=>{
    const groupBox = document.createElement('div');
    groupBox.className = 'question';

    groupBox.innerHTML = `
      <div class="extract-passage">
        ${escapeHtml(group.passage)}
      </div>
    `;

    group.questions.forEach((q,i)=>{
      const inner = document.createElement('div');
      inner.className = 'question';

      inner.innerHTML = `
        <div class="question-title">${i+1}. ${escapeHtml(q)}</div>
        <textarea
          class="answer-input"
          data-question-id="${escapeAttr(group.id + '_' + i)}"
          placeholder="اكتب الإجابة هنا"></textarea>
      `;

      groupBox.appendChild(inner);
    });

    section.appendChild(groupBox);
  });

  parent.appendChild(section);
}

function createSection(title){
  const section = document.createElement('section');
  section.className = 'section';

  const h = document.createElement('div');
  h.className = 'section-title';
  h.textContent = title;

  section.appendChild(h);
  return section;
}

function showError(message){
  document.getElementById('loading').innerHTML =
    '<div style="font-weight:800;margin-bottom:10px">تعذر فتح الاختبار</div>' +
    escapeHtml(message);
  document.getElementById('loading').style.color = '#b42318';
}

function escapeHtml(value){
  return String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function escapeAttr(value){
  return escapeHtml(value);
}
