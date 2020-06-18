import loadScript from "discourse/lib/load-script";
import { getOwner } from 'discourse-common/lib/get-owner';
import { cookAsync } from "discourse/lib/text";
import { ajax } from "discourse/lib/ajax";
import { debounce, later, next, schedule, scheduleOnce } from "@ember/runloop";
import ENV from "discourse-common/config/environment";
export default Ember.Component.extend({
  classNames: ["d-editor"],

  setupBasicEditor(){
    loadScript("/plugins/DiscourseBasicEditor/ckeditor.js").then(() => {
      const component = this;
      ClassicEditor.create( document.querySelector( '#editor' ), {
        removePlugins: [ 'DiscourseUpload', 'AdvancedEditor'],
        html: true,
        toolbarItems: [],
        toolbar: {
      		items: [
      			'heading',
      			'|',
      			'bold',
      			'italic',
      			'link',
      			'bulletedList',
      			'numberedList',
      			'blockQuote',
      			'|',
      			'undo',
      			'redo',
      		]
      	},
        })
          .then( function(editor){

            editor.ui.view.element.id = "editor_container"
            console.log(editor.data.processor)
              editor.setData(this.value)
              editor.model.document.on( 'change:data', function() {
                  this.set('value', editor.getData());
                  console.log(this.value);


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
