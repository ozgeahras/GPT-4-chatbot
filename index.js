document.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = document.getElementById("user-input").value;

  const response = await fetch("/.netlify/functions/openai", {
    method: "POST",
    body: JSON.stringify({ userInput }),
  });

  if (response.ok) {
    const data = await response.json();
    const reply = data.reply;
    renderUserInput(userInput);
    renderTypewriterText(reply);
  } else {
    console.error("Failed to fetch reply from OpenAI API");
  }
});

function renderUserInput(text) {
  const newSpeechBubble = document.createElement("div");
  newSpeechBubble.classList.add("speech", "speech-human");
  newSpeechBubble.textContent = text;
  chatbotConversation.appendChild(newSpeechBubble);
  chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
}

function renderTypewriterText(text) {
  const newSpeechBubble = document.createElement("div");
  newSpeechBubble.classList.add("speech", "speech-ai", "blinking-cursor");
  chatbotConversation.appendChild(newSpeechBubble);
  let i = 0;
  const interval = setInterval(() => {
    newSpeechBubble.textContent += text.slice(i - 1, i);
    if (text.length === i) {
      clearInterval(interval);
      newSpeechBubble.classList.remove("blinking-cursor");
    }
    i++;
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
  }, 50);
}

function renderConversationFromDb() {
  get(conversationInDb).then(async (snapshot) => {
    if (snapshot.exists()) {
      Object.values(snapshot.val()).forEach((dbObj) => {
        const newSpeechBubble = document.createElement("div");
        newSpeechBubble.classList.add(
          "speech",
          `speech-${dbObj.role === "user" ? "human" : "ai"}`
        );
        newSpeechBubble.textContent = dbObj.content;
        chatbotConversation.appendChild(newSpeechBubble);
      });
      chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
    }
  });
}

document.getElementById("clear-btn").addEventListener("click", () => {
  remove(conversationInDb);
  chatbotConversation.innerHTML =
    '<div class="speech speech-ai">How can I help you?</div>';
});

renderConversationFromDb();
