#!/bin/bash

# Script Name: executeAllExamples.sh
#
# Author: Ángel Heredia (Anthares101) and Víctor Nieves (VictorNS69)
# Date : 09/03/2022
#
# Description:	The following script executes all the examples to check
#               if they work properly
#
# Run Information: To execute this script use ./dev-tools/executeAllExamples.sh in the
#                  project index
#
# Errors and Issues: If you find any bug, error or issue, create a new Issue in the GitHub
#		     page: https://github.com/alastria/alastria-identity-example/issues

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
            if [ $example != "3.deleteIdentityServiceProvider.js" ] && [ $example != "3.deleteIdentityIssuer.js" ]; then
                node $example >/dev/null ; print_result_msg $? ${exampleDirectory}/${example}
            fi
        done
        cd ..
    fi
done

# when all examples have been successfully passed, we start role revocations.
# Order: 1) SP 2) Issuer 3) First entity

cd exampleServiceProvider
node 3.deleteIdentityServiceProvider.js >/dev/null ; print_result_msg $? "exampleServiceProvider/3.deleteIdentityServiceProvider.js"
node 4.isIdentityServiceProvider.js >/dev/null ; print_result_msg $? "exampleServiceProvider/4.isIdentityServiceProvider.js"
cd ..

cd exampleIssuer
node 3.deleteIdentityIssuer.js >/dev/null ; print_result_msg $? "exampleIssuer/3.deleteIdentityIssuer.js"
node 4.isIdentityIssuer.js >/dev/null ; print_result_msg $? "exampleIssuer/4.isIdentityIssuer.js"
cd ..

cd exampleFirstEntity
node 5.deleteIdentityIssuer.js >/dev/null ; print_result_msg $? "exampleFirstEntity/5.deleteIdentityIssuer.js"
node 6.deleteIdentityServiceProvider.js >/dev/null ; print_result_msg $? "exampleFirstEntity/6.deleteIdentityServiceProvider.js"
node 7.isIdentiyIssuer.js >/dev/null ; print_result_msg $? "exampleFirstEntity/7.isIdentiyIssuer.js"
node 8.isIdentityServiceProvider.js >/dev/null ; print_result_msg $? "exampleFirstEntity/8.isIdentityServiceProvider.js"
cd ..

end_indicator

echo "Script ended"
exit $STATUS
