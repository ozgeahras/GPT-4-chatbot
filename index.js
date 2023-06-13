import openai from "./openaiConfig.js";
import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";

const chatbotConversation = document.getElementById("chatbot-conversation");
const appSettings = {
  databaseURL:
    "https://wise-owl-e4e5f-default-rtdb.europe-west1.firebasedatabase.app/",
};
const app = initializeApp(appSettings);
const database = getDatabase(app);
const conversationInDb = ref(database);

const conversationArr = [
  {
    role: "system",
    content:
      "You are a highly knowledgeable assistant that is always happy to help.",
  },
];

document.addEventListener("submit", (e) => {
  e.preventDefault();
  const userInput = document.getElementById("user-input");
  conversationArr.push({
    role: "user",
    content: userInput.value,
  });
  fetchReply();
  const newSpeechBubble = document.createElement("div");
  newSpeechBubble.classList.add("speech", "speech-human");
  chatbotConversation.appendChild(newSpeechBubble);
  newSpeechBubble.textContent = userInput.value;
  userInput.value = "";
  chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
});

async function fetchReply() {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: conversationArr,
    temperature: 0.7,
    presence_penalty: 0,
    frequency_penalty: 0.2,
  });
  conversationArr.push(response.data.choices[0].message);
  renderTypewriterText(response.data.choices[0].message.content);
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
