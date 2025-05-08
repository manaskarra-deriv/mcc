def check_indentation(file_path):
    with open(file_path, 'r') as f:
        contents = f.read()
    try:
        compile(contents, file_path, 'exec')
        print('No syntax errors found')
    except Exception as e:
        print(f'Error: {e}')

check_indentation('api.py') 