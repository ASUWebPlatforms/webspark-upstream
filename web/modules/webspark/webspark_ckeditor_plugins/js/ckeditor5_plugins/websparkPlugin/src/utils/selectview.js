import { InputView } from "ckeditor5/src/ui";

export class SelectView extends InputView {
  constructor(locale, options, defaultValue) {
    super(locale);

    const bind = this.bindTemplate;

    this.set("value", options[0]?.value || defaultValue);

    const children = options.map((option) => ({
      tag: "option",
      attributes: {
        value: option.value,
        selected: bind.if("value", "", (value) => value === option.value),
      },
      children: [option.title],
    }));

    this.on("select", (_, e) => {
      this.set("value", e.target.value);
    });

    this.setTemplate({
      tag: "select",
      attributes: {
        class: ["ck-webspark-form-select"],
      },
      children,
      on: {
        change: bind.to("select"),
      },
    });
  }
}
