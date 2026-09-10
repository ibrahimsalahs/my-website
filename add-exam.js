const API_URL ='https://script.google.com/macros/s/AKfycbxjMKQZcizhX_S3bnov-tvtnekqZ-0XjhL5i11T9ALIxJWfRRqyCQl0fU3LdH1OCAAS/exec';


let choiceCounter = 0;
let tfCounter = 0;
let completeCounter = 0;
let mixedCounter = 0;
let extractCounter = 0;


/* =========================================
   تحميل الطلاب
========================================= */

document.addEventListener('DOMContentLoaded', function(){

  document
    .getElementById('students')
    .addEventListener('change', updateSelectedStudents);

  loadStudents();

});


async function loadStudents(){

  try{

    const response = await fetch(
      API_URL + '?action=listStudents'
    );

    const result = await response.json();

    if(!result.success){

      throw new Error(
        result.message || 'فشل جلب الطلاب'
      );

    }


    const select =
      document.getElementById('students');

    select.innerHTML = '';


    result.students.forEach(function(student){

      const option =
        document.createElement('option');

      /*
        القيمة = رقم الصف الحقيقي
        وليس اسم الطالب.
      */

      option.value = student.row;

      option.textContent = student.label;

      select.appendChild(option);

    });


    updateSelectedStudents();


  }catch(error){

    showStatus(
      error.message ||
      'حدث خطأ أثناء جلب الطلاب',
      false
    );

  }

}


/* =========================================
   عرض المختارين
========================================= */

function updateSelectedStudents(){

  const select =
    document.getElementById('students');

  const selected =
    Array.from(select.selectedOptions);


  const box =
    document.getElementById('selectedStudents');


  if(selected.length === 0){

    box.textContent =
      'لم يتم اختيار أي طالب.';

    return;

  }


  box.textContent =
    'تم اختيار: ' +
    selected
      .map(x => x.textContent)
      .join(' | ');

}


/* =========================================
   تنظيف النص
========================================= */

function cleanText(value){

  return String(value || '')
    .trim()
    .replace(/[()]/g,'');

}


/*
  علامات النظام هي:
  ()
  _
  -
  /

  لذلك نحاول منع استخدامها داخل البيانات.
*/

function safeText(value){

  return cleanText(value)
    .replace(/\//g,'-')
    .replace(/_/g,'-');

}


/* =========================================
   اختيار من متعدد
========================================= */

function addChoiceQuestion(){

  choiceCounter++;


  const div =
    document.createElement('div');

  div.className = 'question';


  div.innerHTML = `

    <div class="question-title">
      سؤال اختيار من متعدد ${choiceCounter}
    </div>

    <label>السؤال</label>

    <input
      class="choice-question"
      placeholder="مثال: من عاصمة مصر؟"
    >


    <label>الاختيارات</label>

    <div class="options">

      ${createOptionHTML(1)}
      ${createOptionHTML(2)}
      ${createOptionHTML(3)}

    </div>


    <button
      type="button"
      class="add"
      onclick="addChoiceOption(this)">

      ＋ إضافة اختيار

    </button>


    <button
      type="button"
      class="delete"
      onclick="this.closest('.question').remove()">

      حذف السؤال

    </button>

  `;


  document
    .getElementById('choiceQuestions')
    .appendChild(div);


  /*
    كل سؤال يسمح بإجابة صحيحة واحدة فقط.
  */

  div.addEventListener(
    'change',
    function(event){

      if(
        event.target.classList.contains(
          'correct-answer'
        )
      ){

        if(event.target.value === 'yes'){

          div
            .querySelectorAll('.correct-answer')
            .forEach(function(select){

              if(select !== event.target){

                select.value = '';

              }

            });

        }

      }

    }
  );

}


function createOptionHTML(number){

  return `

    <div class="option">

      <input
        class="choice-option"
        placeholder="اختيار ${number}"
      >

      <select class="correct-answer">

        <option value="">
          ليست الصحيحة
        </option>

        <option value="yes">
          صحيحة
        </option>

      </select>

    </div>

  `;

}


function addChoiceOption(button){

  const question =
    button.closest('.question');

  const options =
    question.querySelector('.options');

  const number =
    options.querySelectorAll('.option').length + 1;


  const div =
    document.createElement('div');

  div.className = 'option';

  div.innerHTML =
    createOptionHTML(number);


  options.appendChild(div);

}


/* =========================================
   صح وخطأ
========================================= */

function addTFQuestion(){

  tfCounter++;


  const div =
    document.createElement('div');

  div.className = 'question';


  div.innerHTML = `

    <div class="question-title">
      سؤال صح وخطأ ${tfCounter}
    </div>

    <label>السؤال</label>

    <input
      class="tf-question"
      placeholder="مثال: عاصمة مصر القاهرة"
    >


    <label>الإجابة الصحيحة</label>

    <select class="tf-answer">

      <option value="">
        اختر
      </option>

      <option value="صح">
        صح
      </option>

      <option value="خطأ">
        خطأ
      </option>

    </select>


    <button
      type="button"
      class="delete"
      onclick="this.closest('.question').remove()">

      حذف السؤال

    </button>

  `;


  document
    .getElementById('tfQuestions')
    .appendChild(div);

}


/* =========================================
   أكمل
========================================= */

function addCompleteQuestion(){

  completeCounter++;


  const div =
    document.createElement('div');

  div.className = 'question';


  div.innerHTML = `

    <div class="question-title">
      سؤال أكمل ${completeCounter}
    </div>

    <label>السؤال</label>

    <input
      class="complete-question"
      placeholder="مثال: عاصمة مصر هي ........"
    >

    <div class="small">
      لا توجد إجابة صحيحة مخزنة لهذا النوع،
      ويتم تصحيحه يدويًا.
    </div>

    <button
      type="button"
      class="delete"
      onclick="this.closest('.question').remove()">

      حذف السؤال

    </button>

  `;


  document
    .getElementById('completeQuestions')
    .appendChild(div);

}


/* =========================================
   أسئلة متنوعة
========================================= */

function addMixedQuestion(){

  mixedCounter++;


  const div =
    document.createElement('div');

  div.className = 'question';


  div.innerHTML = `

    <div class="question-title">
      مجموعة متنوعة ${mixedCounter}
    </div>

    <label>نوع السؤال</label>

    <input
      class="mixed-type"
      placeholder="مثال: ما النتائج المترتبة"
    >


    <label>
      الأسئلة
    </label>

    <textarea
      class="mixed-questions"
      placeholder="السؤال الأول
السؤال الثاني
السؤال الثالث"></textarea>


    <div class="small">
      اكتب كل سؤال في سطر مستقل.
    </div>


    <button
      type="button"
      class="delete"
      onclick="this.closest('.question').remove()">

      حذف المجموعة

    </button>

  `;


  document
    .getElementById('mixedQuestions')
    .appendChild(div);

}


/* =========================================
   استخراج من فقرة
========================================= */

function addExtractQuestion(){

  extractCounter++;


  const div =
    document.createElement('div');

  div.className = 'question';


  div.innerHTML = `

    <div class="question-title">
      فقرة استخراج ${extractCounter}
    </div>

    <label>الفقرة</label>

    <textarea
      class="extract-passage"
      placeholder="اكتب الفقرة هنا"></textarea>


    <label>
      أسئلة الاستخراج
    </label>

    <textarea
      class="extract-questions"
      placeholder="فاعل مرفوع
مفعول به
مبتدأ"></textarea>


    <div class="small">
      اكتب كل سؤال في سطر مستقل.
    </div>


    <button
      type="button"
      class="delete"
      onclick="this.closest('.question').remove()">

      حذف الفقرة

    </button>

  `;


  document
    .getElementById('extractQuestions')
    .appendChild(div);

}


/* =========================================
   تكوين العمود C
========================================= */

function buildColumnC(){

  const result = [];


  document
    .querySelectorAll(
      '#choiceQuestions .question'
    )
    .forEach(function(question){

      const q =
        safeText(
          question
            .querySelector('.choice-question')
            .value
        );


      const options =
        Array.from(
          question.querySelectorAll(
            '.choice-option'
          )
        )
        .map(input => safeText(input.value))
        .filter(Boolean);


      const correctSelect =
        Array.from(
          question.querySelectorAll(
            '.correct-answer'
          )
        )
        .find(
          select => select.value === 'yes'
        );


      let correct = '';


      if(correctSelect){

        const row =
          correctSelect.closest('.option');

        const input =
          row.querySelector(
            '.choice-option'
          );

        correct =
          safeText(input.value);

      }


      if(
        q &&
        options.length &&
        correct
      ){

        result.push(
          '(' +
          q +
          '_' +
          options.join('-') +
          '/' +
          correct +
          ')'
        );

      }

    });


  return result.join('');

}


/* =========================================
   تكوين العمود D
========================================= */

function buildColumnD(){

  const result = [];


  document
    .querySelectorAll(
      '#tfQuestions .question'
    )
    .forEach(function(question){

      const q =
        safeText(
          question
            .querySelector('.tf-question')
            .value
        );


      const answer =
        question
          .querySelector('.tf-answer')
          .value;


      if(q && answer){

        result.push(
          '(' +
          q +
          '/' +
          answer +
          ')'
        );

      }

    });


  return result.join('');

}


/* =========================================
   تكوين العمود E
========================================= */

function buildColumnE(){

  const result = [];


  document
    .querySelectorAll(
      '#completeQuestions .question'
    )
    .forEach(function(question){

      const q =
        safeText(
          question
            .querySelector('.complete-question')
            .value
        );


      if(q){

        result.push(
          '(' +
          q +
          ')'
        );

      }

    });


  return result.join('');

}


/* =========================================
   تكوين العمود F
========================================= */

function buildColumnF(){

  const result = [];


  document
    .querySelectorAll(
      '#mixedQuestions .question'
    )
    .forEach(function(question){

      const type =
        safeText(
          question
            .querySelector('.mixed-type')
            .value
        );


      const questions =
        question
          .querySelector('.mixed-questions')
          .value
          .split(/\r?\n/)
          .map(x => safeText(x))
          .filter(Boolean);


      if(
        type &&
        questions.length
      ){

        result.push(
          '(' +
          type +
          '_' +
          questions.join('-') +
          ')'
        );

      }

    });


  return result.join('');

}


/* =========================================
   تكوين العمود G
========================================= */

function buildColumnG(){

  const result = [];


  document
    .querySelectorAll(
      '#extractQuestions .question'
    )
    .forEach(function(question){

      const passage =
        safeText(
          question
            .querySelector('.extract-passage')
            .value
        );


      const questions =
        question
          .querySelector('.extract-questions')
          .value
          .split(/\r?\n/)
          .map(x => safeText(x))
          .filter(Boolean);


      if(
        passage &&
        questions.length
      ){

        result.push(
          '(' +
          passage +
          ')' +
          '(' +
          questions.join('-') +
          ')'
        );

      }

    });


  return result.join('');

}


/* =========================================
   حفظ الاختبار
========================================= */

async function saveExam(){

  const select =
    document.getElementById('students');


  const selected =
    Array.from(
      select.selectedOptions
    );


  if(selected.length === 0){

    showStatus(
      'اختر طالبًا واحدًا على الأقل.',
      false
    );

    return;

  }


  const rows =
    selected
      .map(option => Number(option.value))
      .filter(row => row >= 2);


  const data = {

    C: buildColumnC(),

    D: buildColumnD(),

    E: buildColumnE(),

    F: buildColumnF(),

    G: buildColumnG()

  };


  if(
    !data.C &&
    !data.D &&
    !data.E &&
    !data.F &&
    !data.G
  ){

    showStatus(
      'لم تتم إضافة أي سؤال.',
      false
    );

    return;

  }


  const button =
    document.getElementById(
      'saveButton'
    );


  button.disabled = true;

  button.textContent =
    '⏳ جاري الحفظ...';


  try{

    const response =
      await fetch(
        API_URL,
        {
          method:'POST',

          headers:{
            'Content-Type':
              'text/plain;charset=utf-8'
          },

          body:JSON.stringify({

            action:'saveExam',

            rows:rows,

            data:data

          })

        }
      );


    const result =
      await response.json();


    if(!result.success){

      throw new Error(
        result.message ||
        'فشل حفظ الاختبار.'
      );

    }


    showStatus(
      result.message,
      true
    );


  }catch(error){

    showStatus(
      error.message ||
      'حدث خطأ أثناء الحفظ.',
      false
    );

  }finally{

    button.disabled = false;

    button.textContent =
      '💾 حفظ الاختبار';

  }

}


/* =========================================
   الرسائل
========================================= */

function showStatus(message, success){

  const box =
    document.getElementById(
      'status'
    );


  box.className =
    'status ' +
    (success ? 'success' : 'error');


  box.textContent =
    message;


  box.style.display =
    'block';


  box.scrollIntoView({
    behavior:'smooth',
    block:'center'
  });

}