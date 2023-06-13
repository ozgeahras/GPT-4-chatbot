import openai from "./openaiConfig.js";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, get } from "firebase/database";

const chatbotConversation = document.getElementById("chatbot-conversation");
const appSettings = {
  databaseURL:
    "https://wise-owl-e4e5f-default-rtdb.europe-west1.firebasedatabase.app/",
};
const app = initializeApp(appSettings);
const database = getDatabase(app);
const conversationInDb = ref(database);

const instructionObj = {
  role: "system",
  content: "You are an assistant that gives very short answers.",
};

exports.handler = async (event, context) => {
  if (event.httpMethod === "POST") {
    const requestBody = JSON.parse(event.body);
    const userInput = requestBody.userInput;
    push(conversationInDb, {
      role: "user",
      content: userInput,
    });
    await fetchReply();
    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Reply fetched successfully!" }),
    };
    return response;
  }

  const response = {
    statusCode: 400,
    body: JSON.stringify({ message: "Invalid request method" }),
  };
  return response;
};

async function fetchReply() {
  const snapshot = await get(conversationInDb);
  if (snapshot.exists()) {
    const conversationArr = Object.values(snapshot.val());
    conversationArr.unshift(instructionObj);
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: conversationArr,
      presence_penalty: 0,
      frequency_penalty: 0.3,
    });
    push(conversationInDb, response.data.choices[0].message);
    return response.data.choices[0].message.content;
  } else {
    console.log("No data available");
    return "";
  }
}
