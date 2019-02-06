#!/bin/bash

function runBot {
	node index.js
	if [[ $? != 0 ]]; then
		echo -e "\033[31;1mThe bot has failed. Please fix the issue and restart it.\033[0m"
		exit 1
	fi
}


#function checkOutput {
#	"$@"
#	code=$?
#	if [[ $code != 0 ]]; then
#		echo -e "\033[31;1m$1 failed, refusing to run bot. (Prefix force=true to force a run.)\033[0m"
#		exit 1
#	fi
#	return $code
#}
eslint .
eslintOutput=$?
prettier --check "*.js"
prettierOutput=$?

doRun=$(($eslintOutput + $prettierOutput))
if [[ $force == true ]]; then
	runBot
elif [[ $doRun == 0 ]]; then
	runBot
else
	echo -e "\033[31;1mAll checks failed, refusing to run bot. (Prefix force=true to force a run.)\033[0m"
	exit 1
fi
