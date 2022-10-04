import _ from 'lodash';

/**
 * @description groups solutions for each problem by language
 * @param {any[]} solutionList the processed and completed solution list from a query
 * @returns {any[]} an updated list containing the most recent solution for each language per problem
 */
export default function groupSolutionsByDate(solutionList: any[]): any {
  // for each problem, group each language by most recent
  const updatedSolutionList = _.map(solutionList, (solutionDetails: any) => {
    let mostRecentDate: any = null;
    const groupByLanguageAndDate = _.reduce(
      _.get(solutionDetails, 'solutions'),
      (accumulator: any, solution: any) => {
        const language = _.get(solution, 'solution_language');
        accumulator.failed = accumulator.failed || !!solution.failed;
        if (mostRecentDate < solution.created_at) {
          mostRecentDate = solution.created_at;
        }

        if (accumulator[language]) {
          if (solution.created_at > accumulator[language].created_at) {
            accumulator[language] = solution;
          }
          return accumulator;
        }
        accumulator[language] = solution;

        return accumulator;
      },
      { failed: false }
    );

    return {
      ..._.omit(solutionDetails, 'solutions'),
      solutions: groupByLanguageAndDate,
      last_solved_at: mostRecentDate
    };
  });

  return updatedSolutionList;
}
