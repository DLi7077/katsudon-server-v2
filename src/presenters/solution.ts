import _ from "lodash";

//Presents an posted solution
function present(solution: any): any {
  return solution;
}

function presentAll(solutions: any[]): any[] {
  return _.map(solutions, (solution) => present(solution));
}

export default {
  present,
  presentAll,
};
