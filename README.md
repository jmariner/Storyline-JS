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

`core`: Contains base code used by all modules.

`loader`: Contains script to be added to JavaScript trigger which loads requested list of modules.