#!/bin/bash

# Some colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color


# Some functions to print messages
function print_msg_identity() {
	echo "status $1" # TODO: remove
	if [ $1 -ne 0 ];then
		printf "${RED} No se ha podido crear la identidad  ${NC}\n "
	else
		printf "${GREEN}Se ha creado la identidad${NC}\n"
	fi
}

function print_msg_role() {
	echo "status $1 value $2" # TODO: remove
	if [ $1 -ne 0 ];then
		printf "${RED}No se ha podido asignar el rol de $2 ${NC}\n "
	else
		printf "${GREEN}Se ha asignado el rol de $2 ${NC}\n"
	fi
}

echo "Starting ..."
# Create the first entity (Service Provider + Issuer)
cd exampleFirstEntity/
node 1.createEntityAlastriaID.js >/dev/null 2>&1 ; print_msg_identity $?
node 2.addIdentityIssuer.js >/dev/null 2>&1 ; print_msg_role $? "Issuer"
node 3.addIdentityServiceProvider.js >/dev/null 2>&1 ; print_msg_role $? "Service Provider"

# Create the rest of AlastriaID's
cd ../exampleCreateAlastriaID/
node 1.createEntity2AlastriaID.js >/dev/null 2>&1 ; print_msg_identity $?
node 2.createEntity3AlastriaID.js >/dev/null 2>&1 ; print_msg_identity $?
node 3.createSubject1AlastriaID.js >/dev/null 2>&1 ; print_msg_identity $?
node 4.createSubject2AlastriaID.js >/dev/null 2>&1 ; print_msg_identity $?

cd ../exampleIssuer/
node 1.addIdentityIssuer.js 2>&1 ; print_msg_role $? "Issuer"

cd ../exampleServiceProvider/
node 1.addIdentityServiceProvider.js >/dev/null 2>&1 ; print_msg_role $? "Service Provider"

echo "Ending ..."
