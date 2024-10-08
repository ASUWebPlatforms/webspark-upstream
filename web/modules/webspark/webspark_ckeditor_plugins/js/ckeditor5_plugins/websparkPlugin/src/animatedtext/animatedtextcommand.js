import { Command } from "ckeditor5/src/core";

/**
 * The highlight command. It is used by the {@link module:highlight/highlightediting~HighlightEditing highlight feature}
 * to apply the text highlighting.
 *
 * ```ts
 * editor.execute( 'highlight', { value: 'greenMarker' } );
 * ```
 *
 * **Note**: Executing the command without a value removes the attribute from the model. If the selection is collapsed
 * inside a text with the highlight attribute, the command will remove the attribute from the entire range
 * of that text.
 */
export default class AnimatedTextCommand extends Command {
	/**
	 * A value indicating whether the command is active. If the selection has some highlight attribute,
	 * it corresponds to the value of that attribute.
	 */
	constructor(editor) {
		super(editor);
		this.value = undefined;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = doc.selection.getAttribute('highlight');
		this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, 'highlight');
	}

	/**
	 * Executes the command.
	 *
	 * @param {Object} options Options for the executed command.
	 * @param {string|null} [options.value] The value to apply.
	 *
	 * @fires execute
	 */
	execute(options = {}) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const highlighter = options.value;

		model.change(writer => {
			if (selection.isCollapsed) {
				const position = selection.getFirstPosition();

				// When selection is inside text with `highlight` attribute.
				if (selection.hasAttribute('highlight')) {
					// Find the full highlighted range.
					const isSameHighlight = value => {
						return value.item.hasAttribute('highlight') && value.item.getAttribute('highlight') === this.value;
					};

					const highlightStart = position.getLastMatchingPosition(isSameHighlight, { direction: 'backward' });
					const highlightEnd = position.getLastMatchingPosition(isSameHighlight);

					const highlightRange = writer.createRange(highlightStart, highlightEnd);

					// Then depending on current value...
					if (!highlighter || this.value === highlighter) {
						// ...remove attribute when passing highlighter different then current or executing "eraser".

						// If we're at the end of the highlighted range, we don't want to remove highlight of the range.
						if (!position.isEqual(highlightEnd)) {
							writer.removeAttribute('highlight', highlightRange);
						}

						writer.removeSelectionAttribute('highlight');
					} else {
						// ...update `highlight` value.

						// If we're at the end of the highlighted range, we don't want to change the highlight of the range.
						if (!position.isEqual(highlightEnd)) {
							writer.setAttribute('highlight', highlighter, highlightRange);
						}

						writer.setSelectionAttribute('highlight', highlighter);
					}
				} else if (highlighter) {
					writer.setSelectionAttribute('highlight', highlighter);
				}
			} else {
				const ranges = model.schema.getValidRanges(selection.getRanges(), 'highlight');

				for (const range of ranges) {
					if (highlighter) {
						writer.setAttribute('highlight', highlighter, range);
					} else {
						writer.removeAttribute('highlight', range);
					}
				}
			}
		});
	}
}
