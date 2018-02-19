# Usage

This could be an npm package in the future.

The process is to take a .ejs file + an object, output an html and then render it to pdf with phantomjs.

1. `ejs2pdf.js` takes a template in input and writes an html file
2. the html file is taken by `execute-phantom.js` that spawns
3. a child process `phantomjs pdf-phantom-renderer.js input_file output_file` to generate a pdf
