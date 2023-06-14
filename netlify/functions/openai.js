import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function handler(event) {
  try {
    console.log("openai cagrildi");
    console.log(
      "process.env.VITE_OPENAI_API_KEY -->",
      process.env.VITE_OPENAI_API_KEY
    );
    const { messages } = JSON.parse(event.body);
    console.log("messages-->", messages);
    const conversationArr = [...messages];
    console.log("conversationArr-->", conversationArr);
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: conversationArr,
      presence_penalty: 0,
      frequency_penalty: 0.3,
    });

    const reply = response.data.choices[0].message.content;
    console.log("reply-->", reply);
    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong" }, error),
    };
  }
}
