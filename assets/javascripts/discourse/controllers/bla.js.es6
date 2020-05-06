import Controller from "@ember/controller";
import loadScript from "discourse/lib/load-script";

export default Controller.extend({
  init: function () {
    this._super();

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
});
