build:
	mkdir -p dest
	tsc
	sequelize-cli db:migrate

run:
	node dest/index.js