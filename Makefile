build:
	npm run build

watch:
	npm run watch

lint:
	npm run lint

schema:
	npm run schema

install:
	npm install

update:
	npm update

run:
	npm run nodemon

clean:
	rm -r ./node_modules ./public

.PHONY: build watch lint schema install update run clean
