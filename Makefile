build:
	npm run build

lint:
	npm run lint

schema:
	npm run build:schema

install:
	yarn install

update:
	yarn update

run:
	npm run nodemon

frontend:
	npm run dev

deploy:
	npm run deploy

clean:
	rm -r ./node_modules ./public

.PHONY: build lint schema install update run frontend deploy clean
