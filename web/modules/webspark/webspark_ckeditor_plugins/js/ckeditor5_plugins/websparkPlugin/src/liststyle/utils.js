import {first} from "ckeditor5/src/utils";

/**
 * Retrieves sibling elements in a specified direction within the same list type.
 *
 * @param {Element} currentNode - The current element to start from.
 * @param {Array} elementsBelow - An array to store the retrieved sibling elements.
 * @param {string} direction - The direction to search for siblings ('forward' or 'backward').
 * @private
 */
export function _getSibling(currentNode, elementsBelow, direction) {
  const listType = currentNode ? currentNode.getAttribute("listType") : "";
  if (direction === "forward") {
    while (currentNode && currentNode.getAttribute("listType") === listType) {
      if (!elementsBelow.includes(currentNode)) {
        elementsBelow.push(currentNode);
      }
      currentNode = currentNode.nextSibling;
    }
  } else {
    while (currentNode && currentNode.getAttribute("listType") === listType) {
      if (!elementsBelow.includes(currentNode)) {
        elementsBelow.push(currentNode);
      }
      currentNode = currentNode.previousSibling;
    }
  }
}

/**
 * Initialize the UDS list class for selected blocks in the model.
 *
 * @param {Model} model - The model to operate on.
 */
export function _initUdsListClass(model) {
  // Get the currently selected block
  let currentNode = first(
    model.document.selection.getSelectedBlocks()
  );
  const elementsBelow = [];
  model.change((writer) => {
    // Find and store sibling elements both backward and forward
    _getSibling(currentNode, elementsBelow, "backward");
    _getSibling(currentNode, elementsBelow, "forward");
    // Set the 'uds-list' class for each element below the current block
    elementsBelow.forEach((element) => {
      if (element.getAttribute("listType") === 'bulleted') {
        writer.setAttribute(
          "htmlUlAttributes",
          {classes: 'uds-list'},
          element
        );
      } else if (element.getAttribute("listType") === 'numbered') {
        writer.setAttribute(
          "htmlOlAttributes",
          {classes: 'uds-list'},
          element
        );
      }
    });
  });
}


export function _setUpClassSelect(form, editor) {
  // This const will store the list options. Depending on the
  // list type(Bulleted or Numbered) it will display a set of data.
  const listOptions = editor.commands.get("bulletedListOld").value
    ? _getBulletedPropertiesOptions(editor.t)
    : editor.commands.get("numberedListOld").value
      ? _getNumberedPropertiesOptions(editor.t)
      : "";

  if (!listOptions) {
    return;
  }

  let currentNode = first(
    editor.model.document.selection.getSelectedBlocks()
  );
  const elementsBelow = [];
  let currentClasses = [];
  let listType = '';
  _getSibling(currentNode, elementsBelow, "backward");
  _getSibling(currentNode, elementsBelow, "forward");
  elementsBelow.forEach((element) => {
    if (element.getAttribute("listIndent") == 0) {
      try {
        if (element.getAttribute("listType") === 'bulleted') {
          currentClasses = element.getAttribute("htmlUlAttributes").classes
          listType = element.getAttribute('listType');
        } else if (element.getAttribute("listType") === 'numbered') {
          currentClasses = element.getAttribute("htmlOlAttributes").classes
          listType = element.getAttribute('listType');
        }
      } catch (e) {
      }
    }
  });

  if (!Array.isArray(currentClasses)) {
    currentClasses = currentClasses.split(' ');
  }

  //remove current options
  form.classSelect.children[1].element.options.length = 0;

  listOptions.forEach((optionData) => {
    const optionElement = document.createElement("option");
    optionElement.value = optionData.value;
    optionElement.text = optionData.title;

    let classList = [];
    if (listType === 'bulleted') {
      classList = _formatStyleBulletedClass(optionData.value).split(' ');
    } else {
      classList = _formatStyleNumberedClass(optionData.value).split(' ');
    }

    if (areArraysEqualIgnoringOrder(classList, currentClasses)) {
      optionElement.defaultSelected = true;
    }

    form.classSelect.children[1].element.appendChild(optionElement);
  });
}

/**
 * Checks if two arrays have the same elements, regardless of their order.
 * @param {Array} arr1 - The first array.
 * @param {Array} arr2 - The second array.
 * @returns {boolean} True if the arrays have the same elements, false otherwise.
 */
export function areArraysEqualIgnoringOrder(arr1, arr2) {
  // Check if the length of both arrays is the same
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Convert both arrays to sets for comparison
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  // Compare the sets
  for (const elemento of set1) {
    if (!set2.has(elemento)) {
      return false;
    }
  }

  return true;
}

/**
 * Generate an array of objects with specified values and titles.
 * @param {function} t - Translation function to translate titles.
 * @returns {Array} An array of objects with 'value' and 'title' properties.
 */
export function _getBulletedPropertiesOptions(t) {
  return [
    {
      value: "default-list",
      title: t("Default"),
    },
    {
      value: `maroon`,
      title: t("Maroon"),
    },
    {
      value: `light-smokemode`,
      title: t("Gray 1"),
    },
    {
      value: `smokemode`,
      title: t("Gray 2"),
    },
    {
      value: `darkmode`,
      title: t("Gray 7"),
    },
    {
      value: `darkmode-gold`,
      title: t("Gray 7 Gold Bullet"),
    },
    {
      value: `icn-default`,
      title: t("Icon list"),
    },
    {
      value: `icn-maroon`,
      title: t("Icon list Maroon"),
    },
    {
      value: `icn-darkmode`,
      title: t("Icon list Gray 7"),
    },
    {
      value: `icn-darkmode-gold`,
      title: t("Icon list Gray 7 Gold"),
    },
  ];
}

/**
 * Formats the given style class to be used as a bulleted class.
 *
 * @param {string} styleClass - The style class to be formatted.
 * @return {string} The formatted bulleted class.
 */
export function _formatStyleBulletedClass(styleClass) {
  // Get select value.
  let bulletedClass = styleClass;

  // Add class to be identified from.
  let stclass = _removeKeyClass(styleClass);
  // Add the class to be identified.
  stclass = `wp-${styleClass}`;
  // Use 'default-list' if bulletedClass is empty
  bulletedClass = bulletedClass || "default-list";

  // If value starts with icn its a icon list.
  if (bulletedClass.startsWith("icn")) {
    stclass += " uds-list fa-ul";

    switch (bulletedClass) {
      case "icn-maroon":
        stclass = _removeClassesFromString(stclass, [
          "darkmode",
          "gold",
        ]);
        stclass += " maroon";
        break;
      case "icn-darkmode":
        stclass = _removeClassesFromString(stclass, ["gold", "maroon"]);
        stclass += " darkmode";
        break;
      case "icn-darkmode-gold":
        stclass = _removeClassesFromString(stclass, ["maroon"]);
        stclass += " darkmode gold";
        break;
      // Add more cases if needed
    }
  } else {
    // Remove step list elements.
    stclass = _removeClassesFromString(stclass, ["fa-ul"]);
    // Add class after removing existing class.
    if (bulletedClass) {
      // Ensure the step list class is not applied.
      // Add remove classes as required.
      const removeList = [
        "default-list",
        "maroon",
        "light-smokemode",
        "smokemode",
        "darkmode",
      ];

      for (const removeClass of removeList) {
        if (stclass.includes(removeClass) && bulletedClass !== removeClass) {
          stclass = stclass.replace(removeClass, "");
        }
      }

      if (
        stclass.includes("darkmode") &&
        stclass.includes("gold") &&
        bulletedClass != "darkmode-gold"
      ) {
        stclass = _removeClassesFromString(stclass, [
          "darkmode",
          "gold",
        ]);
      }

      stclass +=
        bulletedClass === "darkmode-gold"
          ? " darkmode gold"
          : " " + bulletedClass;
    }
    // Apply uds-list class if element does not have it.
    if (!stclass.includes("uds-list")) {
      stclass += " uds-list";
    }
  }
  return stclass;
}

/**
 * Generate an array of objects with specified values and titles.
 * @param {function} t - Translation function to translate titles.
 * @returns {Array} An array of objects with 'value' and 'title' properties.
 */
export function _getNumberedPropertiesOptions(t) {
  return [
    {
      value: "default-list",
      title: t("Default"),
    },
    {
      value: "maroon",
      title: t("Maroon"),
    },
    {
      value: "light-smokemode",
      title: t("Gray 1"),
    },
    {
      value: "smokemode",
      title: t("Gray 2"),
    },
    {
      value: "darkmode",
      title: t("Gray 7"),
    },
    {
      value: "darkmode-gold",
      title: t("Gray 7 Gold"),
    },
    {
      value: "stp-default",
      title: t("Step List Default"),
    },
    {
      value: "stp-gold-counter",
      title: t("Step List Gold Counter"),
    },
    {
      value: "stp-maroon-counter",
      title: t("Step List Maroon Counter"),
    },
    {
      value: "stp-smokemode",
      title: t("Step List Gray 2"),
    },
    {
      value: "stp-smokemode-gold",
      title: t("Step List Gray 2 Gold Counter"),
    },
    {
      value: "stp-smokemode-maroon",
      title: t("Step List Gray 2 Maroon Counter"),
    },
    {
      value: "stp-lightsmokemode",
      title: t("Step List Gray 1"),
    },
    {
      value: "stp-lightsmokemode-gold",
      title: t("Step List Gray 1 Gold Counter"),
    },
    {
      value: "stp-lightsmokemode-maroon",
      title: t("Step List Gray 1 Maroon Counter"),
    },
    {
      value: "stp-darkmode",
      title: t("Step List Gray 7"),
    },
    {
      value: "stp-darkmode-gold",
      title: t("Step List Gray 7 Gold Counter"),
    },
  ];
}

/**
 * Formats the style number class.
 *
 * @param {string} styleClass - The style class to format.
 * @return {string} The formatted style number class.
 */
export function _formatStyleNumberedClass(styleClass) {
  // Get select value.
  let numberedClass = styleClass;
  // Use 'default-list' if numberedClass is empty
  numberedClass = numberedClass || "default-list";
  // Add class to be identified from.
  let stclass = _removeKeyClass(styleClass);

  // Add the class to be identified.
  stclass = `wp-${styleClass}`;

  // If value starts with stp its a step value.
  if (numberedClass.startsWith("stp")) {
    stclass += " uds-list uds-steplist";

    // Remove NLR clases.
    if (numberedClass === "stp-default") {
      // Remove NLR classes.
      stclass = _removeClassesFromString(stclass, [
        "uds-steplist-gold",
        "uds-steplist-maroon",
        "smokemode",
        "light-smokemode",
        "darkmode",
        "maroon",
      ]);
    }
    // Default gold.
    if (numberedClass === "stp-gold-counter") {
      // Remove NLR classes.
      stclass = _removeClassesFromString(stclass, [
        "uds-steplist-maroon",
        "smokemode",
        "light-smokemode",
        "darkmode",
      ]);

      // Add classes.
      stclass += " uds-steplist-gold";
    }
    // Default maroon.
    if (numberedClass === "stp-maroon-counter") {
      // Remove NLR classes.
      stclass = _removeClassesFromString(stclass, [
        "uds-steplist-gold",
        "smokemode",
        "light-smokemode",
        "darkmode",
      ]);

      // Add classes.
      stclass += " uds-steplist-maroon";
    }
    // Smoke mode.
    if (numberedClass === "stp-smokemode") {
      // Remove NLR classes.
      stclass = _removeClassesFromString(stclass, [
        "uds-steplist-gold",
        "uds-steplist-maroon",
        "light-smokemode",
        "darkmode",
      ]);

      // Add classes.
      stclass += " smokemode";
    }
    // Smoke mode gold.
    if (numberedClass === "stp-smokemode-gold") {
      // Remove NLR classes.
      stclass = _removeClassesFromString(stclass, [
        "uds-steplist-maroon",
        "light-smokemode",
        "darkmode",
      ]);

      // Add classes.
      stclass += " smokemode uds-steplist-gold";
    }
    // Smoke mode maroon.
    if (numberedClass === "stp-smokemode-maroon") {
      // Remove NLR classes.
      stclass = _removeClassesFromString(stclass, [
        "uds-steplist-maroon",
        "light-smokemode",
        "darkmode",
      ]);

      // Add classes.
      stclass += " smokemode uds-steplist-maroon";
    }
    // Light Smoke mode.
    if (numberedClass === "stp-lightsmokemode") {
      // Remove NLR classes.
      stclass = _removeClassesFromString(stclass, [
        "uds-steplist-gold",
        "uds-steplist-maroon",
        "smokemode",
        "darkmode",
      ]);

      // Add classes.
      stclass += " light-smokemode";
    }
    // Light Smoke mode gold.
    if (numberedClass === "stp-lightsmokemode-gold") {
      // Remove NLR classes.
      stclass = _removeClassesFromString(stclass, [
        "uds-steplist-maroon",
        "smokemode",
        "darkmode",
      ]);

      // Add classes.
      stclass += " light-smokemode uds-steplist-gold";
    }
    // Light Smoke mode maroon.
    if (numberedClass === "stp-lightsmokemode-maroon") {
      // Remove NLR classes.
      stclass = _removeClassesFromString(stclass, [
        "uds-steplist-gold",
        "smokemode",
        "darkmode",
      ]);
      // Add classes.
      stclass += " light-smokemode uds-steplist-maroon";
    }
    // Darkmode.
    if (numberedClass === "stp-darkmode") {
      // Remove NLR classes.
      stclass = _removeClassesFromString(stclass, [
        "uds-steplist-gold",
        "uds-steplist-maroon",
        "light-smokemode",
        "darkmode",
      ]);
      // Add classes.
      stclass += " darkmode";
    }
    // Darkmode gold.
    if (numberedClass === "stp-darkmode-gold") {
      // Remove NLR classes.
      stclass = _removeClassesFromString(stclass, [
        "uds-steplist-maroon",
        "smokemode",
        "light-smokemode",
      ]);
      // Add classes.
      stclass += " darkmode uds-steplist-gold";
    }
  } else {
    // Remove step list elements.
    stclass = _removeClassesFromString(stclass, [
      "uds-steplist",
      "uds-steplist-maroon",
      "uds-steplist-gold",
    ]);
    // Add class after removing existing class.
    if (numberedClass) {
      // Ensure the step list class is not applied.
      // Add remove classes as required.
      const removeList = [
        "default-list",
        "maroon",
        "light-smokemode",
        "smokemode",
        "darkmode",
      ];

      for (const removeClass of removeList) {
        if (stclass.includes(removeClass) && numberedClass !== removeClass) {
          stclass = stclass.replace(removeClass, "");
        }
      }
      if (
        stclass.includes("darkmode") &&
        stclass.includes("gold") &&
        numberedClass != "darkmode-gold"
      ) {
        // element.removeClass("darkmode");
        //element.removeClass("gold");
        stclass = _removeClassesFromString(stclass, [
          "darkmode",
          "gold",
        ]);
      }
      if (numberedClass === "darkmode-gold") {
        stclass += " darkmode gold";
      } else {
        stclass += " " + numberedClass;
      }
    }
    // Apply uds-list class if element does not have it.
    if (!stclass.includes("uds-list")) {
      stclass += " uds-list";
    }
  }
  return stclass;
}

/**
 * Removes specified classes from a string.
 *
 * @param {string} element - The input string from which to remove classes.
 * @param {Array} classesToRemove - An array of classes to be removed.
 * @return {string} - The modified string with classes removed.
 */
export function _removeClassesFromString(element, classesToRemove) {
  let result = element;
  for (const classToRemove of classesToRemove) {
    const pattern = new RegExp(classToRemove, "g");
    result = element.replace(pattern, "");
  }
  return result;
}

/**
 * Remove all words starting with "wp-" from the given element.
 *
 * @param {string} element - The element to remove words from.
 * @return {string} The modified element with words removed.
 */
export function _removeKeyClass(element) {
  // Define a regular expression pattern to match words starting with "wp-"
  let pattern = /\bwp-\w+\b/g;
  // Use the replace method to remove all words that match the pattern
  return element ? element.replace(pattern, "") : "";
}