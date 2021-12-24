import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("DiscourseBasicEditor", { loggedIn: true });

test("DiscourseBasicEditor works", async assert => {
  await visit("/admin/plugins/discourse-basic-editor");

  assert.ok(false, "it shows the DiscourseBasicEditor button");
});
