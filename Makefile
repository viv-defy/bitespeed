build:
	npm install
	mkdir -p dest
	npx tsc
	npx sequelize-cli db:migrate

run:
	node dest/index.js

clean:
	rm database.sqlite