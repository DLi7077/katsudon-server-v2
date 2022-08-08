import axios from "axios";

/**
 * @description Extracts file names from a github repository
 * @param {string} repository - the name of the repository
 * @returns {Promise<any>} the count and files
 */
//https://stackoverflow.com/questions/2403122/regular-expression-to-extract-text-between-square-brackets
async function getRepositoryFiles(repository: string): Promise<any> {
  const github_url = `https://github.com/${repository}`;
  const solutions: string[] = await axios
    .get(github_url)
    .then((res: any) => {
      return res.status === 200 ? res.data : "";
    })
    .then((html) => {
      const fileLinkRegex = /"js-navigation-open Link--primary".+\>(.*?)\<\/a/g;
      const matches = [...html.matchAll(fileLinkRegex)];
      const fileTitles = matches.map((match) => {
        return match[1];
      });
      return fileTitles;
    });

  return {
    count: solutions.length ?? 0,
    rows: solutions ?? [],
  };
}

async function getSolution(repository: string, fileName: string): Promise<any> {
  const fileRegex = /.+(?=\.)/;
  const folderName = fileRegex.exec(fileName) ?? [];
  const url = `https://raw.githubusercontent.com/${repository}/master/${folderName[0]}/${fileName}`;
  //https://raw.githubusercontent.com/DLi7077/Leetcode-Solutions/master/1-two-sum/1-two-sum.cpp
  return await axios.get(url);
}

export default {
  getRepositoryFiles,
  getSolution,
};
