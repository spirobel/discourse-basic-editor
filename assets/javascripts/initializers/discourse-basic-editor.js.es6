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
import { once } from "@ember/runloop";

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
      if (this.model == null) return;
      if( this.model || this.model.category || this.model.category.replace_preview ){
       this.set("showPreview", false);
     }
    },
  });
  //TODO this needs to be amended to work with arrays of setup and save functions so that
  //we can compose multiple plugins
  //CREATE
api.onAppEvent('topic:created', function(createdPost,composer){
    if(!composer.category ){return;}
    let b = composer.category.basic_editor
    if (composer.topicFirstPost && b != "" && composer.siteSettings[b +  "_full_editor"]){
      if(composer["save_" + b])
        {composer["save_" + b](createdPost.topic_id).then(function(result){
          this.refreshCategoryTopic(result)
        }.bind(composer));}
    }
});
//UPDATE
//also:this.action: "edit" and this.topic.id
//topic.currentPost: 1
 api.composerBeforeSave(function() {
   if(!this.category ){return Promise.resolve();}
   let b = composer.category.basic_editor
   if (this.action == 'edit' && this.topicFirstPost && b != "" && this.siteSettings[b +  "_full_editor"]) {
     if(this["save_" + b])
       { return this["save_" + b](this.topic.id).then(function(result){
         this.refreshCategoryTopic(result)
       }.bind(this));}
    }
    return Promise.resolve();
 });
api.modifyClass("model:composer",{
  refreshCategoryTopic(result){
    //refresh topic
    result.target.appEvents.trigger("post-stream:refresh", {
      id: parseInt(result.responseJson.id, 10)
    });
    //refresh category
    Category.reloadById(this.categoryId).then(atts => {
        const model = this.store.createRecord("category", atts.category);
        model.setupGroupsAndPermissions();
        this.site.updateCategory(model);
      });
 },
  @observes("categoryId")
  catIdChanged() {
    // if this.category this.category.basic_editor
    if(!this.category) {return;}
     let b = this.category.basic_editor
     if (this.topicFirstPost && b != "" && this.siteSettings[b +  "_full_editor"])
      {
      if(this["setup_" + b])
        {once(this,"setup_" + b)}
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
