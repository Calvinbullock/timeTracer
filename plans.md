# Future plans / Road map / Clean up

## Clean up / bug fixes

- add file header comments to files missing them
- move calcTime function / tests (??)
- isTimeElapsedWithinInterval needs tests (and re-design?)
- WARN: nulls might be being added to the url list - NOTE: unconfirmed...

- MAINTENANCE -- see if there is a way to easily test extension performance impact
- MAINTENANCE -- make the different pages css consistent (margin, spacing, etc)
- MAINTENANCE -- when date key changes need to run endSesstion

- General cleanUp -- dads code review
  - Think about doing clean up and last session exit when making a new URL list obj
  - break index.js into more testable helper functions
  - move logger to its own file (_WARN:_ this broke backend.js file)
  - import \* in test file
  - have Gemini order my util func to make more sense (reorder tests to match)
    - _only_ give it the func names to ensure it does not change the code

## Release - 1.1.4

- block list - (site blocker dialog)
  - DONE - add
  - DONE - remove
  - ---- - redirect
- monthly avgs
  - will need to push the clear data to 28 days instead of 7

## Future ideas

- FEATURE -- add a total time count?
- FEATURE -- add a button to clear / reset all local data (check the chrome API)
- FEATURE -- add % of total time spent on each site (later)
- FEATURE -- allow pausing of tracking?
