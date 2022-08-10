import _ from "lodash";

//Presents a single file
function presentFile(file: any): any {
  const fileType = (_.get(file, "file_name") ?? "").split(".")[1];
  const solutionType = fileType === "md" ? {} : { file_type: fileType };
  return _.assign(file, solutionType);
}

//Presents many files
function presentAll(files: any[]): any[] {
  return _.map(files, (file) => presentFile(file));
}

export default {
  presentFile,
  presentAll,
};
