export default Ember.Component.extend({
  didInsertElement() {
    ClassicEditor.create( document.querySelector( '#editor' ) )
        .then( editor => {
            console.log( editor );
            editor.setData("smndfnksdf _test_")
            editor.model.document.on( 'change:data', () => {
                console.log(editor.getData());
            } );



        } )
        .catch( error => {
            console.error( error );
        } );
  }

});
