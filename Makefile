build:
	npm run build

lint:
	npm run lint

schema:
	npm run build:schema

install:
	npm install

update:
	npm update

run:
	npm run nodemon

frontend:
	npm run dev

clean:
	rm -r ./node_modules ./public

.PHONY: build lint schema install update run frontend clean
