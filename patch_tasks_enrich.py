import requests
import json
import pandas as pd

def main():
    df = pd.read_csv('csv_patch_enrich.csv').fillna('')
    tasks = requests.get('http://localhost:8000/tasks', auth=('jakub','cerulik123')).json()
    name_to_id = {t['name']: t['id'] for t in tasks}
    session = requests.Session()
    session.auth = ('jakub','cerulik123')
    for row in df.to_dict(orient='records'):
        name = row['Name']
        if name in name_to_id:
            data = {k.lower(): v for k,v in row.items() if k != 'Name'}
            # Remove multiline and excessive whitespace
            for k in data:
                data[k] = str(data[k]).replace('\n', ' ').replace('\r', ' ').strip()
            resp = session.patch(f'http://localhost:8000/tasks/{name_to_id[name]}', json=data)
            print(f'Patched {name}: {resp.status_code}')

if __name__ == '__main__':
    main()
