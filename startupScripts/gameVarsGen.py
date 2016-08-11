import json
import os
import re

NPC_PATH = 'assets/npcs/'

MAP_PATH = 'assets/maps/'

GLOBAL_GAME_VARS_PATH = 'assets/state/gameVars.json'

OUTPUT_PATH = 'assets/state/gameVars_compiled.json'

declarationObjs = []
gameStateVars = {}


def main():
	with open(GLOBAL_GAME_VARS_PATH, 'r') as fileHandle:
		fileSource = fileHandle.read()
	declarationObjs.append(json.loads(fileSource))
	processPath(NPC_PATH, extractVarsFromNpc)
	processPath(MAP_PATH, extractVarsFromMap)
	for obj in declarationObjs:
		gameStateVars.update(obj)
	with open(OUTPUT_PATH, 'w') as f:
		f.write(json.dumps(gameStateVars))
	print('Done generating game vars.')
	

JSON_REGEX = r"[\n\r\t]+"


# Processes a path and recursively processes any nested files, applying the
# callback function to those files. Only processes JSON files.
def processPath(path, callback):
	for (dirpath, dirs, files) in os.walk(path):
		for file in files:
			if not file.endswith('.json'):
				continue
			fullPath = os.path.join(dirpath, file)
			with open(fullPath, 'r') as fileHandle:
				fileSource = fileHandle.read()
			callback(json.loads(re.sub(JSON_REGEX, '', fileSource)))


# Extracts game var declarations from map JSONS
def extractVarsFromMap(data):
	for event in data['events']:
		if ('gameVars' in event):
			declarationObjs.append(event['gameVars'])


def extractVarsFromNpc(data):
	if 'gameVars' in data:
		declarationObjs.append(data['gameVars'])


if __name__ == '__main__':
  main()