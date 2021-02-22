import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";
import { h } from "virtual-dom";
import I18n from "I18n";
import { later } from "@ember/runloop";

export const ActionsMenuClass = {
  settings: {
    showCategories: true,
    maxWidth: 400,
    showFAQ: true,
    showAbout: true,
  },
  panelContents(){
    return this.attach("actions-panel-content",this.attrs)
  },
  html() {
    return this.attach("actions-panel-content",this.attrs)

/*
    return this.attach("menu-panel", {
      contents: () => this.panelContents() ,
      maxWidth: this.settings.maxWidth,
    });
*/
  },

  clickOutsideMobile(e) {
    const $centeredElement = $(document.elementFromPoint(e.clientX, e.clientY));
    if (
      $centeredElement.parents(".panel").length &&
      !$centeredElement.hasClass("header-cloak")
    ) {
      this.sendWidgetAction("toggleActionsMenu");
    } else {
      const $window = $(window);
      const windowWidth = $window.width();
      const $panel = $(".menu-panel");
      $panel.addClass("animate");
      const panelOffsetDirection = this.site.mobileView ? "left" : "right";
      $panel.css(panelOffsetDirection, -windowWidth);
      const $headerCloak = $(".header-cloak");
      $headerCloak.addClass("animate");
      $headerCloak.css("opacity", 0);
      later(() => this.sendWidgetAction("toggleActionsMenu"), 200);
    }
  },

  clickOutside(e) {
    if (this.site.mobileView) {
      this.clickOutsideMobile(e);
    } else {
      this.sendWidgetAction("toggleActionsMenu");
    }
  },
};
createWidget("actions-menu", ActionsMenuClass)
createWidget("actions-panel-content",{
  init(attrs) {
    attrs.role.actions.forEach(a =>{
      a.translatedLabel = a.name;
    })
  },
  buildAttributes(attrs) {
     return { "data-max-width": 400 };

  },
  tagName: "div.menu-panel",
  template: hbs`
  <div class='panel-body'>
  <div class='panel-body-contents'>
  {{attach
  widget="widget-dropdown-body"
  attrs=(hash
    id="actions-array"
    class="opened"
    content=attrs.role.actions
  )
}}
  <ul class="panel-actions-collection">
  {{#each attrs.role.actions as  |action|}}
  <li class="panel-actions-row is-highlighted">
 <div class="icon">
     {{d-icon action.icon translatedtitle=(dasherize title)}}
 </div>
<div class="texts">
 <span class="name">{{action.name}}</span>
 <span class="desc">{{action.description}}</span>
</div>
</li>
{{/each}}
</ul>
</div>
</div>
  `,
})
