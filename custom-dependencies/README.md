# Managing Custom Dependencies and Patches

In order to provide better separation and management of custom dependencies and patches, we've introduced two new files:

- `custom-dependencies/composer.json`: For managing custom dependencies
- `custom-dependecies/patches.custom.json`: For managing Drupal patches

## Why are we making these changes?

These changes allow for better organization and separation of concerns within the project. By isolating custom dependencies and patches in separate files, it reduces the likelihood of merge conflicts when updating the upstream and provides a clearer structure for managing project-specific dependencies and patches. By following the guidelines introduced below, you'll ensure a consistent and organized approach to managing your custom dependencies and patches within your project.

---

## Implementing the changes

### Custom Dependencies

1. Locate the `custom-dependencies/composer.json` file in the project.
2. Remove all custom dependencies out of the root `composer.json` file, and move them into `custom-dependencies/composer.json`.
3. Add, update, or remove custom dependencies from the "require" section of the `custom-dependencies/composer.json` file as needed.

### Custom Patches

1. Locate the `custom-dependencies/patches.custom.json` file in the project.
2. Remove all custom patches out of the root `composer.json` file, and move them into `custom-dependencies/patches.custom.json`.
3. Add, update, or remove patches in the `custom-dependencies/patches.custom.json` file as needed.

Example of what the patches.custom.json file contents would look like with a single patch:
```
{
  "drupal/image_widget_crop": {
    "#2865396: Provide option to apply default crop if user doesn't select any": "https://www.drupal.org/files/issues/2022-06-23/2865396-67.patch"
  }
}
```

## Managing Dependencies and Patches Moving Forward

To manage your custom dependencies and patches moving forward, follow these steps:

### Custom Dependencies

1. Make changes to the `custom-dependencies/composer.json` file as needed.
2. Run `composer update` to apply the changes to your project.

### Custom Patches

1. Make changes to the `custom-dependencies/patches.custom.json` file as needed.
2. Run `composer update` to apply the patches to your project.

---

## Custom Require Composer Command

In order to simplify the process of adding custom dependencies and to maintain the separation between the upstream and custom dependencies, we've introduced a new Composer command called `custom-require`. This command adds the specified package to the `custom-dependencies/composer.json` file and updates the dependencies in the `custom-dependencies` directory.

### Why is this needed?

The `custom-require` command ensures that users can easily add custom dependencies without directly modifying the root `composer.json` file. It reduces the chances of merge conflicts and provides a seamless experience for managing custom dependencies.

### How to use it?

To add a new dependency, run the following commands from the project root:

```sh
composer custom-require <package>
composer update
```

## Custom Remove Composer Command

Similar to the `custom-require` command to add dependencies, we have also added a `custom-remove` command to remove those dependencies.

### How to use it?

To remove a dependency from your `custom-dependencies/composer.json` file, run the following commands from the project root:

```sh
composer custom-remove <package>
composer update
```

---

## FAQS

### What if I don't want to use the `custom-require` or `custom-remove` commands?

The standard `composer require` and `composer remove` commands will still work, however we HIGHLY recommend that you try not to use them. In a future update, we may need to edit the root `composer.json` file, which puts you in danger of a nasty merge conflict.
