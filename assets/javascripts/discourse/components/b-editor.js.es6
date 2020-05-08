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
  didInsertElement() {
  loadScript("/plugins/DiscourseBasicEditor/ckeditor.js").then(() => {
    ClassicEditor.create( document.querySelector( '#editor' ) )
        .then( function(editor){
            console.log( editor );
            editor.setData(this.value)
            this._updatePreview();
            editor.model.document.on( 'change:data', function() {
                console.log(editor.getData());
                console.log(this.validation)
                this.set('value', editor.getData());

                // Debouncing in test mode is complicated
                if (ENV.environment === "test") {
                  this._updatePreview();
                } else {
                  debounce(this, this._updatePreview, 30);
                }



            }.bind(this) );



        }.bind(this) )
        .catch( error => {
            console.error( error );
        });
     });
   }

});
