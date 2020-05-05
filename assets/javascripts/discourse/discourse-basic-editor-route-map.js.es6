export default function() {
  this.route("discourse-basic-editor", function() {
    this.route("actions", function() {
      this.route("show", { path: "/:id" });
    });
  });
};
