const { TASK_FIELD_CONFIG } = require('../src/components/taskFieldConfig');

test('task_type field options should match documentation', () => {
  const expected = ['Personal', 'Work', 'Learning', 'Other'];
  expect(TASK_FIELD_CONFIG.task_type.options).toEqual(expected);
});
