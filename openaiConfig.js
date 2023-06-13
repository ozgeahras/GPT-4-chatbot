import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  organization: "org-8sBBKnnzpa0m1QQdIgYJtvhS",
  apiKey: process.env.VITE_OPENAI_API_KEY,
});
delete configuration.baseOptions.headers["User-Agent"];
const openai = new OpenAIApi(configuration);

export default openai;
