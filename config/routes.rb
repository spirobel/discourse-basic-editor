require_dependency "discourse_basic_editor_constraint"

DiscourseBasicEditor::Engine.routes.draw do
  get "/" => "discourse_basic_editor#index", constraints: DiscourseBasicEditorConstraint.new
  get "/actions" => "actions#index", constraints: DiscourseBasicEditorConstraint.new
  get "/actions/:id" => "actions#show", constraints: DiscourseBasicEditorConstraint.new
end
