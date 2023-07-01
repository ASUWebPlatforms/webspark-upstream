# ASU User module for Drupal 9

## Description 

The ASU User module provides ASU customizations on the users.

## Configuration

The elastic query for the user can be set in this form:
/admin/config/people/asu_user

## Functionalities

We have a private function (was copied from asu_userpicker module) 
_asu_user_get_elastic_profile_record() that returns the the record of the asurite 
user given the asurite_id. 

If a user with the 'Employee' affiliate logs in with CAS SSO, it will get the 
employee role in drupal.

## Requirements

Drupal 8.x. or Drupal 9.x