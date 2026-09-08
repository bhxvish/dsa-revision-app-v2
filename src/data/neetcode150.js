// Seed data for the NeetCode 150 list, in NeetCode's standard order.
//
// This file currently holds only a handful of example rows so the setup
// screen has something real to render and test against. Paste in the
// remaining problems (in order) rather than asking Claude to fill them in
// from memory — NeetCode's exact list, categories, and URLs shift over time
// and are easy to get subtly wrong from recall.
//
// Shape of each entry:
//   order    — 1-150, NeetCode's standard list position. Used as the default
//              sort tiebreaker and for "select everything up to here" on the
//              setup screen.
//   title    — exact problem title, used to match against existing problems
//              when re-running setup (see problemsRepository.applySeedSelections).
//   url      — LeetCode problem URL.
//   category — NeetCode's grouping (e.g. "Arrays & Hashing", "Trees"). Stored
//              on the problem as neetcodeCategory.
//   pattern  — a sensible default pattern tag. Stored as the problem's initial
//              patterns[0]; fully editable afterward like any other pattern.

export const NEETCODE_150 = [
  {
    order: 1,
    title: 'Two Sum',
    url: 'https://leetcode.com/problems/two-sum/',
    category: 'Arrays & Hashing',
    pattern: 'Hash Map Lookup',
  },
  {
    order: 2,
    title: 'Contains Duplicate',
    url: 'https://leetcode.com/problems/contains-duplicate/',
    category: 'Arrays & Hashing',
    pattern: 'Hash Set Dedup',
  },
  {
    order: 3,
    title: 'Valid Anagram',
    url: 'https://leetcode.com/problems/valid-anagram/',
    category: 'Arrays & Hashing',
    pattern: 'Frequency Count',
  },
  {
    order: 4,
    title: 'Group Anagrams',
    url: 'https://leetcode.com/problems/group-anagrams/',
    category: 'Arrays & Hashing',
    pattern: 'Hash Map Grouping',
  },
  {
    order: 5,
    title: 'Top K Frequent Elements',
    url: 'https://leetcode.com/problems/top-k-frequent-elements/',
    category: 'Arrays & Hashing',
    pattern: 'Bucket Sort',
  },
];
