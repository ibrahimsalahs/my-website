/* =====================================================
EXAM DATA
===================================================== */

let EXAM_DATA = null;

/* =====================================================
استقبال الاختبار
===================================================== */

function renderExamResponse(data){

if(!data){

showError(
  'لم تصل بيانات الاختبار.'
);

return;

}

if(data.available === false){

showExamMessage(
  data.message ||
  'لا يوجد اختبار متاح لك حاليًا.',
  false
);

return;

}

EXAM_DATA = data;

openExam();

renderExam();

}

/* =====================================================
فتح شاشة الاختبار
===================================================== */

function openExam(){

const overlay =
document.getElementById(
'examOverlay'
);

if(!overlay){

showError(
  'لم يتم العثور على شاشة الاختبار.'
);

return;

}

overlay.style.display =
'block';

document.body.style.overflow =
'hidden';

window.scrollTo({
top:0
});

}

/* =====================================================
إغلاق الاختبار
===================================================== */

function closeExam(){

const overlay =
document.getElementById(
'examOverlay'
);

if(!overlay){
return;
}

overlay.style.display =
'none';

document.body.style.overflow =
'';

/*

* لا نمسح EXAM_DATA
* حتى تظل البيانات موجودة
* إذا أراد المستخدم فتح الاختبار مرة أخرى.
  */

}

/* =====================================================
رسم الاختبار
===================================================== */

function renderExam(){

const banner =
document.getElementById(
'examBanner'
);

if(!banner){
return;
}

banner.innerHTML = '';

const container =
document.createElement('div');

container.className =
'exam-container';

/* ===================================================
العنوان
=================================================== */

const top =
document.createElement('div');

top.className =
'exam-top';

const title =
document.createElement('div');

title.className =
'exam-title';

title.textContent =
'📚 الاختبار';

const close =
document.createElement('button');

close.className =
'exam-close';

close.textContent =
'×';

close.type =
'button';

close.onclick =
function(){

  closeExam();

};

top.appendChild(
title
);

top.appendChild(
close
);

container.appendChild(
top
);

/* ===================================================
بيانات الطالب
=================================================== */

renderStudentInfo(
container
);

/* ===================================================
الأقسام
=================================================== */

const sections =
EXAM_DATA.sections ||
{};

renderChoice(
container,
sections.choice
);

renderTrueFalse(
container,
sections.trueFalse
);

renderComplete(
container,
sections.complete
);

renderMixed(
container,
sections.mixed
);

renderExtract(
container,
sections.extract
);

/* ===================================================
مكان رسالة الإرسال
=================================================== */

const message =
document.createElement('div');

message.id =
'examSubmitMessage';

message.className =
'exam-message';

message.style.display =
'none';

container.appendChild(
message
);

/* ===================================================
زر الإرسال
=================================================== */

const submit =
document.createElement('button');

submit.id =
'examSubmitButton';

submit.className =
'exam-submit';

submit.type =
'button';

submit.textContent =
'📤 إرسال الاختبار';

submit.onclick =
function(){

  if(
    typeof submitExam ===
    'function'
  ){

    submitExam();

  }else{

    showExamMessage(
      'ملف exam-submit.js غير محمل.',
      false
    );

  }

};

container.appendChild(
submit
);

banner.appendChild(
container
);

}

/* =====================================================
بيانات الطالب
===================================================== */

function renderStudentInfo(
container
){

const student =
EXAM_DATA.student ||
{};

const box =
document.createElement('div');

box.className =
'exam-student';

const name =
document.createElement('div');

name.style.fontSize =
'18px';

name.style.fontWeight =
'bold';

name.textContent =
'👤 ' +
(
student.name ||
'الطالب'
);

box.appendChild(
name
);

if(student.code){

const code =
  document.createElement('div');

code.style.color =
  '#9ca3af';

code.style.marginTop =
  '7px';

code.textContent =
  'كود الطالب: ' +
  student.code;


box.appendChild(
  code
);

}

if(student.subject){

const subject =
  document.createElement('div');

subject.style.color =
  '#9ca3af';

subject.style.marginTop =
  '5px';

subject.textContent =
  'المادة: ' +
  student.subject;


box.appendChild(
  subject
);

}

container.appendChild(
box
);

}

/* =====================================================
قسم الاختيار من متعدد
===================================================== */

function renderChoice(
container,
questions
){

if(
!Array.isArray(questions) ||
!questions.length
){

return;

}

const section =
createExamSection(
'📝 أولًا: اختر الإجابة الصحيحة'
);

questions.forEach(
function(question){

  const box =
    createQuestionBox(
      question.question
    );


  const options =
    Array.isArray(
      question.options
    )
      ? question.options
      : [];


  options.forEach(
    function(option){

      const label =
        document.createElement('label');

      label.className =
        'exam-option';


      const input =
        document.createElement('input');

      input.type =
        'radio';

      input.name =
        question.id;

      input.value =
        option;


      label.appendChild(
        input
      );


      const text =
        document.createElement('span');

      text.textContent =
        option;


      label.appendChild(
        text
      );


      box.appendChild(
        label
      );

    }
  );


  section.appendChild(
    box
  );

}

);

container.appendChild(
section
);

}

/* =====================================================
صح وخطأ
===================================================== */

function renderTrueFalse(
container,
questions
){

if(
!Array.isArray(questions) ||
!questions.length
){

return;

}

const section =
createExamSection(
'✅ ثانيًا: صح أم خطأ'
);

questions.forEach(
function(question){

  const box =
    createQuestionBox(
      question.question
    );


  [
    'صح',
    'خطأ'
  ].forEach(
    function(option){

      const label =
        document.createElement('label');

      label.className =
        'exam-option';


      const input =
        document.createElement('input');

      input.type =
        'radio';

      input.name =
        question.id;

      input.value =
        option;


      label.appendChild(
        input
      );


      const text =
        document.createElement('span');

      text.textContent =
        option;


      label.appendChild(
        text
      );


      box.appendChild(
        label
      );

    }
  );


  section.appendChild(
    box
  );

}

);

container.appendChild(
section
);

}

/* =====================================================
أكمل
===================================================== */

function renderComplete(
container,
questions
){

if(
!Array.isArray(questions) ||
!questions.length
){

return;

}

const section =
createExamSection(
'✏️ ثالثًا: أكمل'
);

questions.forEach(
function(question){

  const box =
    createQuestionBox(
      question.question
    );


  const input =
    document.createElement('input');

  input.type =
    'text';

  input.className =
    'exam-text-input';

  input.id =
    question.id;

  input.placeholder =
    'اكتب الإجابة هنا';


  box.appendChild(
    input
  );


  section.appendChild(
    box
  );

}

);

container.appendChild(
section
);

}

/* =====================================================
الأسئلة المتنوعة
===================================================== */

function renderMixed(
container,
groups
){

if(
!Array.isArray(groups) ||
!groups.length
){

return;

}

const section =
createExamSection(
'📖 رابعًا: أسئلة متنوعة'
);

groups.forEach(
function(group){

  if(group.type){

    const typeTitle =
      document.createElement('div');

    typeTitle.style.color =
      '#9ca3af';

    typeTitle.style.marginBottom =
      '10px';

    typeTitle.textContent =
      group.type;


    section.appendChild(
      typeTitle
    );

  }


  const questions =
    Array.isArray(
      group.questions
    )
      ? group.questions
      : [];


  questions.forEach(
    function(question, index){

      const box =
        createQuestionBox(
          question
        );


      const input =
        document.createElement('input');

      input.type =
        'text';

      input.className =
        'exam-text-input';

      input.id =
        group.id +
        '_' +
        index;

      input.placeholder =
        'اكتب الإجابة هنا';


      box.appendChild(
        input
      );


      section.appendChild(
        box
      );

    }
  );

}

);

container.appendChild(
section
);

}

/* =====================================================
استخرج
===================================================== */

function renderExtract(
container,
groups
){

if(
!Array.isArray(groups) ||
!groups.length
){

return;

}

const section =
createExamSection(
'🔎 خامسًا: استخرج'
);

groups.forEach(
function(group){

  const passage =
    document.createElement('div');

  passage.className =
    'exam-passage';

  passage.textContent =
    group.passage || '';


  section.appendChild(
    passage
  );


  const questions =
    Array.isArray(
      group.questions
    )
      ? group.questions
      : [];


  questions.forEach(
    function(question, index){

      const box =
        createQuestionBox(
          question
        );


      const input =
        document.createElement('input');

      input.type =
        'text';

      input.className =
        'exam-text-input';

      input.id =
        group.id +
        '_' +
        index;

      input.placeholder =
        'اكتب الإجابة هنا';


      box.appendChild(
        input
      );


      section.appendChild(
        box
      );

    }
  );

}

);

container.appendChild(
section
);

}

/* =====================================================
إنشاء قسم
===================================================== */

function createExamSection(
title
){

const section =
document.createElement('div');

section.className =
'exam-section';

const heading =
document.createElement('div');

heading.className =
'exam-section-title';

heading.textContent =
title;

section.appendChild(
heading
);

return section;

}

/* =====================================================
إنشاء سؤال
===================================================== */

function createQuestionBox(
question
){

const box =
document.createElement('div');

box.className =
'exam-question';

const text =
document.createElement('div');

text.className =
'exam-question-text';

text.textContent =
question || '';

box.appendChild(
text
);

return box;

}

/* =====================================================
رسالة داخل الاختبار
===================================================== */

function showExamMessage(
message,
success
){

const overlay =
document.getElementById(
'examOverlay'
);

if(!overlay){
return;
}

openExam();

const banner =
document.getElementById(
'examBanner'
);

if(!banner){
return;
}

const old =
document.getElementById(
'examSubmitMessage'
);

if(old){

old.style.display =
  'block';

old.className =
  success
    ? 'exam-message exam-success'
    : 'exam-message exam-error';

old.textContent =
  message;

return;

}

const messageBox =
document.createElement('div');

messageBox.className =
success
? 'exam-message exam-success'
: 'exam-message exam-error';

messageBox.textContent =
message;

banner.prepend(
messageBox
);

}

/* =====================================================
نجاح إرسال الاختبار
===================================================== */

function examSubmitSuccess(
message
){

const box =
document.getElementById(
'examSubmitMessage'
);

if(box){

box.style.display =
  'block';

box.className =
  'exam-message exam-success';

box.textContent =
  message ||
  'تم إرسال الاختبار بنجاح ✅';

}

const button =
document.getElementById(
'examSubmitButton'
);

if(button){

button.disabled =
  true;

button.textContent =
  '✅ تم إرسال الاختبار';

}

}

/* =====================================================
خطأ إرسال الاختبار
===================================================== */

function examSubmitError(
message
){

const box =
document.getElementById(
'examSubmitMessage'
);

if(box){

box.style.display =
  'block';

box.className =
  'exam-message exam-error';

box.textContent =
  message ||
  'حدث خطأ أثناء إرسال الاختبار.';

}

}