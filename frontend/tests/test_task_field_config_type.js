const { TASK_FIELD_CONFIG } = require('../src/components/taskFieldConfig');

test('type field options should match documentation', () => {
  const expected = ['Feature', 'Bug', 'Improvement', 'Task'];
  expect(TASK_FIELD_CONFIG.type.options).toEqual(expected);
});
