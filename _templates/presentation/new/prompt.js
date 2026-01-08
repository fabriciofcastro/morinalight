module.exports = [
  {
    type: 'input',
    name: 'name',
    message: "What is the component name? (e.g. MyComponent)"
  },
  {
    type: 'confirm',
    name: 'withHook',
    message: "Do you want to create a custom hook?",
    initial: true
  }
]
