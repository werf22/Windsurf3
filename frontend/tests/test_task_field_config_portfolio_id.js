const { TASK_FIELD_CONFIG } = require('../src/components/taskFieldConfig');

test('portfolio_id field options should match documentation', () => {
  const expected = [
    'GLOBAL (Global)',
    'Osobný Život & Rozvoj (Osobné & Rozvoj)',
    'Pracovný Život & Administratíva (Práca & Admin)',
    'Koučing & Terapia (Koučing & Terapia)',
    'Kurzy & Workshopy (Kurzy & Workshopy)',
    'DJing (DJing)',
    'Umenie (Umenie)',
    'AI & Technológie (AI & Tech)',
    'Projekty & Produkty (Nápady)',
    'Social Media & Marketing (Marketing)',
    'Cestovanie & Logistika (Cestovanie)',
    'Znalostná Báza & Výskum (Arzenál)',
    'Crypto (Crypto)',
    'Organizovanie Eventov (Eventy)'
  ];
  expect(TASK_FIELD_CONFIG.portfolio_id.options).toEqual(expected);
});
