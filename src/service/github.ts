import axios from "axios";
import _ from "lodash";
import * as dotenv from "dotenv";
dotenv.config();

//prepares the api request for github
const githubRequest = (url: string) => {
  const request: any = {
    method: "get",
    url: url,
    headers: {
      Authorization: `token ${process.env.GITHUB_AUTH_TOKEN}`,
    },
  };
  return request;
};

/**
 * @description Extracts file names from a github repository`
 * @param {string} repository - the name of the repository
 * @returns {Promise<any>} the count and files
 */
async function getRepositoryContent(
  githubName: string,
  repository: string
): Promise<any> {
  const github_url = `https://api.github.com/repos/${githubName}/${repository}/contents`;
  const request: any = githubRequest(github_url);

  const repoSolutions: any[] = await axios(request).then((res: any) => {
    const solutions = _.map(res.data, (folderDetails) => {
      return {
        name: _.get(folderDetails, "name"),
        url: _.get(folderDetails, "url"),
      };
    });
    return solutions;
  });

  return {
    count: repoSolutions.length ?? 0,
    rows: repoSolutions ?? [],
  };
}

/**
 * @description Navigates to solution folder and fetches content for each file
 * @param {string} url - the name of the repository
 * @returns {Promise<any>} the count and files
 */
async function getSolutions(url: any): Promise<any> {
  const request: any = githubRequest(url);
  const repoFolderFiles: any[] = await axios(request).then(
    (res: any) => res.data
  );

  const fileContent = await Promise.all(
    _.map(repoFolderFiles, async (fileContent) => {
      const { name, download_url } = fileContent;
      const solution: string = await axios
        .get(download_url)
        .then((res: any) => res.data);

      return {
        file_name: name,
        solution: solution,
      };
    })
  );

  return {
    count: fileContent.length,
    rows: fileContent,
  };
}

export default {
  getRepositoryContent,
  getSolutions,
};
