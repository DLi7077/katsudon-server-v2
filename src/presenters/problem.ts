import _ from 'lodash';

// Presents an upserted problem
function present(problem: any): any {
  return problem;
}

function presentAll(problems: any[]): any[] {
  return _.map(problems, (problem) => present(problem));
}

export default {
  present,
  presentAll,
};
