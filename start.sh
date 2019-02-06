#!/bin/bash

eslint .
if [[ $? == 0 || $force == "true" ]]; then 
	node index.js
else
	echo -e "\033[31;1meslint linting failed! Bot will not start. (Prefix force=true to bypass.)\033[0m"
fi	
