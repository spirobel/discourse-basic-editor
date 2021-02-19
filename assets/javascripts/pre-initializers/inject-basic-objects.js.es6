import { withPluginApi } from "discourse/lib/plugin-api";
import EmberObject from "@ember/object";
import { computed } from "@ember/object";
import { getOwner } from 'discourse-common/lib/get-owner';
import { iconNode } from "discourse-common/lib/icon-library";
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

api.reopenWidget("header",{
  toggleActionsMenu(){
    this.state.actionsVisible = !this.state.actionsVisible;
    this.toggleBodyScrolling(this.state.actionsVisible);
    console.log("actions")
  },
})
 api.reopenWidget("header-icons", {
       html(attrs) {
        let su = this._super(attrs)
        const actions = this.attach("header-dropdown", {
          title: "actions.title",
          icon: "edit",
          iconId: "toggle-actions-menu",
          action: "toggleActionsMenu",
          active: attrs.actionsVisible,
          href: "",
          classNames: ["actions-dropdown"],
        });
        su.splice(1, 0, actions);
        return su;
       },
   });

 api.addHeaderPanel('actions-menu', 'actionsVisible', function(attrs, state) {
    return { name: attrs.name, description: state.description };
 });


}
export default {
  name: "inject-basic-objects",
  after: "inject-discourse-objects",
    initialize(container, app) {
      withPluginApi("0.8.31", injectBasicObjects);

    },
  };
