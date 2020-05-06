import { getOwner } from 'discourse-common/lib/get-owner';
import showModal from "discourse/lib/show-modal";
import { later } from "@ember/runloop";
import loadScript from "discourse/lib/load-script";

export default {
  setupComponent(attrs, component) {

      loadScript("/plugins/DiscourseBasicEditor/ckeditor.js").then(() => {

        Ember.run.later(this, (function() {
          ClassicEditor.create( document.querySelector( '#editor' ) )
              .then( editor => {
                  console.log( editor );
              } )
              .catch( error => {
                  console.error( error );
              } );
        }), 50);

        });

},
  actions: {



 }
}
