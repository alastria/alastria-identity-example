#!/bin/bash

# Script Name: createMockIdentities.sh
#
# Author: Víctor Nieves Sánchez (VictorNS69)
# Date : 17/01/2020
#
# Description:	The following script executes all the examples needed to create the mock
#		identities and entities. You can find more information about the mock identities
#		at: https://github.com/alastria/alastria-identity-example/blob/develop/keystores/README.md
#
# Run Information: You can execute this script by running ./createMockIdentities.sh while
#		   in dev-tools directory
#
# Errors and Issues: If you find any bug, error or issue, create a new Issue in the GitHub
#		     page: https://github.com/alastria/alastria-identity-example/issues

# Some colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Some functions to print messages
function print_msg_identity() {
	# Expected 1)exit status 2)name of the identity/entity 3)file name
	if [ $1 -ne 0 ];then
		printf "${RED}\nCuld not create the $2 identity. ${NC} \n\tFile --> $3\n"
	else
		printf "${GREEN}\nIdentity $2 successfully created. ${NC} \n\tFile --> $3\n"
	fi
}

function print_msg_new_entity() {
	# Expected 1)exit status 2)name of the entity 3)file name
	if [ $1 -ne 0 ];then
		printf "${RED}\nCuld not create the $2 as a entity. ${NC} \n\tFile --> $3\n"
	else
		printf "${GREEN}\nEntity $2 successfully created. ${NC} \n\tFile --> $3\n"
	fi
}


function print_msg_role() {
	# Expected 1)exit status 2)role name 3)name of the identity/entity 4)file name
	if [ $1 -ne 0 ];then
		printf "${RED}\nCuld not asign the role $2 to the entity $3. ${NC} \n\tFile --> $4\n"
	else
		printf "${GREEN}\n$2 role asigned to entity $3. ${NC} \n\tFile --> $4\n"
	fi
}

echo "Starting script"

# Indicator that the script is running
while true; do echo -n .; sleep 1; done &
child_pid=$!

# Create the first entity (Service Provider + Issuer)
cd ../exampleFirstEntity/ 
node 1.createEntityAlastriaID.js >/dev/null 2>&1 ; print_msg_identity $? "entity1" "exampleFirstEntity/1.createEntityAlastriaID.js"
node 2.addEntity.js >/dev/null 2>&1 ; print_msg_new_entity $? "entity1" "exampleFirstEntity/2.addEntity.js"
node 3.addIdentityIssuer.js >/dev/null 2>&1 ; print_msg_role $? "Issuer" "entity1" "exampleFirstEntity/2.addIdentityIssuer.js"
node 4.addIdentityServiceProvider.js >/dev/null 2>&1 ; print_msg_role $? "Service Provider" "entity1" "exampleFirstEntity/3.addIdentityServiceProvider.js"

# Create the rest of AlastriaID's
cd ../exampleCreateAlastriaID/ ; 
node 1.createEntity2AlastriaID.js >/dev/null 2>&1 ; print_msg_identity $? "entity2" "exampleCreateAlastriaID/1.createEntity2AlastriaID.js"
node 2.createEntity3AlastriaID.js >/dev/null 2>&1 ; print_msg_identity $? "entity3" "exampleCreateAlastriaID/2.createEntity3AlastriaID.js"
node 3.createSubject1AlastriaID.js >/dev/null 2>&1 ; print_msg_identity $? "subject1" "exampleCreateAlastriaID/3.createSubject1AlastriaID.js"
node 4.createSubject2AlastriaID.js >/dev/null 2>&1 ; print_msg_identity $? "subject2" "exampleCreateAlastriaID/4.createSubject2AlastriaID.js"

# Set entity3 as Issuer
cd ../exampleIssuer/
node 1.addEntity.js >/dev/null 2>&1 ; print_msg_new_entity $? "entity3" "exampleIssuer/1.addEntity.js"
node 2.addIdentityIssuer.js >/dev/null 2>&1 ; print_msg_role $? "Issuer" "entity3" "exampleIssuer/2.addIdentityIssuer.js"

# Set entity2 as Service Provider
cd ../exampleServiceProvider/
node 1.addEntity.js >/dev/null 2>&1 ; print_msg_new_entity $? "entity2" "exampleServiceProvider/1.addEntity.js"
node 2.addIdentityServiceProvider.js >/dev/null 2>&1 ; print_msg_role $? "Service Provider" "entity2" "exampleServiceProvider/2.addIdentityServiceProvider.js"

# Kill the indicator
kill $child_pid ; wait $child_pid 2>/dev/null

echo "Script ended"
exit 0
