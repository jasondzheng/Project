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
COMPILED_PATH = 'assets/items/itemCatalog_compiled.json'
# Path to write compiled item drop animations to
DROP_ANIM_PATH = 'assets/items/itemDropAnimations_compiled.json'
# Number of wayframes in the item drop animation
DROP_ANIM_WAYFRAMES = 9
# Height of drop animation
DROP_ANIM_HEIGHT = 16
# Duration of a drop animation frame
DROP_ANIM_FRAME_DUR = 4
# Height of a drop item image
DROP_ITEM_HEIGHT = 64


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
	animationEntityJson = generateAnimations(ids)
	with open(DROP_ANIM_PATH, 'w') as f:
		f.write(json.dumps(animationEntityJson, sort_keys=True, indent=2, 
				separators=(',', ': ')))
	print('Done generating item drop animations.')


# Gets the item IDs from the item catalog JSON.
def getItemIdsFromJson(filepath):
	with open(filepath, 'r') as fileHandle:
		fileSource = fileHandle.read()
	return json.loads(fileSource)['items']


# Generates the entity JSON required for animation of drop items.
def generateAnimations(itemIds):
	entity = {}
	entity['frames'] = {}
	entity['animations'] = {}
	entity['collisionWidth'] = 0
	entity['collisionHeight'] = 0
	entity['isRounded'] = False
	entity['defaultUiTop'] = 0
	for itemId in itemIds:
		for i in range(DROP_ANIM_WAYFRAMES):
			entity['frames'][itemId + '_' + str(i)] = {
				'sprite': '../' + itemId,
				'edge': {
					'x': 0,
					'y': (DROP_ITEM_HEIGHT + 
							i * (DROP_ANIM_HEIGHT / (DROP_ANIM_WAYFRAMES - 1)))
				}
			}
		entity['animations'][itemId] = {
			'isLooped': True,
			'frameRefs': []
		}
		for i in range((DROP_ANIM_WAYFRAMES - 1) * 2):
			index = (i if i < DROP_ANIM_WAYFRAMES 
					else (DROP_ANIM_WAYFRAMES - 1) * 2 - i)
			entity['animations'][itemId]['frameRefs'].append({
				'frame': itemId + '_' + str(index),
				'duration': DROP_ANIM_FRAME_DUR
			})
	return entity


if __name__ == '__main__':
  main()