build:
	npm install
	mkdir -p dest
	npm install -g typescript
	tsc
	npm install -g sequelize-cli
	sequelize-cli db:migrate

run:
	node dest/index.js

clean:
	rm database.sqlite