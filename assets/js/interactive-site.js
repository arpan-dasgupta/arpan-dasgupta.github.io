(() => {
  const form = document.getElementById("focus-form");
  const moodSelect = document.getElementById("mood-select");
  const focusLength = document.getElementById("focus-length");
  const focusLengthValue = document.getElementById("focus-length-value");
  const focusOutput = document.getElementById("focus-output");
  const ideaButton = document.getElementById("idea-button");
  const motivationButton = document.getElementById("motivation-button");
  const ideaOutput = document.getElementById("idea-output");
  const motivationCount = document.getElementById("motivation-count");

  if (
    !form ||
    !moodSelect ||
    !focusLength ||
    !focusLengthValue ||
    !focusOutput ||
    !ideaButton ||
    !motivationButton ||
    !ideaOutput ||
    !motivationCount
  ) {
    return;
  }

  const moodPrompts = {
    curious: "Explore one unfamiliar paper or tool and summarize 3 takeaways.",
    energetic: "Tackle the hardest pending task first, then log what unlocked progress.",
    calm: "Deepen one active idea by drafting a clean, minimal implementation.",
    stuck: "Break your task into 3 tiny wins and complete the first one now.",
  };

  const projectIdeas = [
    "Build a tiny demo that compares two bandit strategies on synthetic data.",
    "Write a visual explainer of a concept you learned this week in under 300 words.",
    "Prototype a lightweight dashboard to track experiments and outcomes.",
    "Implement a reusable utility that cleans and validates dataset metadata.",
    "Create a one-page FAQ for your current project with key assumptions and risks.",
  ];

  let momentum = 0;

  focusLength.addEventListener("input", () => {
    focusLengthValue.textContent = focusLength.value;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const mood = moodSelect.value;
    const minutes = Number.parseInt(focusLength.value, 10);
    const prompt = moodPrompts[mood] || moodPrompts.curious;
    focusOutput.textContent = `For the next ${minutes} minutes: ${prompt}`;
  });

  ideaButton.addEventListener("click", () => {
    const index = Math.floor(Math.random() * projectIdeas.length);
    ideaOutput.textContent = projectIdeas[index];
  });

  motivationButton.addEventListener("click", () => {
    momentum += 1;
    motivationCount.textContent = String(momentum);
  });
})();
