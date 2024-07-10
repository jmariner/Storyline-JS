## Random Terms w/ Categories (Jeopardy)

1. Add JavaScript trigger at beginning of project with:

```js
window.TERMS_EXCEL_DATA = 
<paste json here>
```

2. Add 2nd JavaScript trigger right after the previous, and paste the full contents of the [`rand-terms-cats.js`](./rand-terms-cats.js) file into it.

3. Set variables:

Var Name | Type | Usage
-|-|-
`RandTermsCats_Count` | number | Number of categories
`RandTerms_Count` | number | Number of terms per category
`StorylineJS_Ready` | true/false | Automatically set to true when JS is ready