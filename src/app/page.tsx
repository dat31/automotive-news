import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { Intro } from "@/app/_components/intro";
import { MoreStories } from "@/app/_components/more-stories";
import { getArticleByFolder } from "@/lib/api";

export default function Index() {
  const electricVehicleArticles = getArticleByFolder("electric");
  const petrolVehicleArticles = getArticleByFolder("petrol");
  const [heroArticle] = electricVehicleArticles;
  const { title, coverImage, date, author, slug, excerpt } = heroArticle;

  return (
    <main>
      <Container>
        <Intro />
        <HeroPost
          title={title}
          coverImage={coverImage}
          date={date}
          author={author}
          slug={slug}
          excerpt={excerpt}
        />
        {electricVehicleArticles.slice(1, electricVehicleArticles.length)
          .length > 0 && (
          <MoreStories
            articles={electricVehicleArticles.slice(
              1,
              electricVehicleArticles.length
            )}
            title={"Electric vehicles"}
          />
        )}
        {petrolVehicleArticles.length > 0 && (
          <MoreStories
            articles={petrolVehicleArticles}
            title={"Petrol vehicles"}
          />
        )}
      </Container>
    </main>
  );
}
