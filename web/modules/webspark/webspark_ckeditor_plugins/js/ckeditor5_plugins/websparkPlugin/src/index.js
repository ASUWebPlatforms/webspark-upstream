/**
 * @file The build process always expects an index.js file. Anything exported
 * here will be recognized by CKEditor 5 as an available plugin. Multiple
 * plugins can be exported in this one file.
 *
 * I.e. this file's purpose is to make plugin(s) discoverable.
 */

import WebsparkButton from "./button/websparkbutton";
import WebsparkDivider from "./divider/websparkdivider";
import WebsparkLead from "./lead/websparklead";
import WebsparkHighlightedHeading from "./heading/websparkhighlightedheading";
import WebsparkBlockquote from "./quote/websparkblockquote";
import WebsparkTable from "./table/websparktable";
import WebsparkAdvancedImage from "./advancedimage/websparkadvancedimage";
import WebsparkMediaAlter from "./mediaalter/websparkmediaalter";
import WebsparkListStyle from "./liststyle/websparkliststyle";
import WebsparkAnimatedText from "./animatedtext/websparkanimatedtext";
import WebsparkBlockquoteAnimated from "./quoteanimated/websparkblockquoteanimated";

export default {
  WebsparkButton,
  WebsparkDivider,
  WebsparkLead,
  WebsparkHighlightedHeading,
  WebsparkBlockquote,
  WebsparkTable,
  WebsparkAdvancedImage,
  WebsparkMediaAlter,
  WebsparkListStyle,
  WebsparkAnimatedText,
  WebsparkBlockquoteAnimated,
};
