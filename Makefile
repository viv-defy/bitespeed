build:
	mkdir -p dest
	tsc

run:
	node dest/index.js