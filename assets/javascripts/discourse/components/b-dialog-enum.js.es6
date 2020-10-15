import discourseComputed from "discourse-common/utils/decorators";
export default Ember.Component.extend({

  value: {
    fields: [1]
  },
  actions:{
    enumChanged(name, selectedObject){
      this.set('valuename', name)
      this.set('value', selectedObject)

      console.log(selectedObject)
      console.log(this.value)
    }
  }
});
