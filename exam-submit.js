/* =====================================================
إرسال الاختبار
===================================================== */

function submitExam(){

if(!EXAM_DATA){

examSubmitError(
  'لا توجد بيانات للاختبار.'
);

return;

}

const answers = {

H: [],

I: [],

J: [],

K: [],

L: []

};

/* ===================================================
الاختيار من متعدد
=================================================== */

const choice =
EXAM_DATA.sections &&
Array.isArray(
EXAM_DATA.sections.choice
)
? EXAM_DATA.sections.choice
: [];

choice.forEach(
function(question){

  const selected =
    document.querySelector(
      'input[name="' +
      question.id +
      '"]:checked'
    );


  answers.H.push({

    id:
      question.id,

    answer:
      selected
        ? selected.value
        : ''

  });

}

);

/* ===================================================
صح وخطأ
=================================================== */

const trueFalse =
EXAM_DATA.sections &&
Array.isArray(
EXAM_DATA.sections.trueFalse
)
? EXAM_DATA.sections.trueFalse
: [];

trueFalse.forEach(
function(question){

  const selected =
    document.querySelector(
      'input[name="' +
      question.id +
      '"]:checked'
    );


  answers.I.push({

    id:
      question.id,

    answer:
      selected
        ? selected.value
        : ''

  });

}

);

/* ===================================================
أكمل
=================================================== */

const complete =
EXAM_DATA.sections &&
Array.isArray(
EXAM_DATA.sections.complete
)
? EXAM_DATA.sections.complete
: [];

complete.forEach(
function(question){

  const input =
    document.getElementById(
      question.id
    );


  answers.J.push({

    id:
      question.id,

    answer:
      input
        ? input.value.trim()
        : ''

  });

}

);

/* ===================================================
الأسئلة المتنوعة
=================================================== */

const mixed =
EXAM_DATA.sections &&
Array.isArray(
EXAM_DATA.sections.mixed
)
? EXAM_DATA.sections.mixed
: [];

mixed.forEach(
function(group){

  const questions =
    Array.isArray(
      group.questions
    )
      ? group.questions
      : [];


  questions.forEach(
    function(question, index){

      const input =
        document.getElementById(
          group.id +
          '_' +
          index
        );


      answers.K.push({

        id:
          group.id +
          '_' +
          index,

        answer:
          input
            ? input.value.trim()
            : ''

      });

    }
  );

}

);

/* ===================================================
استخرج
=================================================== */

const extract =
EXAM_DATA.sections &&
Array.isArray(
EXAM_DATA.sections.extract
)
? EXAM_DATA.sections.extract
: [];

extract.forEach(
function(group){

  const questions =
    Array.isArray(
      group.questions
    )
      ? group.questions
      : [];


  questions.forEach(
    function(question, index){

      const input =
        document.getElementById(
          group.id +
          '_' +
          index
        );


      answers.L.push({

        id:
          group.id +
          '_' +
          index,

        answer:
          input
            ? input.value.trim()
            : ''

      });

    }
  );

}

);

/* ===================================================
تأكيد بسيط
=================================================== */

const confirmed =
window.confirm(
'هل أنت متأكد من إرسال الاختبار؟'
);

if(!confirmed){

return;

}

const button =
document.getElementById(
'examSubmitButton'
);

if(button){

button.disabled =
  true;

button.textContent =
  'جاري إرسال الاختبار...';

}

/* ===================================================
البيانات المرسلة
=================================================== */

const payload = {

action:
  'submitExam',

userId:
  currentSenderId,

examId:
  EXAM_DATA.examId || '',

answers:
  answers

};

/* ===================================================
إرسال إلى Main.gs
=================================================== */

request(

currentSenderId,

'EXAM_SUBMIT:' +
JSON.stringify(
  payload
)

);

}

/* =====================================================
استقبال نتيجة الإرسال
===================================================== */

function handleExamSubmitResponse(
data
){

if(!data){

examSubmitError(
  'لم تصل نتيجة إرسال الاختبار.'
);

return;

}

if(data.success){

examSubmitSuccess(

  data.message ||
  'تم إرسال الاختبار بنجاح ✅'

);

return;

}

examSubmitError(

data.message ||
'حدث خطأ أثناء إرسال الاختبار.'

);

}