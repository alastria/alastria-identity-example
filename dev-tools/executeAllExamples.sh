#!/bin/bash

# Some colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Exit status
STATUS=0
ERROR_STATUS=-1

# Trap ctrl-c and call ctrl_c()
trap ctrl_c INT

function ctrl_c() {
    end_indicator
    exit $ERROR_STATUS
}

# Indicator that the script is running
function start_indicator() {
    while true; do echo -n .; sleep 1; done &
    INDICATOR_PID=$!
}

# End script indicator
function end_indicator() {
    if [ -v INDICATOR_PID ];then
	    kill $INDICATOR_PID ; wait $INDICATOR_PID 2>/dev/null
	fi
}

function print_result_msg() {
	# Expected 0: normal finish
	if [ $1 -ne 0 ];then
		printf "\nTest $2 --> ${RED}Not passed${NC}\n"
		STATUS=$ERROR_STATUS
	else
		printf "\nTest $2 --> ${GREEN}Passed${NC}\n"
	fi
}

echo "Starting script"

start_indicator

# Create the first entity
cd exampleFirstEntity
node 1.createEntityAlastriaID.js >/dev/null ; print_result_msg $? "exampleFirstEntity/1.createEntityAlastriaID.js"
node 2.addEntity.js >/dev/null ; print_result_msg $? "exampleFirstEntity/2.addEntity.js"
node 3.addIdentityIssuer.js >/dev/null ; print_result_msg $? "exampleFirstEntity/3.addIdentityIssuer.js"
node 4.addIdentityServiceProvider.js >/dev/null ; print_result_msg $? "exampleFirstEntity/4.addIdentityServiceProvider.js"
cd ..

# Execute all examples but first entity ones
for exampleDirectory in example* ; do
    if [ -d $exampleDirectory ] && [ $exampleDirectory != "exampleFirstEntity" ]; then
        cd $exampleDirectory
        for example in *.js; do
            node $example >/dev/null ; print_result_msg $? ${exampleDirectory}/${example}
        done
        cd ..
    fi
done

# Execute the last first entity examples
cd exampleFirstEntity
node 5.deleteIdentityIssuer.js >/dev/null ; print_result_msg $? "exampleFirstEntity/5.deleteIdentityIssuer.js"
node 6.deleteIdentityServiceProvider.js >/dev/null ; print_result_msg $? "exampleFirstEntity/6.deleteIdentityServiceProvider.js"
node 7.isIdentiyIssuer.js >/dev/null ; print_result_msg $? "exampleFirstEntity/7.isIdentiyIssuer.js"
node 8.isIdentityServiceProvider.js >/dev/null ; print_result_msg $? "exampleFirstEntity/8.isIdentityServiceProvider.js"
cd ..

end_indicator

echo "Script ended"
exit $STATUS
