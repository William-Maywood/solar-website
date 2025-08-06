function showTab(tabId) {
  const allTabs = document.getElementsByClassName('tab-content');
  for (let i = 0; i < allTabs.length; i++) {
    allTabs[i].style.display = 'none';
  }

  const tabButtons = document.getElementsByClassName('tab');
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].classList.remove('active');
  }

  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.style.display = 'block';
  }

  const clickedButton = document.querySelector(`button[onclick="showTab('${tabId}')"]`);
  if (clickedButton) {
    clickedButton.classList.add('active');
  }

  if (tabId !== 'quiz') {
    resetQuiz();
  }
}

window.onload = function () {
  showTab('solar');
};
function submitQuiz() {
  const answers = {
    q1: "D",
    q2: "B",
    q3: "C",
    q4: "D",
    q5: "B",
    q6: "C",
    q7: "C",
    q8: "C",
    q9: "B"
  };

  let score = 0;

  for (let q in answers) {
    const selected = document.querySelector(`input[name="${q}"]:checked`);
    const feedback = document.getElementById(`${q}_feedback`);

    if (!feedback) continue;

    if (selected && selected.value === answers[q]) {
      feedback.textContent = " ✅";
      feedback.style.color = "green";
      score++;
    } else {
      feedback.textContent = " ❌ 🥀 wrong";
      feedback.style.color = "red";
    }
  }

  const result = document.getElementById("quizResult");
  result.textContent = `✅ You got ${score} out of 9 correct.`;
}

function resetQuiz() {
  const form = document.getElementById("quizForm");
  if (form) form.reset();

  const result = document.getElementById("quizResult");
  if (result) result.textContent = "";

  const feedbacks = document.querySelectorAll(".feedback");
  feedbacks.forEach(fb => fb.textContent = "");
}