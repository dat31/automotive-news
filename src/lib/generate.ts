import OpenAI from "openai";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const NUM_OF_ARTICLES = 9;
const ARTICLES_DIRECTORY = join(process.cwd(), "_articles");
const ASSETS_DIRECTORY = join(process.cwd(), "public", "assets");

export default async function generateArticles() {
  cleanArticlesDirectory();

  const completions = await Promise.all(
    Array.from(new Array(NUM_OF_ARTICLES).keys())
      .map(generateMessage)
      .map((m) => openai.chat.completions.create(m))
  );

  await Promise.all(
    completions.map(({ choices: [choice] }: any, index) =>
      delay(20000 * index).then(() => extractCompletionsData(choice, index))
    )
  );
}

function generateMessage(index: number) {
  return {
    model: "gpt-4o-mini-2024-07-18",
    messages: [
      {
        role: "user",
        content: `generate an article about ${getTypeOfVehicleByIndex(
          index
        )} vehicle. must be valid markdown format. must includes following properties. should not includes ${"```markdown and ```"}, and not duplicate with previous completion:
          ---
          url: url of article. must be format url-to-the-article. this url will be use as file name. so it should not includes https://
          title: title of article, about 20 words. should not includes special character
          excerpt: excerpt of article, about 30 words. should not includes special character
          author:
            name: name of author. generate a random name
            avatar: avatar url of author
          ---
  
          content goes here. includes at least 300 words. includes at least 3 ## section`,
      },
    ],
  } as any;
}

async function extractCompletionsData(completion: any, index: number) {
  const { content } = completion.message;
  const { data } = matter(content as string);
  const url = getUrl(data.url, getTypeOfVehicleByIndex(index));
  const postsDirectory = join(
    ARTICLES_DIRECTORY,
    getTypeOfVehicleByIndex(index)
  );
  const fullPath = join(postsDirectory, `${url}.md`);
  await generateImage(data.title, url);
  fs.writeFile(fullPath, content as string, console.log);
}

async function generateImage(prompt: string, filename: string) {
  const path = join(ASSETS_DIRECTORY, filename);

  if (fs.existsSync(path)) {
    return;
  }

  const image = await openai.images.generate({
    response_format: "b64_json",
    model: process.env.IMAGE_MODEL,
    size: process.env.IMAGE_RESOLUTION,
    prompt,
  } as any);
  const base64 = image.data[0].b64_json;

  fs.mkdirSync(path);
  const imagePath = join(path, "cover.jpg");
  fs.writeFile(imagePath, base64 as string, "base64", console.log);
  // if (process.env.NODE_ENV !== "production") {
  //   sharp(Buffer.from(base64, "base64"))
  //     .resize({
  //       width: 1024,
  //       height: 1024 / 2,
  //       fit: "cover",
  //     })
  //     .toFile(imagePath);
  // } else {
  //   fs.writeFile(imagePath, base64, "base64", (err) => {
  //     console.log(err);
  //   });
  // }
}

function cleanArticlesDirectory() {
  if (fs.existsSync(ARTICLES_DIRECTORY)) {
    fs.rmSync(ARTICLES_DIRECTORY, { recursive: true, force: true });
    fs.mkdirSync(ARTICLES_DIRECTORY);
  } else {
    fs.mkdirSync(ARTICLES_DIRECTORY);
  }
  const electricDirectory = join(ARTICLES_DIRECTORY, "electric");
  if (fs.existsSync(electricDirectory)) {
    fs.rmSync(electricDirectory, { recursive: true, force: true });
    fs.mkdirSync(electricDirectory);
  } else {
    fs.mkdirSync(electricDirectory);
  }
  const petrolDirectory = join(ARTICLES_DIRECTORY, "petrol");
  if (fs.existsSync(petrolDirectory)) {
    fs.rmSync(petrolDirectory, { recursive: true, force: true });
    fs.mkdirSync(petrolDirectory);
  } else {
    fs.mkdirSync(petrolDirectory);
  }
}

function getTypeOfVehicleByIndex(index: number) {
  return index < 5 ? "electric" : "petrol";
}

function getUrl(url: string, path: string) {
  if (fs.existsSync(path)) {
    return `${url}-2`;
  }
  return url;
}

function delay(ms = 15000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
