import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";
import { h } from "virtual-dom";
import I18n from "I18n";
import { later } from "@ember/runloop";

export const ActionsMenuClass = {
  buildKey: (attrs) => `actions-menu-${attrs.id}`,
  html() {
    return this.attach("actions-panel-content",this.attrs)
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
      later(() => this.sendWidgetAction("closeActionsMenu"), 200);
    }
  },

  clickOutside(e) {
    if (this.site.mobileView) {
      this.clickOutsideMobile(e);
    } else {
      this.sendWidgetAction("closeActionsMenu");
    }
  },
};
createWidget("actions-menu", ActionsMenuClass)
createWidget("actions-panel-content",{
  buildKey: (attrs) => `actions-panel-content-${attrs.id}`,
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
  <div class='actions-dropdown'>
  {{attach
  widget="actions-dropdown-body"
  attrs=(hash
    id="actions-array"
    class="opened"
    content=attrs.role.actions
  )
}}
</div>
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
  <div class="icons">
      {{d-icon attrs.item.icon}}
</div>
    <div class="texts">
     <span class="name">{{attrs.item.name}}</span>
     <span class="desc">{{attrs.item.description}}</span>
    </div>

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
