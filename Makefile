
default: build

build:
	node_modules/.bin/babel --no-comments --minified src -d app
	node_modules/.bin/riot views app/tags.js
	node_modules/.bin/babel --no-comments --minified app/tags.js -o app/tags.js

watch:
	node_modules/.bin/babel --no-comments -w src -d app

watch-riot:
	node_modules/.bin/riot -w views app/tags.js

test:
	@node_modules/.bin/jasmine JASMINE_CONFIG_PATH=spec/support/jasmine.json ${file}

debug:
	open /Applications/Google\ Chrome\ Canary.app --args --allow-file-access-from-files

.PHONY: default test debug build watch watch-riot
