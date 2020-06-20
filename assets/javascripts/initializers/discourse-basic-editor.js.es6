import { withPluginApi } from "discourse/lib/plugin-api";
import Composer from 'discourse/models/composer';
import loadScript from "discourse/lib/load-script";
import discourseComputed, {  observes,  on } from "discourse-common/utils/decorators";
import ComposerEditor from "discourse/components/composer-editor";
import putCursorAtEnd from "discourse/lib/put-cursor-at-end";
import { debounce, later, next, schedule, throttle } from "@ember/runloop";
import { findRawTemplate } from "discourse/lib/raw-templates";
import { onToolbarCreate } from 'discourse/components/d-editor';
import { getOwner } from 'discourse-common/lib/get-owner';

function initializeDiscourseBasicEditor(api) {
  // https://github.com/discourse/discourse/blob/master/app/assets/javascripts/discourse/lib/plugin-api.js.es6
  loadScript("/plugins/DiscourseBasicEditor/ckeditor.js")



  api.onToolbarCreate(toolbar => {
      toolbar.addButton({
        id: "basic_editor",
        icon: "cat",
                  group: "extras",
        perform: function(e) {
          const composer = getOwner(this).lookup('controller:composer');
          composer.set('advancedEditor',false)
        }
      });
  });
  api.modifyClass("controller:composer", {
    @on("init")
    _setupPreview() {
      const val = this.site.mobileView
      ? false
      : this.keyValueStore.get("composer.showPreview") || false;
      this.set("showPreview", val === "true");
    },
    @observes("model.category.replace_preview")
    deactivatePreview() {
      if( this.model || this.model.category || this.model.category.replace_preview ){
       this.set("showPreview", false);
     }
    },
  });


api.modifyClass("model:composer",{
  @observes("categoryId")
  catIdChanged() {
    // if this.category this.category.basic_editor
    if(!this.category) {return;}
     let b = this.category.basic_editor
     if (this.topicFirstPost && b != "" && this.siteSettings[b +  "_full_editor"])
      {
      if(this["setup_" + b])
        {this["setup_" + b]();}
      }
},
@discourseComputed(
    "loading",
    "canEditTitle",
    "titleLength",
    "targetRecipients",
    "targetRecipientsArray",
    "replyLength",
    "categoryId",
    "missingReplyCharacters",
    "tags",
    "topicFirstPost",
    "minimumRequiredTags",
    "isStaffUser"
  )
  cantSubmitPost(
    loading,
    canEditTitle,
    titleLength,
    targetRecipients,
    targetRecipientsArray,
    replyLength,
    categoryId,
    missingReplyCharacters,
    tags,
    topicFirstPost,
    minimumRequiredTags,
    isStaffUser
   ) {
      if(!this.category) {return this._super()}
       let b = this.category.basic_editor
       if (topicFirstPost && b != "" && this.siteSettings[b +  "_full_editor"])
        { return false;}
       return this._super();
     },
})
  api.modifyClass("component:composer-editor", {
    @observes("advancedEditor")
      _redrawComposerChange(){
      this._composerEditorInit()
    },
    @on("didInsertElement")
      _composerEditorInit() {
        if(!this.element){return;}
Ember.run.later(this, (function() {
        if(!this.advancedEditor){
          const $input = $(this.element.querySelector(".ck-editor__editable_inline"));
          const $preview = $(this.element.querySelector(".d-editor-preview-wrapper"));


          if (this._enableAdvancedEditorPreviewSync()) {
            this._initInputPreviewSync($input, $preview);
          } else {
            $input.on("scroll", () =>
              throttle(this, this._syncEditorAndPreviewScroll, $input, $preview, 20)
            );
          }



          this.appEvents.trigger("composer:will-open");
      }else {
        const $input = $(this.element.querySelector(".d-editor-input"));
        const $preview = $(this.element.querySelector(".d-editor-preview-wrapper"));

        if (this.siteSettings.enable_mentions) {
          $input.autocomplete({
            template: findRawTemplate("user-selector-autocomplete"),
            dataSource: term => this.userSearchTerm.call(this, term),
            key: "@",
            transformComplete: v => v.username || v.name,
            afterComplete() {
              // ensures textarea scroll position is correct
              schedule("afterRender", () => $input.blur().focus());
            },
            triggerRule: textarea =>
              !inCodeBlock(textarea.value, caretPosition(textarea))
          });
        }

        if (this._enableAdvancedEditorPreviewSync()) {
          this._initInputPreviewSync($input, $preview);
        } else {
          $input.on("scroll", () =>
            throttle(this, this._syncEditorAndPreviewScroll, $input, $preview, 20)
          );
        }

        // Focus on the body unless we have a title
        if (!this.get("composer.canEditTitle")) {
          putCursorAtEnd(this.element.querySelector(".d-editor-input"));
        }

        this._bindUploadTarget();
        this.appEvents.trigger("composer:will-open");
      }
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
