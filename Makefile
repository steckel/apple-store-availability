ESNEXT = find . -name '*.js' && $$(npm bin)/esnext -o .. $$(find . -name '*.js')

all:
	cd src && $(ESNEXT)
