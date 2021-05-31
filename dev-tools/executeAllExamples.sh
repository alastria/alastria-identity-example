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
	# Expected 1)exit status 2)name of the identity/entity 3)file name
	if [ $1 -ne 0 ];then
		printf "\nTest $2 --> ${RED}Not passed${NC}\n"
		STATUS=$ERROR_STATUS
	else
		printf "\nTest $2 --> ${GREEN}Passed${NC}\n"
	fi
}

echo "Starting script"

start_indicator

# Create the first entity (Service Provider + Issuer)
cd ../exampleFirstEntity/ 
node 1.createEntityAlastriaID.js >/dev/null 2>&1 ; print_result_msg $? "exampleFirstEntity/1.createEntityAlastriaID.js"
node 2.addEntity.js >/dev/null 2>&1 ; print_result_msg $? "exampleFirstEntity/2.addEntity.js"
node 3.addIdentityIssuer.js >/dev/null 2>&1 ; print_result_msg $? "exampleFirstEntity/2.addIdentityIssuer.js"
node 4.addIdentityServiceProvider.js >/dev/null 2>&1 ; print_result_msg $? "exampleFirstEntity/3.addIdentityServiceProvider.js"

# Create the rest of AlastriaID's
cd ../exampleCreateAlastriaID/ ; 
node 1.createEntity2AlastriaID.js >/dev/null 2>&1 ; print_result_msg $? "exampleCreateAlastriaID/1.createEntity2AlastriaID.js"
node 2.createEntity3AlastriaID.js >/dev/null 2>&1 ; print_result_msg $? "exampleCreateAlastriaID/2.createEntity3AlastriaID.js"
node 3.createSubject1AlastriaID.js >/dev/null 2>&1 ; print_result_msg $? "exampleCreateAlastriaID/3.createSubject1AlastriaID.js"
node 4.createSubject2AlastriaID.js >/dev/null 2>&1 ; print_result_msg $? "exampleCreateAlastriaID/4.createSubject2AlastriaID.js"

# Set entity3 as Issuer
cd ../exampleIssuer/
node 1.addEntity.js >/dev/null 2>&1 ; print_result_msg $? "exampleIssuer/1.addEntity.js"
node 2.addIdentityIssuer.js >/dev/null 2>&1 ; print_result_msg $? "exampleIssuer/2.addIdentityIssuer.js"

# Set entity2 as Service Provider
cd ../exampleServiceProvider/
node 1.addEntity.js >/dev/null 2>&1 ; print_result_msg $? "exampleServiceProvider/1.addEntity.js"
node 2.addIdentityServiceProvider.js >/dev/null 2>&1 ; print_result_msg $? "exampleServiceProvider/2.addIdentityServiceProvider.js"

end_indicator

echo "Script ended"
exit ${STATUS}
