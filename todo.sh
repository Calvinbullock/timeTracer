#!/bin/bash
grep -rnw "./" -e "// TODO:" | sed 's/^[^/]*\/\//\t\/\//'
