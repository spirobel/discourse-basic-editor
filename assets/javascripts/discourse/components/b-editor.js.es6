import loadScript from "discourse/lib/load-script";
import { cookAsync } from "discourse/lib/text";
import { debounce, later, next, schedule, scheduleOnce } from "@ember/runloop";
import ENV from "discourse-common/config/environment";
export default Ember.Component.extend({
  classNames: ["d-editor"],
  _updatePreview() {
    if (this._state !== "inDOM") {
      return;
    }

    const value = this.value;
    const markdownOptions = this.markdownOptions || {};

    cookAsync(value, markdownOptions).then(cooked => {
      if (this.isDestroyed) {
        return;
      }
      this.set("preview", cooked);
      schedule("afterRender", () => {
        if (this._state !== "inDOM") {
          return;
        }
        const $preview = $(this.element.querySelector(".d-editor-preview"));
        if ($preview.length === 0) return;

        if (this.previewUpdated) {
          this.previewUpdated($preview);
        }
      });
    });
  },
  setupBasicEditor(){
    loadScript("/plugins/DiscourseBasicEditor/ckeditor.js").then(() => {
      ClassicEditor.create( document.querySelector( '#editor' ), {
        toolbar:  [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'indent',
            'outdent',
            '|',
            'blockQuote',
            'insertTable',
            'undo',
            'redo',
            'testlabel'
          ]
        ,
        table: {
          contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
          ]
        },
        toolbarItems: [
        	{
        		label: 'testlabel',
        		icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6.999 2H15a1 1 0 0 1 0 2h-1.004v13a1 1 0 1 1-2 0V4H8.999v13a1 1 0 1 1-2 0v-7A4 4 0 0 1 3 6a4 4 0 0 1 3.999-4z"/></svg>',
        		onClick: function() {
        		console.log("blah onClick")
        		}
        	},
        ]
        })
          .then( function(editor){

            editor.ui.view.element.id = "editor_container"

              editor.setData(this.value)
              this._updatePreview();
              editor.model.document.on( 'change:data', function() {
                  this.set('value', editor.getData());

                  // Debouncing in test mode is complicated
                  if (ENV.environment === "test") {
                    this._updatePreview();
                  } else {
                    debounce(this, this._updatePreview, 30);
                  }



              }.bind(this) );
              // Focus on the body unless we have a title
              if (!this.get("composer.canEditTitle")) {
                editor.editing.view.focus()
              }


          }.bind(this) )
          .catch( error => {
              console.error( error );
          });
       });
  },

  didInsertElement() {
    this.setupBasicEditor();
   }

});
