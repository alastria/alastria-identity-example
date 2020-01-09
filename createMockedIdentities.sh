#!/bin/bash

# Some colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

function print_msg_identity() {
	if [ $1 -ne 0 ];then
		printf "${RED} No se ha podido crear la identidad  ${NC}\n "
	else
		printf "${GREEN}Se ha creado la identidad${NC}\n"
	fi
}

function print_msg_role() {
	if [ $1 -ne 0 ];then
		printf "${RED}No se ha podido asignar el rol de $2 ${NC}\n "
	else
		printf "${GREEN}Se ha asignado el rol de $2 ${NC}\n"
	fi
}

cd exampleFirstEntity/
node 1.createEntityAlastriaID.js 1>/dev/null 2>&1
print_msg_identity $?
node 2.addIdentityIssuer.js 1>/dev/null 2>&1
print_msg_role $? "Issuer"
node 3.addIdentityServiceProvider.js 1>/dev/null 2>&1
print_msg_role $? "Service Provider"


#cd exampleIssuer

#node 1.addIdentityIssuer.js 1>/dev/null 2>&1
#if [ $? -ne 0 ];then
#	printf "${GREEN}Se ha creado${NC}\n "
#else
#	printf "${RED}No se ha creado${NC}\n"
#fi

