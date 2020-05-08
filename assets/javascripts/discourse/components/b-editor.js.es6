import loadScript from "discourse/lib/load-script";

export default Ember.Component.extend({
  didInsertElement() {
  loadScript("/plugins/DiscourseBasicEditor/ckeditor.js").then(() => {
    ClassicEditor.create( document.querySelector( '#editor' ) )
        .then( function(editor){
            console.log( editor );
            editor.setData(this.value)
            editor.model.document.on( 'change:data', function() {
                console.log(editor.getData());
                console.log(this.validation)
                this.set('value', editor.getData());
            }.bind(this) );



        }.bind(this) )
        .catch( error => {
            console.error( error );
        });
     });
   }

});
