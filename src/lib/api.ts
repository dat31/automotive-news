import { Article } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import generateArticles from "./generate";

const articleDirectory = join(process.cwd(), "_articles");

export function getArticleSlugs() {
  return fs
    .readdirSync(articleDirectory)
    .reduce(
      (acc, dir) =>
        acc.concat(fs.readdirSync(join(articleDirectory, dir)) as any),
      []
    );
}

export function getArticleBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = getArticlePath(realSlug);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    ...data,
    slug: realSlug,
    content,
    date: new Date().toISOString(),
    coverImage: `/assets/${data.url}/cover.jpg`,
  } as Article;
}

export async function getAllArticles(): Promise<Article[]> {
  await generateArticles();
  const slugs = getArticleSlugs();
  const posts = slugs.map((slug) => getArticleBySlug(slug));
  return posts;
}

export function getArticleByFolder(folder: string): Article[] {
  return fs.readdirSync(join(articleDirectory, folder)).map((filename) => {
    const file = fs.readFileSync(
      join(articleDirectory, folder, filename),
      "utf8"
    );
    const { data, content } = matter(file);
    return {
      ...data,
      slug: data.url,
      content,
      date: new Date().toISOString(),
      coverImage: `/assets/${data.url}/cover.jpg`,
    } as Article;
  });
}

function getArticlePath(slug: string) {
  const fullPath = join(articleDirectory, "petrol", `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return join(articleDirectory, "electric", `${slug}.md`);
  }
  return fullPath;
}
