export default Ember.Component.extend({
  didInsertElement() {
    ClassicEditor.create( document.querySelector( '#editor' ) )
        .then( function(editor){
            console.log( editor );
            editor.setData(this.value)
            editor.model.document.on( 'change:data', () => {
                console.log(editor.getData());
                this.set('value', editor.getData());
            } );



        }.bind(this) )
        .catch( error => {
            console.error( error );
        } );
  }

});
