import { withPluginApi } from "discourse/lib/plugin-api";
import EmberObject from "@ember/object";
import { computed } from "@ember/object";
import { getOwner } from 'discourse-common/lib/get-owner';

function injectBasicObjects(api) {
  let VanillaRole = EmberObject.extend({
    init() {
      //initialize actions actionsArray
      let items = []
      items.push({
       name: I18n.t(
         "composer.basic_actions.vanilla_cat.label"
       ),
       description: I18n.t(
         "composer.basic_actions.vanilla_cat.desc"
       ),
       icon: "cat",
       id: "summon_a_vanilla_cat",
     });
     this.actions = items;
    }
  });
api.container.registry.register('roles:vanilla', VanillaRole)

  api.modifyClass("component:composer-actions", {
      content: computed(function() { //this needs to be computed(function(seq)when updating to master
      let vanilla = getOwner(this).lookup("roles:vanilla");
     return vanilla.actions;
   })
 });
}
export default {
  name: "inject-basic-objects",
  after: "inject-discourse-objects",
    initialize(container, app) {
      withPluginApi("0.8.31", injectBasicObjects);

    },
  };
