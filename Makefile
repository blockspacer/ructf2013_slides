all: slides.html

env/bin/pip:
		python2 virtualenv.py env

env/bin/landslide: env/bin/pip
		env/bin/pip install landslide

env/bin/cssmin: env/bin/pip
		env/bin/pip install cssmin

env/bin/slimit: env/bin/pip
		env/bin/pip install slimit

yandex/css/screen.css: env/bin/cssmin yandex/src/css/*.css
		cat \
		yandex/src/css/reset.css \
		yandex/src/css/base.css \
		yandex/src/css/presentation.css \
		 > yandex/css/screen.css

yandex/css/print.css: env/bin/cssmin yandex/src/css/*.css
		cat yandex/src/css/presentation.css \
		 > yandex/css/print.css

yandex/js/slides.js: env/bin/slimit yandex/src/js/*.js
		cat yandex/src/js/jquery-1.2.6.pack.js yandex/src/js/library.js yandex/src/js/presentation.js | env/bin/slimit > yandex/js/slides.js

slides.html: env/bin/landslide slides.md yandex/css/screen.css yandex/css/print.css yandex/js/slides.js yandex/base.html
		rm -fr theme
		env/bin/landslide \
			--theme yandex \
			--relative \
		   	--copy-theme \
			--extensions attr_list \
			--destination slides.html \
			slides.md

deploy: slides.html
		if git branch | grep -q gh-pages; then git branch -D gh-pages; fi
		git checkout -b gh-pages
		mv slides.html index.html
		git add index.html
		git add -f theme
		git add images
		git commit -m "Rebuild"
		git push -u --force origin gh-pages
		git checkout master

