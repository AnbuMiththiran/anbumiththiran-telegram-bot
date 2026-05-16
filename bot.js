async function getLatestPost() {
  const { data } = await axios.get(SITE);
  const $ = cheerio.load(data);

  // Find the first "Read Now" link
  const link = $("a")
    .filter((i, el) => $(el).text().trim() === "Read Now")
    .first()
    .attr("href");

  if (!link) return null;

  return link.startsWith("http")
    ? link
    : "https://www.anbumiththiran.in/" + link.replace(/^\//, "");
}
