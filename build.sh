
set -e

echo "__Running Tests__"
./test.sh
echo

echo "__Building__"
destinationFile_BE="pkg/background.js"
destinationFile_FE="pkg/popup/index.js"

#
## front_end
#

rm "$destinationFile_FE"
touch "$destinationFile_FE"

# urlDataObj
# grab all the code between BEGIN_IMPORT_HERE & END_IMPORT_HERE from src/urlDataObj and dump to pkg/background.js
sed -n '/BEGIN_IMPORT_HERE/,/END_IMPORT_HERE/p' src/urlDataObj.js | sed '1d;$d' >> "$destinationFile_FE"

# utils
# grab all the code between BEGIN_IMPORT_HERE & END_IMPORT_HERE from src/urlDataObj and dump to pkg/background.js
sed -n '/ADD_TO_FRONT_END_START/,/ADD_TO_FRONT_END_END/p' src/utils.js | sed '1d;$d' >> "$destinationFile_FE"

# chrome_api
# grab all the code between BEGIN_IMPORT_HERE & END_IMPORT_HERE from src/urlDataObj and dump to pkg/background.js
sed -n '/ADD_TO_FRONT_END_START/,/ADD_TO_FRONT_END_END/p' src/chrome_api.js | sed '1d;$d' >> "$destinationFile_FE"

# front_end
# grab all the code between BEGIN_IMPORT_HERE & END_IMPORT_HERE from src/urlDataObj and dump to pkg/background.js
sed -n '/BEGIN_IMPORT_HERE/,/END_IMPORT_HERE/p' src/front_end.js | sed '1d;$d' >> "$destinationFile_FE"

# removes "END_IMPORT_HERE"  from build frontend index.js file
sed -i '/END_IMPORT_HERE/,+1d' pkg/popup/index.js

echo "build Complete at ($destinationFile_FE)"

#
## back_end
#

rm "$destinationFile_BE"
touch "$destinationFile_BE"

# urlDataObj
# grab all the code between BEGIN_IMPORT_HERE & END_IMPORT_HERE from src/urlDataObj and dump to pkg/background.js
sed -n '/BEGIN_IMPORT_HERE/,/END_IMPORT_HERE/p' src/urlDataObj.js | sed '1d;$d' >> "$destinationFile_BE"

# utils
# grab all the code between BEGIN_IMPORT_HERE & END_IMPORT_HERE from src/utils and dump to pkg/background.js
sed -n '/BEGIN_IMPORT_HERE/,/END_IMPORT_HERE/p' src/utils.js | sed '1d;$d' >> "$destinationFile_BE"

# chrome_api
cat "src/chrome_api.js" >>  "$destinationFile_BE"

# build the front end first so this can run after the ft-end is done
# removes "ADD_TO_FRONT_END_START" and "ADD_TO_FRONT_END_END" from build backend file
sed -i '/ADD_TO_FRONT_END_START/,+1d' pkg/background.js
sed -i '/ADD_TO_FRONT_END_END/,+1d' pkg/background.js

echo "build Complete at ($destinationFile_BE)"
