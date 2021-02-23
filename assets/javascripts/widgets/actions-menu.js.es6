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
  _onChange(params) {
    this.sendWidgetAction("closeActionsMenu");
  if (this.attrs.onChange) {
    if (typeof this.attrs.onChange === "string") {
      this.sendWidgetAction(this.attrs.onChange, params);
    } else {
      this.attrs.onChange(params);
    }
  }
},
  tagName: "div.menu-panel",
  template: hbs`
  <div class='panel-body'>
  <div class='panel-body-contents'>
  {{attach
  widget="actions-dropdown-body"
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
export const ActionsDropdownItemClass = {
  tagName: "div",

  transform(attrs) {
    return {
      content:
        attrs.item === "separator"
          ? "<hr>"
          : attrs.item.html
          ? attrs.item.html
          : attrs.item.translatedLabel
          ? attrs.item.translatedLabel
          : I18n.t(attrs.item.label),
    };
  },

  buildAttributes(attrs) {
    return {
      "data-id": attrs.item.id,
      tabindex: attrs.item === "separator" ? -1 : 0,
    };
  },

  buildClasses(attrs) {
    return [
      "actions-dropdown-item",
      attrs.item === "separator" ? "separator" : `item-${attrs.item.id}`,
    ].join(" ");
  },

  keyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.sendWidgetAction("_onChange", this.attrs.item);
    }
  },

  click(event) {
    event.preventDefault();
    console.log("actionsitemclick")
    this.sendWidgetAction("_onChange", this.attrs.item);
  },

  template: hbs`
    {{#if attrs.item.icon}}
      {{d-icon attrs.item.icon}}
    {{/if}}
    {{{transformed.content}}}
  `,
};

createWidget("actions-dropdown-item", ActionsDropdownItemClass);

export const ActionsDropdownBodyClass = {
  tagName: "div",

  buildClasses(attrs) {
    return `actions-dropdown-body ${attrs.class || ""}`;
  },
  template: hbs`
    {{#each attrs.content as |item|}}
      {{attach
        widget="actions-dropdown-item"
        attrs=(hash item=item)
      }}
    {{/each}}
  `,
};

createWidget("actions-dropdown-body", ActionsDropdownBodyClass);
