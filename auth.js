const studentCode=localStorage.getItem("studentCode");
document.addEventListener("DOMContentLoaded",()=>{if(!studentCode)return;const inputs=document.querySelectorAll("#code,#examNumber");inputs.forEach(input=>{input.value=studentCode;input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));});});
function getStudentCode(){return localStorage.getItem("studentCode")||"";}
function clearStudentCode(){localStorage.removeItem("studentCode");}