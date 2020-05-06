import DiscourseRoute from 'discourse/routes/discourse'

export default DiscourseRoute.extend({
  controllerName: "bla",



  renderTemplate() {
    this.render("discourse-basic-editor");
  }
});
