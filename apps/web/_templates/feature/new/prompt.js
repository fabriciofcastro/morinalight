module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'Qual o nome do componente / feature?',
  },
  {
    type: 'confirm',
    name: 'withStory',
    message: 'Deseja criar Storybook?',
    default: true,
  },
  {
    type: 'confirm',
    name: 'withTest',
    message: 'Deseja criar teste unitário?',
    default: true,
  },
  {
    type: 'confirm',
    name: 'withTypes',
    message: 'Deseja criar tipos TypeScript?',
    default: true,
  }
];
