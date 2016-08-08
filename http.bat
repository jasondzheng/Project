python .\clientgen.py
python .\startupScripts\itemCatalogGen.py
python .\startupScripts\gameVarsGen.py
call "C:\Program Files\nodejs\nodevars.bat"
http-server
PAUSE