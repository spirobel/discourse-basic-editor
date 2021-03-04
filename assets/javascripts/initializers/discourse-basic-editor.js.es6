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
import Category from "discourse/models/category";
import { setDefaultHomepage } from "discourse/lib/utilities";
function initializeDiscourseBasicEditor(api) {
  // https://github.com/discourse/discourse/blob/master/app/assets/javascripts/discourse/lib/plugin-api.js.es6
  loadScript("/plugins/DiscourseBasicEditor/ckeditor.js")
  if(Discourse.SiteSettings.basic_editor_home_component){
    setDefaultHomepage('/');
  }
  api.reopenWidget("hamburger-menu", {

      html() {
          ///todo: move lookup to init?
        //Todo lookup current role
        console.log("hampanel",this)
         let r = this.register.lookup('roles:vanilla')
         console.log(r)
        return this.attach("actions-panel-content", {
          id: "reactions",
          role: r,
        });
      },
  });
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
//UPDATE
//also:this.action: "edit" and this.topic.id
//topic.currentPost: 1
//todo insert formversion into json
 api.composerBeforeSave(function() {
   if(!this.category ){return Promise.resolve();}
   let b = this.category.replace_editor
   if (this.topicFirstPost && b != "") {
     if(this["save_" + b])
       { return this["save_" + b]().then(function(result){
         this.set("reply", JSON.stringify(Object.assign({}, result)));
         return Promise.resolve()
       }.bind(this));}
    }
    return Promise.resolve();
 });
api.modifyClass("model:composer",{
  @observes("categoryId","loading")
  composeInit() {
    if(this.loading != false || !this.category ) return;

     let b = this.category.replace_editor
     if (this.topicFirstPost && b != "")
      {
      if(this["setup_" + b])
        {
          let raw = {}
          try {
            raw =  JSON.parse(this.post.raw)
          }
          catch(err) {
            raw = {}
          }
          once(this,"setup_" + b,raw)
        }
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
       let b = this.category.replace_editor
       if (topicFirstPost && b != "")
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
