import { Configuration, OpenAIApi } from "openai";
import { process } from "../../.env";

const configuration = new Configuration({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function handler(event, context) {
  try {
    const { messages } = JSON.parse(event.body);
    const conversationArr = [...messages];
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: conversationArr,
      presence_penalty: 0,
      frequency_penalty: 0.3,
    });

    const reply = response.data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong" }),
    };
  }
}
