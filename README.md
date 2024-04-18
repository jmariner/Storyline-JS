# Modue List

## `ecpi-interactives-lti`

All LTI-related functionality, including:

* Getting LTI data from course (student name, role in course, a lot more)
* Submitting score/text back to LMS
* Getting Live Data (only Excel files so far) to be used by other modules
* [PLANNED] Read/write custom data

## `rand-terms`

* Read a Live Data Excel file containing terms/definitions
* Randomly choose a certain number of terms
* Store them into variables Term1, Term2, etc and Def1, Def2, etc.

## `rand-terms-cats`

* Read a Live Data Excel file containing a categorised list of terms/definitions
* Randomly choose a certain number of categories and a certain number of terms per category (keeping original order of terms)
* Store everything into a JavaScript variable to be used as needed by a simple Storyline JavaScript trigger.

# Other Files

[`core.js`](./core.js): Contains base code used by all modules.

[`loader.js`](./loader.js): Contains script that loads requested list of modules.

[`loader.storyline.js`](./loader.storyline.js): Contains Storyline script to be added in a trigger which loads `loader`.

# jsDelivr URLs

Provided to more easily [purge jsDelivr's cache](https://www.jsdelivr.com/tools/purge).

```
https://cdn.jsdelivr.net/gh/jmariner/Storyline-JS@main/loader.js
https://cdn.jsdelivr.net/gh/jmariner/Storyline-JS@main/core.js
https://cdn.jsdelivr.net/gh/jmariner/Storyline-JS@main/ecpi-interactives-lti.js
https://cdn.jsdelivr.net/gh/jmariner/Storyline-JS@main/rand-terms.js
https://cdn.jsdelivr.net/gh/jmariner/Storyline-JS@main/rand-terms-cats.js
```
