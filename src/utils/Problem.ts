import _ from 'lodash';

const t = [
  {
    solution: {
      _id: '6306d2942d17190266903c8b',
      user_id: '6306b34920cf5f80f7d0c20d',
      problem_id: 1,
      solution_language: 'C++',
      solution_code:
        'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        map<int,int> list;\n        vector<int> ans;\n        for(int i=0;i<nums.size();i++){\n            if(list.find(target-nums[i])!=list.end()){\n                ans.push_back(i);\n                ans.push_back(list[target-nums[i]]);\n                return ans;\n            }\n            list[nums[i]]=i;\n        }\n        \n        return {};\n    }\n};',
      runtime_ms: 14,
      memory_usage_mb: 11,
      created_at: '2022-08-25T01:38:28.429Z',
      __v: 0
    },
    problem: {
      _id: '6306cfc384eb7e22c4b0b834',
      id: 1,
      __v: 0,
      description:
        '<div><p>Given an array of integers <code>nums</code>&nbsp;and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>\n\n<p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>\n\n<p>You can return the answer in any order.</p>\n\n<p>&nbsp;</p>\n<p><strong>Example 1:</strong></p>\n\n<pre><strong>Input:</strong> nums = [2,7,11,15], target = 9\n<strong>Output:</strong> [0,1]\n<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].\n</pre>\n\n<p><strong>Example 2:</strong></p>\n\n<pre><strong>Input:</strong> nums = [3,2,4], target = 6\n<strong>Output:</strong> [1,2]\n</pre>\n\n<p><strong>Example 3:</strong></p>\n\n<pre><strong>Input:</strong> nums = [3,3], target = 6\n<strong>Output:</strong> [0,1]\n</pre>\n\n<p>&nbsp;</p>\n<p><strong>Constraints:</strong></p>\n\n<ul>\n\t<li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>\n\t<li><strong>Only one valid answer exists.</strong></li>\n</ul>\n\n<p>&nbsp;</p>\n<strong>Follow-up:&nbsp;</strong>Can you come up with an algorithm that is less than&nbsp;<code>O(n<sup>2</sup>)&nbsp;</code>time complexity?</div>',
      difficulty: 'Easy',
      solved_by: [
        '6306b34920cf5f80f7d0c20d',
        '63081fe50cc2604b938631e1',
        '63082a264fca1f39ace2655e',
        '6306b32a20cf5f80f7d0c207',
        '630e1fdb9deb9a13712d7205'
      ],
      tags: ['Array', 'Hash Table'],
      title: 'Two Sum',
      url: 'https://leetcode.com/problems/two-sum/'
    }
  },
  {
    solution: {
      _id: '6306d65a2d17190266903ca3',
      user_id: '6306b34920cf5f80f7d0c20d',
      problem_id: 1,
      solution_language: 'JavaScript',
      solution_code:
        '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    const seen = new Map(); //maps element to index\n    let ans;\n    nums.forEach((val,idx)=>{\n        let diff= target-val\n        if(seen.has(diff)){\n            ans= [seen.get(diff),idx];\n            return;\n        }\n        seen.set(val,idx)\n    })\n    return ans;\n};',
      runtime_ms: 143,
      memory_usage_mb: 44.8,
      created_at: '2022-08-25T01:54:34.953Z',
      __v: 0
    },
    problem: {
      _id: '6306cfc384eb7e22c4b0b834',
      id: 1,
      __v: 0,
      description:
        '<div><p>Given an array of integers <code>nums</code>&nbsp;and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>\n\n<p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>\n\n<p>You can return the answer in any order.</p>\n\n<p>&nbsp;</p>\n<p><strong>Example 1:</strong></p>\n\n<pre><strong>Input:</strong> nums = [2,7,11,15], target = 9\n<strong>Output:</strong> [0,1]\n<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].\n</pre>\n\n<p><strong>Example 2:</strong></p>\n\n<pre><strong>Input:</strong> nums = [3,2,4], target = 6\n<strong>Output:</strong> [1,2]\n</pre>\n\n<p><strong>Example 3:</strong></p>\n\n<pre><strong>Input:</strong> nums = [3,3], target = 6\n<strong>Output:</strong> [0,1]\n</pre>\n\n<p>&nbsp;</p>\n<p><strong>Constraints:</strong></p>\n\n<ul>\n\t<li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>\n\t<li><strong>Only one valid answer exists.</strong></li>\n</ul>\n\n<p>&nbsp;</p>\n<strong>Follow-up:&nbsp;</strong>Can you come up with an algorithm that is less than&nbsp;<code>O(n<sup>2</sup>)&nbsp;</code>time complexity?</div>',
      difficulty: 'Easy',
      solved_by: [
        '6306b34920cf5f80f7d0c20d',
        '63081fe50cc2604b938631e1',
        '63082a264fca1f39ace2655e',
        '6306b32a20cf5f80f7d0c207',
        '630e1fdb9deb9a13712d7205'
      ],
      tags: ['Array', 'Hash Table'],
      title: 'Two Sum',
      url: 'https://leetcode.com/problems/two-sum/'
    }
  },
  {
    solution: {
      _id: '6306d6462d17190266903c9d',
      user_id: '6306b34920cf5f80f7d0c20d',
      problem_id: 1,
      solution_language: 'Java',
      solution_code:
        'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        int []list={0,0};\n        for(int i=0;i<nums.length;i++){\n            for (int j=i+1;j<nums.length;j++){\n                if (nums[i]+nums[j]==target){\n                    list[0]=i;\n                    list[1]=j;\n                    break;\n                }\n            }\n        }\n        return list;\n    }\n}',
      runtime_ms: 50,
      memory_usage_mb: 42.5,
      created_at: '2022-08-25T01:54:14.787Z',
      __v: 0
    },
    problem: {
      _id: '6306cfc384eb7e22c4b0b834',
      id: 1,
      __v: 0,
      description:
        '<div><p>Given an array of integers <code>nums</code>&nbsp;and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>\n\n<p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>\n\n<p>You can return the answer in any order.</p>\n\n<p>&nbsp;</p>\n<p><strong>Example 1:</strong></p>\n\n<pre><strong>Input:</strong> nums = [2,7,11,15], target = 9\n<strong>Output:</strong> [0,1]\n<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].\n</pre>\n\n<p><strong>Example 2:</strong></p>\n\n<pre><strong>Input:</strong> nums = [3,2,4], target = 6\n<strong>Output:</strong> [1,2]\n</pre>\n\n<p><strong>Example 3:</strong></p>\n\n<pre><strong>Input:</strong> nums = [3,3], target = 6\n<strong>Output:</strong> [0,1]\n</pre>\n\n<p>&nbsp;</p>\n<p><strong>Constraints:</strong></p>\n\n<ul>\n\t<li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>\n\t<li><strong>Only one valid answer exists.</strong></li>\n</ul>\n\n<p>&nbsp;</p>\n<strong>Follow-up:&nbsp;</strong>Can you come up with an algorithm that is less than&nbsp;<code>O(n<sup>2</sup>)&nbsp;</code>time complexity?</div>',
      difficulty: 'Easy',
      solved_by: [
        '6306b34920cf5f80f7d0c20d',
        '63081fe50cc2604b938631e1',
        '63082a264fca1f39ace2655e',
        '6306b32a20cf5f80f7d0c207',
        '630e1fdb9deb9a13712d7205'
      ],
      tags: ['Array', 'Hash Table'],
      title: 'Two Sum',
      url: 'https://leetcode.com/problems/two-sum/'
    }
  }
];

/*
0: {
  problem: {}
  solutions: [
    sol1:
    sol2:
    ordered by created_at date
  ]
}
*/
function groupByProblem(solutions: any[]): any {
  const grouped = _.reduce(
    solutions,
    (accumulator: any, solution_details) => {
      const { solution } = solution_details;
      const problemId = _.get(solution_details, 'problem.id');

      if (accumulator[problemId]) {
        accumulator[problemId].solutions.push(solution);
        return accumulator;
      }

      accumulator[problemId] = {
        problem: _.get(solution_details, 'problem'),
        solutions: [solution]
      };

      return accumulator;
    },
    {}
  );

  return grouped;
}

console.log(groupByProblem(t));
