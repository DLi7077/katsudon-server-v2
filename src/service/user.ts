import axios from "axios";

async function GithubRepoFiles(github_url: string): Promise<any> {
  const solutions = await axios
    .get(github_url)
    .then((res) => {
      return res.status === 200 ? res.data : "";
    })
    .then((html) => {
      const fileLinkRegex = /"js-navigation-open Link--primary".+\>(.*?)\<\/a/g;
      const matches = [...html.matchAll(fileLinkRegex)];
      const fileTitles = matches.map((match) => {
        return match[1];
      });
      return fileTitles;
    })
    .catch((e) => {
      console.error(e);
      return [];
    });

  return solutions;
}

export default GithubRepoFiles;
