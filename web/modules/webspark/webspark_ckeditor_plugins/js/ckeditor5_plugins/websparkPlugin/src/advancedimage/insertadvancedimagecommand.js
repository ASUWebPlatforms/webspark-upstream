/**
 * @file defines InsertWebsparkAdvancedImageCommand.
 */
import { Command } from "ckeditor5/src/core";

export default class InsertWebsparkAdvancedImageCommand extends Command {
  /**
   * Executes the function with the given parameters.
   *
   * @param {number} spacingtop - the spacing from the top
   * @param {number} spacingbottom - the spacing from the bottom
   * @param {number} spacingleft - the spacing from the left
   * @param {number} spacingright - the spacing from the right
   * @param {boolean} roundedimage - whether the image is rounded or not
   */
  execute({
    spacingtop,
    spacingbottom,
    spacingleft,
    spacingright,
    roundedimage,
  }) {
    const { model } = this.editor;

    model.change((writer) => {
      const selectedElement = model.document.selection.getSelectedElement();

      if (selectedElement) {
        writer.setAttribute("spacingTop", spacingtop, selectedElement);
        writer.setAttribute("spacingBottom", spacingbottom, selectedElement);
        writer.setAttribute("spacingRight", spacingright, selectedElement);
        writer.setAttribute("spacingLeft", spacingleft, selectedElement);
        writer.setAttribute("roundedImage", roundedimage, selectedElement);
      }
    });
  }

  /**
   * Refreshes the editor by updating the model and selection.
   *
   * @return {void}
   */
  refresh() {
    const { model } = this.editor;
    const { selection } = model.document;

    const imageTypes = ["imageInline", "imageBlock"];

    const allowedIn = imageTypes.some((type) =>
      model.schema.findAllowedParent(selection.getFirstPosition(), type)
    );

    this.isEnabled = allowedIn !== null;

    const selectedElement = selection.getSelectedElement();

    if (
      selectedElement?.name === "imageBlock" ||
      selectedElement?.name === "imageInline"
    ) {
      this.value = Object.fromEntries(selectedElement.getAttributes());

      model.change((writer) => {
        writer.setAttribute("imageFluid", true, selectedElement);
      });
    } else {
      this.value = null;
    }
  }
}
