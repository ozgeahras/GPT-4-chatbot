import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, get, remove } from "firebase/database";

const appSettings = {
  databaseURL:
    "https://wise-owl-e4e5f-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const conversationInDb = ref(database);
const chatbotConversation = document.getElementById("chatbot-conversation");

const instructionObj = {
  role: "system",
  content: "You are a helpful assistant.",
};

document.addEventListener("submit", (e) => {
  e.preventDefault();
  const userInput = document.getElementById("user-input");
  const inputContent = userInput.value.trim();

  if (inputContent) {
    const messageObj = {
      role: "user",
      content: inputContent,
    };

    console.log("Pushing message to database:", messageObj);

    push(conversationInDb, messageObj)
      .then(() => {
        fetchReply(messageObj);
        const newSpeechBubble = document.createElement("div");
        newSpeechBubble.classList.add("speech", "speech-human");
        chatbotConversation.appendChild(newSpeechBubble);
        newSpeechBubble.textContent = inputContent;
        userInput.value = "";
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
      })
      .catch((error) => {
        console.error("Error pushing message to database:", error);
      });
  } else {
    console.log("Input content is empty");
  }
});

function fetchReply() {
  get(conversationInDb).then(async (snapshot) => {
    if (snapshot.exists()) {
      const conversationArr = Object.values(snapshot.val());
      conversationArr.unshift(instructionObj);
      const response = await fetch("/.netlify/functions/openai", {
        method: "POST",
        body: JSON.stringify({ messages: conversationArr }),
      });
      const { reply } = await response.json();
      push(conversationInDb, {
        role: "ai",
        content: reply,
      });
      renderTypewriterText(reply);
    } else {
      console.log("No data available");
    }
  });
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

document.getElementById("clear-btn").addEventListener("click", () => {
  remove(conversationInDb);
  chatbotConversation.innerHTML =
    '<div class="speech speech-ai">How can I help you?</div>';
});

function renderConversationFromDb() {
  get(conversationInDb).then(async (snapshot) => {
    if (snapshot.exists()) {
      Object.values(snapshot.val()).forEach((dbObj) => {
        const newSpeechBubble = document.createElement("div");
        newSpeechBubble.classList.add(
          "speech",
          `speech-${dbObj.role === "user" ? "human" : "ai"}`
        );
        chatbotConversation.appendChild(newSpeechBubble);
        newSpeechBubble.textContent = dbObj.content;
      });
      chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
    }
  });
}

renderConversationFromDb();
