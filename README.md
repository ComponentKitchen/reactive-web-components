# Building Web Components using Functional Reactive Programming Techniques
This project is inspired by [a React tutorial](https://facebook.github.io/react/docs/tutorial.html) that demonstrates
how to use React to create a comment box. The tutorial guides you in building a small number of React components,
including components that host other React components. Being purely React components, they can be used only
within the context of a React application. Web components, on the other hand, may be used within any web application,
regardless of the frameworks used.

What this project demonstrates is that the same general component architecture can be used as the React tutorial
in building universally shareable web components while still using functional reactive programming techniques
individually within the construction of each web component. Rather than employing React, we use instead 
the [virtual-dom](https://github.com/Matt-Esch/virtual-dom) and [Redux](https://github.com/reactjs/redux) modules.

## Getting Started

* Clone this project
* npm install
* grunt devbuild
* Launch index.html under a local web server of your choice

## Grunt Commands

* **grunt build**: Builds dist/es5scripts.js with uglify compression
* **grunt devbuild** Builds dist/es5scripts.js without uglify compression
* **grunt watch** Runs a devbuild upon any changes to src/scripts

