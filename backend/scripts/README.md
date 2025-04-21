# Data Migration Scripts

This directory contains scripts for migrating and validating task data for the Cerulík AI Task Manager.

## parse_csv_to_db.py
- Parses TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv.
- Maps columns to DB fields, validates required fields, and prepares lookup mapping.
- Exports parsed data as tasks_parsed.json.

### Usage
bash
python3 parse_csv_to_db.py


### API Import (Backend)

To import tasks directly into your backend via API (dry run by default):

bash
python3 parse_csv_to_db.py --api http://localhost:8000/api/tasks


To actually POST to the API (not just dry run):

bash
python3 parse_csv_to_db.py --api http://localhost:8000/api/tasks --no-dry-run


### Export Options

- --json : Export parsed tasks as JSON (tasks_parsed.json)
- --sql  : Export parsed tasks as SQL insert statements (tasks_parsed.sql)
- --csv  : Specify a custom input CSV path

You can combine options as needed:

bash
python3 parse_csv_to_db.py --json --sql --csv path/to/your.csv


### Lookup Table Support

You can provide a lookup table JSON file to map Portfolio, Project, Section, or Priority names to DB IDs. Example lookups.json:

json
{
  "portfolio": {"Personal": 1, "Work": 2},
  "project": {"AI Project": 10},
  "section": {"Urgent": 7},
  "priority": {"High": 1, "Low": 2}
}


Use this with:
bash
python3 parse_csv_to_db.py --json --lookups lookups.json


Unknown values will be warned in the output. See script for further customization.

### Troubleshooting
- Ensure your input CSV uses ; as delimiter and matches header fields.
- If you see warnings about missing required fields or unknown lookup values, update your CSV or lookup JSON accordingly.
- For API import, ensure your backend is running and the endpoint is correct.

### Where to Continue
- If you have a real CSV and lookup JSON, run the script with those files and import to backend.
- If new fields or mappings are needed, update the script and lookup JSON as required.
- See TASK.md for next priorities.
