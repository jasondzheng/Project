'''
Compiles the catalog of item JSONs into a single file for quick loading. Simply
appends each JSON file as an entry in an outer JSON object, with keys being the
original IDs of each item.
'''
import json

# Path to the catalog with all active item ids
CATALOG_PATH = 'assets/items/itemCatalog.json'
# Path to all item JSON files
ITEM_PATH = 'assets/items/%s.json'
# Path to write compiled catalog to
COMPILED_PATH = 'assets/items/itemCatalogCompiled.json'


def main():
	ids = getItemIdsFromJson(CATALOG_PATH)
	catalogContents = '{\n'
	for id in ids:
		with open(ITEM_PATH % (id), 'r') as fileHandle:
			fileSource = fileHandle.read()
		catalogContents += '\t"%s": %s,\n' % (id, fileSource.replace('\n', '\n\t'))
	if (len(ids) > 0):
		catalogContents = catalogContents[:-2] + '\n}'
	with open(COMPILED_PATH, 'w') as f:
		f.write(catalogContents)
	print('Done generating catalog.')


def getItemIdsFromJson(filepath):
	with open(filepath, 'r') as fileHandle:
		fileSource = fileHandle.read()
	return json.loads(fileSource)['items']


if __name__ == '__main__':
  main()