# Webspark isearch module

## Description

Isearch module give us the functionalities to be able to create the isearch
component. This component retrieves persons from the asurite universe through
web services.

## Third party helpers

This module was developed with the help of the jstree  https://www.jstree.com/


## Functionalities

We have two FieldWidgets for the textfield type:
- Directory Widget: retrieves the directories from the asurite
- AsuriteID Widget: retreives the persons from a certain directory

## Configuration

It has a configuration form at the /admin/config/isearch/settings route.

## Aditional info

Currently the visual part of the component is implemented in REACT.

## Known limitations

- The field currently cannot have more than 255 characters.
- You cannot have more than one field of each type (department id and asurite id)
on the same page.

## Requirements

Drupal 8.x. or Drupal 9.x

## How to use

Add a component of isearch type in the layout builder.

You can also use the same widgets on other components by adding them in the
form display of the entity.
