# Anga CLI

## Create - Auaha: (verb) (-hia,-ngia,-tia) to shape, create, form, fashion.

```
$ anga auaha angaApp
$ cd angaApp
```

## Structure

```
- Main Directory
-- angaApp
--- settings.js
```

## Add An Application - Pou: (verb) (-a) to erect, establish, fix, elevate on poles.

```
$ anga pou firstApp
```

This will add an application to the project

```
- Main Directory
-- 📂 angaApp
--- 📃 settings.js
-- 📂 firstApp
--- 📂 models
--- 📂 routes
--- 📂 templates
--- 📃 settings.js
```

## Model - Tauira:

## 1. (verb) (-tia) to pre-ordain, set aside, model.

## 2. (noun) student, pupil, apprentice, pattern, example, model, design, draft, sample, specimen, template, skilled person, cadet.

```
$ anga tauira ToDo -a name:string,description:string,isComplete:boolean
```

Creates a model

```
- Main Directory
-- 📂 angaApp
--- 📃 settings.js
-- 📂 firstApp
--- 📂 models
---- todo.js
```

## Route Huarahi: 1. (noun) road, highway, track, street, avenue.

## 2. (noun) method, procedure, process, way, route.

```
$ anga huarahi todos
```

```
- Main Directory
-- 📂 angaApp
--- 📃 settings.js
-- 📂 firstApp
--- 📂 models
--- 📂 routes
---- todos.js
```
