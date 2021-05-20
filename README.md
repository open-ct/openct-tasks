# OpenCT Contest Archive

This repository contains tasks used in past [ OpenCT Contest]. They are in a particular format, and can be used in  OpenCT.

To start using:

```
git clone https://github.com/open-ct/openct-tasks
cd bebras-tasks
git submodule update --init
```

To update:

```
git pull
git submodule update --recursive
```

To update modules to the current version:

```
cd _common/modules
git checkout master
git pull
cd ../..
git add _common/modules/
git commit -m "update modules"
git push
```
