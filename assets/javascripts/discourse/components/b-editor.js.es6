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
            'redo'
          ]
        ,
        table: {
          contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
          ]
        }
        })
          .then( function(editor){
      function calc_editor_size() {
            var bla = $(".b-editor-textarea-wrapper").innerHeight()
            var sib_height = 0;
            $(".ck-editor__main").siblings().each(function ()
            {
              sib_height += $(this).height();

            });

            var edit_h= bla- sib_height - 5

              this.editing.view.change(writer=>{
                  writer.setStyle('height', edit_h +"px" , this.editing.view.document.getRoot());
              });

            }

            calc_editor_size.bind(editor)();


              this.appEvents.on("composer:resized", editor, function(){
                debounce(this, calc_editor_size, 30);

              });
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
