#!/bin/bash

function runBot {
	node index.js
	if [[ $? != 0 ]]; then
		echo -e "\033[31;1mThe bot has failed. Please fix the issue and restart it.\033[0m"
		exit 1
	fi
}

function printStatus {
	[[ $1 == 0 ]] && echo -e "\033[32;1msuccess\033[0m" || echo -e "\033[31;1mfail\033[0m"
}

function printRunning {
	echo -e "\033[32;1mRunning $1...\033[0m"
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
printRunning "ESLint"
eslint .
eslintOutput=$?
printStatus $eslintOutput
printRunning "Prettier"
prettier --check "*.js"
prettierOutput=$?
printStatus $prettierOutput

doRun=$(($eslintOutput + $prettierOutput))
if [[ $force == true ]]; then
	runBot
elif [[ $doRun == 0 ]]; then
	runBot
else
	echo -e "\033[31;1mAll checks failed, refusing to run bot. (Prefix force=true to force a run.)\033[0m"
	exit 1
fi
