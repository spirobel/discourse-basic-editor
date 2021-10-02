import loadScript from "discourse/lib/load-script";
import { getOwner } from 'discourse-common/lib/get-owner';
import { cookAsync } from "discourse/lib/text";
import { ajax } from "discourse/lib/ajax";
import getURL from "discourse-common/lib/get-url";
import { schedule } from "@ember/runloop";
import debounce from "discourse/plugins/discourse-basic-editor/lib/debounce";
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
      const component = this;
      ClassicEditor.create( document.querySelector( '#editor' ), {
        disUploader:{
          abort: function(abo){
          	console.log("abort from the outside", this)
          }.bind(this),
          upload: function(file, abo){
            const data = new FormData();
            data.append("type", "composer")
            const isPrivateMessage = this.get("composer.privateMessage");
            if (isPrivateMessage) data.append("for_private_message", true)
            data.append( "files[]", file );

            return ajax(getURL(`/uploads.json?client_id=${this.messageBus.clientId}`), {
              type: "POST",
              data: data,
                    contentType: false,
              processData: false,
              dataType: "json"
            }).then(response => {

              return new Promise( ( resolve, reject ) => {
                //  const response = xhr.response;
                if ( !response || response.error ) {
                  return reject( response && response.error ? response.error.message : "error uploading the file" );
                }
                resolve( {
                  default: response.url
                } );

              } )




}, reason => {

    console.log("ajaxerro",reason)
});


/*        const loader = abo.loader;
                      if ( xhr.upload ) {
                        xhr.upload.addEventListener( 'progress', evt => {
                          if ( evt.lengthComputable ) {
                            loader.uploadTotal = evt.total;
                            loader.uploaded = evt.loaded;
                          }
                        } );
                      }*/



          }.bind(this),
        },
        toolbarItems: [
        	{
        		label: 'Advanced Editor',
        		icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7.3 17.37l-.061.088a1.518 1.518 0 0 1-.934.535l-4.178.663-.806-4.153a1.495 1.495 0 0 1 .187-1.058l.056-.086L8.77 2.639c.958-1.351 2.803-1.076 4.296-.03 1.497 1.047 2.387 2.693 1.433 4.055L7.3 17.37zM9.14 4.728l-5.545 8.346 3.277 2.294 5.544-8.346L9.14 4.728zM6.07 16.512l-3.276-2.295.53 2.73 2.746-.435zM9.994 3.506L13.271 5.8c.316-.452-.16-1.333-1.065-1.966-.905-.634-1.895-.78-2.212-.328zM8 18.5L9.375 17H19v1.5H8z"/></svg>',
        		onClick: function() {
            this.destroy().then(()=>{
              const composer = getOwner(this).lookup('controller:composer');
              composer.set('advancedEditor',true)
            })

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
