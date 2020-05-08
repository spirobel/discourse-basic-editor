import { withPluginApi } from "discourse/lib/plugin-api";
import Composer from 'discourse/models/composer';
import loadScript from "discourse/lib/load-script";

import discourseComputed, {
  observes,
  on
} from "discourse-common/utils/decorators";
function initializeDiscourseBasicEditor(api) {
  // https://github.com/discourse/discourse/blob/master/app/assets/javascripts/discourse/lib/plugin-api.js.es6
loadScript("/plugins/DiscourseBasicEditor/ckeditor.js")

  api.modifyClass("controller:composer", {
    @on("init")
_setupPreview() {
  const val = this.site.mobileView
    ? false
    : this.keyValueStore.get("composer.showPreview") || false;
  this.set("showPreview", val === "true");
},
  });

}

export default {
  name: "discourse-basic-editor",

  initialize() {
    withPluginApi("0.8.31", initializeDiscourseBasicEditor);
  }
};
