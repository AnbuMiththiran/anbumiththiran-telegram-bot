async function getLatestPost() {
  const { data } = await axios.get(SITE);
  const $ = cheerio.load(data);

  const allLinks = $("a").map((i, el) => $(el).attr("href")).get();
  console.log("All links found:", allLinks);

  const link = $("a[href*='post.html?id=']").first().attr("href");
  if (!link) return null;

  return "https://www.anbumiththiran.in/" + link;
}
