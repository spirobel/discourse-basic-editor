import { withPluginApi } from "discourse/lib/plugin-api";
import Composer from 'discourse/models/composer';
import loadScript from "discourse/lib/load-script";
import discourseComputed, {  observes,  on } from "discourse-common/utils/decorators";
import ComposerEditor from "discourse/components/composer-editor";
import putCursorAtEnd from "discourse/lib/put-cursor-at-end";
import { debounce, later, next, schedule, throttle } from "@ember/runloop";
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

  api.modifyClass("component:composer-editor", {
    @on("didInsertElement")
      _composerEditorInit() {
        Ember.run.later(this, (function() {
          const $input = $(this.element.querySelector(".ck-editor__editable_inline"));
          const $preview = $(this.element.querySelector(".d-editor-preview-wrapper"));


          if (this._enableAdvancedEditorPreviewSync()) {
            this._initInputPreviewSync($input, $preview);
          } else {
            $input.on("scroll", () =>
              throttle(this, this._syncEditorAndPreviewScroll, $input, $preview, 20)
            );
          }



          this._bindUploadTarget();
          this.appEvents.trigger("composer:will-open");
        }), 50);

      },
  });

}
export default {
  name: "discourse-basic-editor",

  initialize() {
    withPluginApi("0.8.31", initializeDiscourseBasicEditor);
  }
};
